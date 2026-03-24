import { AppDataSource } from "../data-source";
import { Cart } from "../entities/Cart";
import { CartItem } from "../entities/CartItem";
import { Product } from "../entities/Product";
import { Order, PaymentStatus } from "../entities/Order";
import { HttpError } from "../utils/HttpError";

function CartService() {

    const cartRepo = AppDataSource.getRepository(Cart);
    const itemRepo = AppDataSource.getRepository(CartItem);
    const productRepo = AppDataSource.getRepository(Product);
    const orderRepo = AppDataSource.getRepository(Order);

    async function assertNoPendingOrder(userId: number) {

        const pending = await orderRepo.findOne({
            where: { user_id: userId, payment_status: PaymentStatus.PENDING }
        });

        if (pending) {
            throw HttpError.conflict(
                "Você tem um pedido pendente. Pague ou aguarde a expiração para alterar o carrinho."
            );
        }
    }

    async function getOrCreateCart(userId: number) {

        let cart = await cartRepo.findOne({
            where: { user: { id: userId } },
            relations: ["items", "items.product"]
        });

        if(!cart) {

            cart = cartRepo.create({
                user: { id: userId },
                items: []
            });

            await cartRepo.save(cart);
        }

        return cart;
    }

    async function addProduct(userId: number, productId: number, quantity: number) {

        await assertNoPendingOrder(userId);

        const cart = await getOrCreateCart(userId);

        const product = await productRepo.findOne({
            where: { id: productId }
        });

        if(!product) throw HttpError.notFound("Produto não encontrado!");

        const existingItem = cart.items.find(
            item => item.product.id === productId
        );

        let savedItemId: number;

        if(existingItem) {

            existingItem.quantity += quantity;
            const saved = await itemRepo.save(existingItem);
            savedItemId = saved.id;
        } else {

            const newItem = itemRepo.create({
                cart: { id: cart.id },
                product: { id: productId },
                quantity
            });

            const saved = await itemRepo.save(newItem);
            savedItemId = saved.id;
        }

        return await itemRepo.findOne({
            where: { id: savedItemId },
            relations: ["product"]
        });
    }

    async function removeProduct(userId: number, productId: number)  {

        await assertNoPendingOrder(userId);

        const cart = await getOrCreateCart(userId);

        const item = cart.items.find(
            item => item.product_id === productId
        );

        if(!item) throw HttpError.notFound("O Producto não esta no carrinho!");

        if(item.quantity > 1) {

            item.quantity -= 1;
            await itemRepo.save(item);
        } else {

            await itemRepo.remove(item);
        }
    }

    async function clearCart(userId: number) {

        const cart = await cartRepo.findOne({
            where: { user: { id: userId } }
        });

        if (!cart) return;

        await itemRepo.delete({ cart_id: cart.id });
    }

    async function getCartWithTotal(userId: number) {

        const cart = await getOrCreateCart(userId);

        const total = cart.items.reduce((sum, item) => {
            const price = item.product.promo ?? item.product.price;
            return sum + (price * item.quantity);
        }, 0);

        return { ...cart, total };
    }

    return {
        getOrCreateCart,
        getCartWithTotal,
        addProduct,
        removeProduct,
        clearCart
    }
}

export default CartService();