import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/HttpError";

type ExposableError = {
    statusCode?: number;
    status?: number;
    expose?: boolean;
    message?: string;
};

export function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
) {

    if (err instanceof HttpError) {
        const body: { error: string; details?: unknown } = { error: err.message };
        if (err.details !== undefined) {
            body.details = err.details;
        }
        return res.status(err.status).json(body);
    }

    // Erros do Express/body-parser/etc. com `expose: true` indicam
    // que a mensagem é segura para o client (ex: JSON malformado → 400).
    const httpish = err as ExposableError;
    if (
        httpish &&
        httpish.expose === true &&
        typeof httpish.statusCode === "number" &&
        httpish.statusCode < 500
    ) {
        return res
            .status(httpish.statusCode)
            .json({ error: httpish.message ?? "Requisição inválida" });
    }

    req.log.error({ err }, "Erro inesperado");

    return res
        .status(500)
        .json({ error: "Erro interno" });
}
