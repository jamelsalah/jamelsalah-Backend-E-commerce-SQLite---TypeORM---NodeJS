import { AppDataSource } from "../data-source";
import { LessThan } from "typeorm";
import { Order, PaymentStatus } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { Cart } from "../entities/Cart";
import { User } from "../entities/User";
import { Address } from "../entities/Address";
import { HttpError } from "../utils/HttpError";
import { logger } from "../utils/logger";
import * as sseHub from "../utils/sseHub";
import CartService from "./CartService";

const ASAAS_API_KEY = process.env.ASAAS_API_KEY!;
const ASAAS_BASE_URL = process.env.ASAAS_BASE_URL!;

function PaymentService() {

    const orderRepo = AppDataSource.getRepository(Order);
    const cartRepo = AppDataSource.getRepository(Cart);
    const userRepo = AppDataSource.getRepository(User);
    const addressRepo = AppDataSource.getRepository(Address);

    async function asaasRequest(path: string, method: string, body?: object): Promise<any> {

        const init: RequestInit = {
            method,
            headers: {
                "access_token": ASAAS_API_KEY,
                "Content-Type": "application/json",
            },
        };

        if (body) {
            init.body = JSON.stringify(body);
        }

        const res = await fetch(`${ASAAS_BASE_URL}${path}`, init);
        const data = await res.json() as any;

        if (!res.ok) {
            const msg = data?.errors?.[0]?.description ?? `Asaas error (${res.status})`;
            throw HttpError.badRequest(msg);
        }

        return data;
    }

    async function createAsaasCustomer(data: {
        name: string;
        email: string;
        cpf: string;
    }): Promise<string> {

        const customer = await asaasRequest("/customers", "POST", {
            name: data.name,
            email: data.email,
            cpfCnpj: data.cpf,
        });

        return customer.id;
    }

    async function getOrCreateCustomer(user: User): Promise<string> {

        if (user.asaas_customer_id) {
            return user.asaas_customer_id;
        }

        const customerId = await createAsaasCustomer({
            name: user.name,
            email: user.email,
            cpf: user.cpf,
        });

        user.asaas_customer_id = customerId;
        await userRepo.save(user);

        return customerId;
    }

    async function createPixPayment(userId: number, addressId: number) {

        const user = await userRepo.findOne({ where: { id: userId } });

        if (!user) throw HttpError.notFound("Usuário não encontrado");

        // Se já existe pedido PENDING, devolve o QR Code dele em vez de criar novo
        const pending = await orderRepo.findOne({
            where: { user_id: userId, payment_status: PaymentStatus.PENDING }
        });

        if (pending && pending.asaas_payment_id) {
            const qr = await asaasRequest(
                `/payments/${pending.asaas_payment_id}/pixQrCode`,
                "GET"
            );

            return {
                order_id: pending.id,
                qrCode: qr.encodedImage,
                copyPaste: qr.payload,
                expiresAt: qr.expirationDate,
                amount: pending.price,
            };
        }

        const address = await addressRepo.findOne({
            where: { id: addressId, user_id: userId }
        });

        if (!address) throw HttpError.notFound("Endereço não encontrado");

        const cart = await cartRepo.findOne({
            where: { user: { id: userId } },
            relations: ["items", "items.product"]
        });

        if (!cart || cart.items.length === 0) {
            throw HttpError.badRequest("Carrinho vazio");
        }

        const total = cart.items.reduce((sum, item) => {
            const unitPrice = item.product.promo ?? item.product.price;
            return sum + (unitPrice * item.quantity);
        }, 0);

        if (total <= 0) {
            throw HttpError.badRequest("Não foi possível calcular o total do carrinho");
        }

        const customerId = await getOrCreateCustomer(user);

        const dueDate = new Date().toISOString().split("T")[0];

        const payment = await asaasRequest("/payments", "POST", {
            customer: customerId,
            billingType: "PIX",
            value: total / 100,
            dueDate,
        });

        const qr = await asaasRequest(`/payments/${payment.id}/pixQrCode`, "GET");

        const items: OrderItem[] = cart.items.map(cartItem => {
            const item = new OrderItem();
            item.product_id = cartItem.product.id;
            item.product_name = cartItem.product.name;
            item.unit_price = cartItem.product.promo ?? cartItem.product.price;
            item.quantity = cartItem.quantity;
            item.product_img_url = cartItem.product.img_url;
            return item;
        });

        const order = orderRepo.create({
            user_id: userId,
            price: total,
            payment_method: "pix",
            shipping_postal_code: address.postal_code,
            shipping_city: address.city,
            shipping_state: address.state,
            shipping_address: address.address,
            shipping_number: address.number,
            shipping_complement: address.complement || null,
            payment_status: PaymentStatus.PENDING,
            asaas_payment_id: payment.id,
            items,
        });

        await orderRepo.save(order);

        return {
            order_id: order.id,
            qrCode: qr.encodedImage,
            copyPaste: qr.payload,
            expiresAt: qr.expirationDate,
            amount: total,
        };
    }

    async function handleWebhook(event: { event: string; payment: { id: string } }) {

        const paidEvents = ["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"];
        const failedEvents = ["PAYMENT_OVERDUE", "PAYMENT_DELETED", "PAYMENT_REFUNDED"];

        if (!paidEvents.includes(event.event) && !failedEvents.includes(event.event)) {
            return;
        }

        const order = await orderRepo.findOne({
            where: { asaas_payment_id: event.payment.id }
        });

        if (!order) return;

        if (paidEvents.includes(event.event)) {
            if (order.payment_status === PaymentStatus.PAID) return;
            order.payment_status = PaymentStatus.PAID;
            await CartService.clearCart(order.user_id);
            sseHub.emit(order.user_id, "order.paid", { orderId: order.id });
            logger.info({ orderId: order.id }, "Pedido pago");
        } else {
            if (order.payment_status !== PaymentStatus.PENDING) return;
            order.payment_status = PaymentStatus.FAILED;
            logger.warn({ orderId: order.id, event: event.event }, "Pedido falhou");
        }

        await orderRepo.save(order);
    }

    async function cancelAsaasPayment(asaasPaymentId: string) {
        return asaasRequest(`/payments/${asaasPaymentId}`, "DELETE");
    }

    async function expirePendingOrders() {

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const stale = await orderRepo.find({
            where: {
                payment_status: PaymentStatus.PENDING,
                date: LessThan(oneHourAgo)
            }
        });

        for (const order of stale) {

            if (order.asaas_payment_id) {
                await cancelAsaasPayment(order.asaas_payment_id).catch(err =>
                    logger.warn(
                        { err, orderId: order.id },
                        "Falha ao cancelar PIX no Asaas"
                    )
                );
            }

            order.payment_status = PaymentStatus.FAILED;
            await orderRepo.save(order);

            sseHub.emit(order.user_id, "order.expired", { orderId: order.id });
            logger.info({ orderId: order.id }, "Pedido expirado por timeout");
        }
    }

    return {
        createPixPayment,
        handleWebhook,
        createAsaasCustomer,
        expirePendingOrders,
        cancelAsaasPayment,
    };
}

export default PaymentService();
