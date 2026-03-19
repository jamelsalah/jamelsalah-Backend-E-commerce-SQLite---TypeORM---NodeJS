import { Request, Response } from "express";
import Service from "../services/ProductService";
import { asyncHandler } from "../utils/asyncHandler";
import { parseIdParam } from "../utils/parseIdParam";
import { parsePagination } from "../utils/parsePagination";

function getCategoryParam(req: Request): string | undefined {
    const value = req.query.category;

    if (typeof value === "string" && value.length > 0) {
        return value;
    }

    return undefined;
}

function ProductController() {

    const home = asyncHandler(async (_req: Request, res: Response) => {
        const result = await Service.home();
        return res.status(200).json(result);
    });

    const list = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit, skip, take } = parsePagination(req);
        const category = getCategoryParam(req);

        const { data, total } = await Service.list(skip, take, category);

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

    const getById = asyncHandler(async (req: Request, res: Response) => {
        const id = parseIdParam(req);
        const product = await Service.getById(id);
        return res.status(200).json(product);
    });

    const create = asyncHandler(async (req: Request, res: Response) => {
        const product = await Service.create(req.body);
        return res.status(201).json(product);
    });

    const update = asyncHandler(async (req: Request, res: Response) => {
        const id = parseIdParam(req);
        const product = await Service.update(id, req.body);
        return res.status(200).json(product);
    });

    const remove = asyncHandler(async (req: Request, res: Response) => {
        const id = parseIdParam(req);
        await Service.remove(id);
        return res.status(204).send();
    });

    const updateRelevance = asyncHandler(async (req: Request, res: Response) => {
        const id = parseIdParam(req);
        const product = await Service.updateRelevance(id, req.body.action);
        return res.status(200).json(product);
    });

    return {
        home,
        list,
        getById,
        create,
        update,
        remove,
        updateRelevance
    }
}

export default ProductController();
