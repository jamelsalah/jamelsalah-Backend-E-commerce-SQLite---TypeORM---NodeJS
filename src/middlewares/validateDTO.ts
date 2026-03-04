import { validate } from "class-validator";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/HttpError";

export const validateDTO = <T extends object>(dtoClass: ClassConstructor<T>) => {
    return async (req: Request, _res: Response, next: NextFunction) => {

        const dtoObject = plainToInstance(dtoClass, req.body);

        const errors = await validate(dtoObject);

        if (errors.length > 0) {

            const details = errors.map(e => ({
                field: e.property,
                messages: Object.values(e.constraints ?? {}),
            }));

            return next(HttpError.badRequest("Dados inválidos", details));
        }

        req.body = dtoObject;

        next();
    }
}
