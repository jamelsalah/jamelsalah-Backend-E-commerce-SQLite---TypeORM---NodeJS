import { AppDataSource } from "../data-source";
import { Order, OrderStatus, PaymentStatus } from "../entities/Order";
import { HttpError } from "../utils/HttpError";
import { logger } from "../utils/logger";
import * as sseHub from "../utils/sseHub";
import PaymentService from "./PaymentService";

function OrderService() {

    const repo = AppDataSource.getRepository(Order);

    const customer = {
        list: async function (userId: number, skip: number, take: number) {

            const [data, total] = await repo.findAndCount({
                where: { user_id: userId },
                skip,
                take,
                order: { date: "DESC" }
            });

            return { data, total };
        },

        getById: async function (userId: number, orderId: number) {

            const order = await repo.findOne({
                where: { id: orderId, user_id: userId },
                relations: ["items"]
            });

            if (!order) throw HttpError.notFound("Pedido não encontrado");

            return order;
        },

        cancel: async function (userId: number, orderId: number) {

            const order = await repo.findOne({
                where: { id: orderId, user_id: userId }
            });

            if (!order) throw HttpError.notFound("Pedido não encontrado");

            if (order.payment_status !== PaymentStatus.PENDING) {
                throw HttpError.conflict("Pedido não pode ser cancelado");
            }

            if (order.asaas_payment_id) {
                await PaymentService.cancelAsaasPayment(order.asaas_payment_id)
                    .catch(err =>
                        logger.warn(
                            { err, orderId: order.id },
                            "Falha ao cancelar PIX no Asaas"
                        )
                    );
            }

            order.payment_status = PaymentStatus.FAILED;
            order.status = OrderStatus.CANCELED;

            return await repo.save(order);
        }
    }

    const admin = {
        list: async function (skip: number, take: number) {

            const [data, total] = await repo.findAndCount({
                skip,
                take,
                order: { date: "DESC" }
            });

            return { data, total };
        },

        getById: async function (orderId: number) {

            const order = await repo.findOne({
                where: { id: orderId },
                relations: ["items"]
            });

            if (!order) throw HttpError.notFound("Pedido não encontrado");

            return order;
        },

        updateStatus: async function (orderId: number, status: OrderStatus) {

            const order = await repo.findOne({
                where: { id: orderId }
            });

            if (!order) throw HttpError.notFound("Pedido não encontrado");

            order.status = status;

            const saved = await repo.save(order);

            if (saved.status === OrderStatus.CANCELED) {
                sseHub.emit(saved.user_id, "order.canceled", { orderId: saved.id });
            }

            return saved;
        }
    }

    return {
        customer,
        admin
    };
}

export default OrderService();
