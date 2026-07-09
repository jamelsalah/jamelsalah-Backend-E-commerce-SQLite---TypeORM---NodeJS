///<reference path="./types/express.d.ts" />

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import router from "./routes";
import { catalogLimiter } from "./middlewares/rateLimiters";
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "./utils/logger";
import { openapiSpec } from "./swagger";

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: { error: "Muitas tentativas. Tente novamente em 15 minutos." },
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: { error: "Muitas tentativas de registro. Tente novamente em 1 hora." },
});

const checkoutLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    message: { error: "Muitas tentativas de checkout. Tente novamente em 1 hora." },
});

const webhookLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    message: { error: "Rate limit excedido." },
});

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    message: { error: "Muitos uploads. Tente novamente em 15 minutos." },
});

const app = express();

// Trust proxy: em produção o backend roda atrás de um proxy reverso (nginx, load balancer,
// PaaS) que repassa o IP real do cliente no header X-Forwarded-For. Sem isto, req.ip seria o
// IP do proxy e os rate limiters por IP tratariam todos os clientes como um só.
// Configurável por env para NÃO confiar cegamente (confiar em todos permite forjar o header).
// Ex.: TRUST_PROXY=1 confia no 1º proxy à frente; ou uma lista tipo "loopback, 10.0.0.0/8".
// Em dev (sem proxy) deixe a variável vazia: o padrão do Express (false) usa o IP do socket.
const trustProxySetting = process.env.TRUST_PROXY;
if (trustProxySetting) {
    const hopCount = Number(trustProxySetting);
    if (Number.isInteger(hopCount)) {
        app.set("trust proxy", hopCount);
    } else {
        app.set("trust proxy", trustProxySetting);
    }
}

app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS!
    .split(",")
    .map(o => o.trim())
    .filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.use(pinoHttp({
    logger,
    autoLogging: {
        ignore: (req) =>
            req.url?.startsWith("/docs") === true ||
            req.url === "/health" ||
            req.url === "/events"
    },
    customProps: (req) => {
        const user = (req as any).user;
        return user ? { userId: user.id, role: user.role } : {};
    },
    customSuccessMessage: (req, res, responseTime) =>
        `${req.method} ${req.url} ${res.statusCode} (${responseTime}ms)`,
    customErrorMessage: (req, res) =>
        `${req.method} ${req.url} ${res.statusCode}`,
    serializers: {
        req: (req) => ({ method: req.method, url: req.url }),
        res: (res) => ({ statusCode: res.statusCode }),
    },
}));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

// Serve o contrato OpenAPI cru (JSON). O frontend consome isto para gerar os
// tipos automaticamente (openapi-typescript). É só o contrato — informação pública.
app.get("/openapi.json", (_req, res) => res.json(openapiSpec));

app.use("/auth", authLimiter);
app.use("/register", registerLimiter);
app.use("/checkout", checkoutLimiter);
app.use("/webhook", webhookLimiter);
app.use("/uploads", uploadLimiter);
app.use("/products", catalogLimiter);
app.use("/", router);

app.use(errorHandler);

export default app;