import PaymentService from "../../services/PaymentService";
import { logger } from "../logger";

const INTERVAL_MS = 10 * 60 * 1000; // a cada 10 minutos

let intervalId: NodeJS.Timeout | null = null;

async function run() {
    await PaymentService.expirePendingOrders().catch(err =>
        logger.error({ err }, "Falha ao expirar pedidos pendentes")
    );
}

export function start() {
    if (intervalId) return;
    intervalId = setInterval(run, INTERVAL_MS);
    logger.info({ intervalMs: INTERVAL_MS }, "Job de expiracao de pedidos iniciado");
}

export function stop() {
    if (!intervalId) return;
    clearInterval(intervalId);
    intervalId = null;
    logger.info("Job de expiracao de pedidos parado");
}
