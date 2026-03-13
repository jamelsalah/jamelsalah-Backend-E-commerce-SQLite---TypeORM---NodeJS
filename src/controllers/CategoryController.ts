import { Request, Response } from "express";
import Service from "../services/CategoryService";
import { asyncHandler } from "../utils/asyncHandler";
import { parseIdParam } from "../utils/parseIdParam";

function CategoryController() {

    const list = asyncHandler(async (_req: Request, res: Response) => {
        const categories = await Service.list();
        return res.status(200).json(categories);
    });

    const create = asyncHandler(async (req: Request, res: Response) => {
        const category = await Service.create(req.body.name);
        return res.status(201).json(category);
    });

    const update = asyncHandler(async (req: Request, res: Response) => {
        const id = parseIdParam(req);
        const category = await Service.update(id, req.body.name);
        return res.status(200).json(category);
    });

    const remove = asyncHandler(async (req: Request, res: Response) => {
        const id = parseIdParam(req);
        await Service.remove(id);
        return res.status(204).send();
    });

    const updateRelevance = asyncHandler(async (req: Request, res: Response) => {
        const id = parseIdParam(req);
        const category = await Service.updateRelevance(id, req.body.action);
        return res.status(200).json(category);
    });

    return {
        list,
        create,
        update,
        remove,
        updateRelevance
    }
}

export default CategoryController();
