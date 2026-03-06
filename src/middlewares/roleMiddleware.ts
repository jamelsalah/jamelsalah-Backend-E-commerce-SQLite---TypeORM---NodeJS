import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types/UserRole";
import { HttpError } from "../utils/HttpError";


export function allowRoles(...roles: UserRole[]) {

    return (req: Request, _res: Response, next: NextFunction) => {

        const user = req.user;

        if(!user) {
            return next(HttpError.unauthorized("Não autenticado"));
        }

        if(!roles.includes(user.role)) {
            return next(HttpError.forbidden("Sem permissão"));
        }

        next();
    }
}