import "dotenv/config";
import { validateEnv } from "./utils/validateEnv";

validateEnv();

import { AppDataSource } from "./data-source";
import app from "./app";
import { logger } from "./utils/logger";
import * as expirePendingOrdersJob from "./utils/jobs/expirePendingOrders";

const port = process.env.PORT ?? 3000;

AppDataSource.initialize().then(() => {

    const server = app.listen(port, () => {
        logger.info({ port }, "Servidor pronto");
    });

    expirePendingOrdersJob.start();

    let shuttingDown = false;

    async function shutdown(signal: string) {

        if (shuttingDown) return;
        shuttingDown = true;

        logger.info({ signal }, "Sinal recebido, encerrando");

        expirePendingOrdersJob.stop();

        const forceExit = setTimeout(() => {
            logger.error("Shutdown timeout, forçando saída");
            process.exit(1);
        }, 10000);

        server.close(async () => {
            try {
                await AppDataSource.destroy();
                logger.info("Shutdown completo");
                clearTimeout(forceExit);
                process.exit(0);
            } catch (err) {
                logger.error({ err }, "Erro ao fechar AppDataSource");
                clearTimeout(forceExit);
                process.exit(1);
            }
        });
    }

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
});
