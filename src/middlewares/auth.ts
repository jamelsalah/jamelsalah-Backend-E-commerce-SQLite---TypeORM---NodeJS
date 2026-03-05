import { Request, Response, NextFunction } from "express";
//import "../types/express";
import jwt from "jsonwebtoken";
import { UserRole } from "../types/UserRole";
import { HttpError } from "../utils/HttpError";

const SECRET = process.env.JWT_SECRET!;

export function authMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
) {

    const authHeader = req.headers.authorization

    if(!authHeader) {
        return next(HttpError.unauthorized("Token não enviado"));
    }

    const token = authHeader.split(" ")[1];

    if(!token) {
        return next(HttpError.unauthorized("Token inválido"));
    }

    try {

        const decoded = jwt.verify(token, SECRET) as {
            id: number
            role: UserRole
        }

        req.user = decoded;

        next();

    } catch {

        return next(HttpError.unauthorized("Falha ao Ler Token"));

    }
}