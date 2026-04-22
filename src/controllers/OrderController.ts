import { Request, Response } from "express";
import Service from "../services/OrderService";
import { asyncHandler } from "../utils/asyncHandler";
import { parseIdParam } from "../utils/parseIdParam";
import { parsePagination } from "../utils/parsePagination";

function OrderController() {

    const customer = {
        list: asyncHandler(async (req: Request, res: Response) => {
            const userId = req.user!.id;
            const { page, limit, skip, take } = parsePagination(req);

            const { data, total } = await Service.customer.list(userId, skip, take);

            return res.status(200).json({
                data,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        }),

        getById: asyncHandler(async (req: Request, res: Response) => {
            const userId = req.user!.id;
            const id = parseIdParam(req);
            const order = await Service.customer.getById(userId, id);
            return res.status(200).json(order);
        }),

        cancel: asyncHandler(async (req: Request, res: Response) => {
            const userId = req.user!.id;
            const id = parseIdParam(req);
            const order = await Service.customer.cancel(userId, id);
            return res.status(200).json(order);
        })
    }

    const admin = {
        list: asyncHandler(async (req: Request, res: Response) => {
            const { page, limit, skip, take } = parsePagination(req);

            const { data, total } = await Service.admin.list(skip, take);

            return res.status(200).json({
                data,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        }),

        getById: asyncHandler(async (req: Request, res: Response) => {
            const id = parseIdParam(req);
            const order = await Service.admin.getById(id);
            return res.status(200).json(order);
        }),

        updateStatus: asyncHandler(async (req: Request, res: Response) => {
            const id = parseIdParam(req);
            const order = await Service.admin.updateStatus(id, req.body.status);
            return res.status(200).json(order);
        })
    }

    return {
        customer,
        admin
    };
}

export default OrderController();
