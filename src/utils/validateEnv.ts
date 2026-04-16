import { logger } from "./logger";

const REQUIRED_ENV_VARS = [
    "PORT",
    "JWT_SECRET",
    "ENCRYPTION_KEY",
    "ASAAS_API_KEY",
    "ASAAS_BASE_URL",
    "ASAAS_WEBHOOK_TOKEN",
    "ALLOWED_ORIGINS",
] as const;

export function validateEnv() {

    const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);

    if (missing.length > 0) {
        logger.fatal(
            { missing },
            "Variáveis de ambiente obrigatórias ausentes. Verifique .env (use .env.example como referência)."
        );
        process.exit(1);
    }
}
