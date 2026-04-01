import { Request, Response } from "express";
import Service from "../services/AddressService";
import { asyncHandler } from "../utils/asyncHandler";
import { parseIdParam } from "../utils/parseIdParam";
import { parsePagination } from "../utils/parsePagination";

function AddressController() {

    const list = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { page, limit, skip, take } = parsePagination(req);

        const { data, total } = await Service.list(userId, skip, take);

        return res.status(200).json({
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    });

    const create = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const result = await Service.create(userId, req.body);
        return res.status(201).json(result);
    });

    const update = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const id = parseIdParam(req);
        const address = await Service.update(userId, id, req.body);
        return res.status(200).json(address);
    });

    const remove = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const id = parseIdParam(req);
        await Service.remove(userId, id);
        return res.status(204).send();
    });

    return {
        list,
        create,
        update,
        remove,
    };
}

export default AddressController();
