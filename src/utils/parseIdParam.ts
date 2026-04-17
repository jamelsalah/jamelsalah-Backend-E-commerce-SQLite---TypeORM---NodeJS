import { Request } from "express";
import { HttpError } from "./HttpError";

/**
 * Lê um parâmetro de rota como inteiro positivo.
 * Lança HttpError 400 se o valor for inválido.
 */
export function parseIdParam(req: Request, key = "id"): number {

    const id = Number(req.params[key]);

    if (!Number.isInteger(id) || id <= 0) {
        throw HttpError.badRequest(`Parâmetro "${key}" inválido`);
    }

    return id;
}
