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

// Variáveis de features OPCIONAIS: se faltarem, o servidor sobe normalmente e a
// feature responde um erro claro quando usada (não derruba o app no startup).
const CLOUDINARY_ENV_VARS = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
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

    const cloudinarySet = CLOUDINARY_ENV_VARS.filter(key => process.env[key]);

    if (cloudinarySet.length === 0) {
        logger.warn("Cloudinary não configurado: POST /uploads responderá 503.");
    } else if (cloudinarySet.length < CLOUDINARY_ENV_VARS.length) {
        logger.warn("Cloudinary configurado parcialmente: defina CLOUD_NAME, API_KEY e API_SECRET juntos.");
    }
}
