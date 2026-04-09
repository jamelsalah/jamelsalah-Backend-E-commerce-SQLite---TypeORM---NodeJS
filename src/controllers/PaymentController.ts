import { Request, Response } from "express";
import { timingSafeEqual } from "crypto";
import PaymentService from "../services/PaymentService";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/HttpError";

function PaymentController() {

    const checkout = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { addressId } = req.body;

        const result = await PaymentService.createPixPayment(userId, addressId);

        return res.status(201).json(result);
    });

    const webhook = asyncHandler(async (req: Request, res: Response) => {

        const token = req.headers["asaas-access-token"];
        const expected = process.env.ASAAS_WEBHOOK_TOKEN!;

        if (typeof token !== "string" ||
            token.length !== expected.length ||
            !timingSafeEqual(Buffer.from(token), Buffer.from(expected))) {
            throw HttpError.unauthorized("Webhook não autorizado");
        }

        await PaymentService.handleWebhook(req.body);

        return res.status(200).json({ received: true });
    });

    return {
        checkout,
        webhook,
    };
}

export default PaymentController();
