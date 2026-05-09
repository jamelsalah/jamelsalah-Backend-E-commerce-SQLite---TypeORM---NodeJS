import { Request, Response } from "express";
import * as sseHub from "../utils/sseHub";
import { logger } from "../utils/logger";

const HEARTBEAT_MS = 15_000;

function EventsController() {

    const subscribe = (req: Request, res: Response) => {

        const userId = req.user!.id;

        // Headers obrigatórios pra SSE
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no"); // anti-buffering em proxies (nginx)

        res.flushHeaders();

        // Mensagem inicial — confirma ao cliente que conexão está pronta
        res.write(": connected\n\n");

        sseHub.register(userId, res);
        logger.info({ userId }, "SSE conectado");

        // Heartbeat: comment (linha começando com ":") a cada 15s mantém viva
        const heartbeat = setInterval(() => {
            res.write(": ping\n\n");
        }, HEARTBEAT_MS);

        // Cleanup quando o cliente desconecta
        req.on("close", () => {
            clearInterval(heartbeat);
            sseHub.unregister(userId, res);
            logger.info({ userId }, "SSE desconectado");
        });
    };

    return {
        subscribe
    };
}

export default EventsController();
