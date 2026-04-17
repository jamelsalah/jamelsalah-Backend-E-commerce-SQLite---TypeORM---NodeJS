import { Request } from "express";
import { HttpError } from "./HttpError";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export interface Pagination {
    page: number;
    limit: number;
    skip: number;
    take: number;
}

export function parsePagination(req: Request): Pagination {

    const rawPage = req.query.page;
    const rawLimit = req.query.limit;

    const page = rawPage === undefined ? DEFAULT_PAGE : Number(rawPage);
    const limit = rawLimit === undefined ? DEFAULT_LIMIT : Number(rawLimit);

    if (!Number.isInteger(page) || page < 1) {
        throw HttpError.badRequest('Parâmetro "page" inválido');
    }

    if (!Number.isInteger(limit) || limit < 1) {
        throw HttpError.badRequest('Parâmetro "limit" inválido');
    }

    if (limit > MAX_LIMIT) {
        throw HttpError.badRequest(`"limit" não pode ser maior que ${MAX_LIMIT}`);
    }

    return {
        page,
        limit,
        skip: (page - 1) * limit,
        take: limit,
    };
}
