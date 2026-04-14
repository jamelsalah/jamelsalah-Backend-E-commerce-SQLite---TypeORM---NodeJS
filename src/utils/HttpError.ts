export class HttpError extends Error {

    public readonly status: number;
    public readonly details?: unknown;

    constructor(status: number, message: string, details?: unknown) {
        super(message);
        this.status = status;
        this.name = "HttpError";
        if (details !== undefined) {
            this.details = details;
        }
    }

    static badRequest(message: string, details?: unknown) {
        return new HttpError(400, message, details);
    }

    static unauthorized(message = "Não autorizado") {
        return new HttpError(401, message);
    }

    static forbidden(message = "Acesso negado") {
        return new HttpError(403, message);
    }

    static notFound(message: string) {
        return new HttpError(404, message);
    }

    static conflict(message: string) {
        return new HttpError(409, message);
    }
}
