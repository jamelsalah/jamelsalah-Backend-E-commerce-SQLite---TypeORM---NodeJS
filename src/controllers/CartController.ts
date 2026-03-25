import { Request, Response } from "express";
import CartService from "../services/CartService";
import { asyncHandler } from "../utils/asyncHandler";
import { parseIdParam } from "../utils/parseIdParam";

function CartController() {

    const addProduct = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { productId, quantity } = req.body;

        const item = await CartService.addProduct(userId, productId, quantity);

        return res.status(201).json(item);
    });

    const removeProduct = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const productId = parseIdParam(req, "productId");

        await CartService.removeProduct(userId, productId);

        return res.status(204).send();
    });

    const getCart = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;

        const cart = await CartService.getCartWithTotal(userId);

        return res.status(200).json(cart);
    });

    return {
        getCart,
        addProduct,
        removeProduct,
    };
}

export default CartController();
