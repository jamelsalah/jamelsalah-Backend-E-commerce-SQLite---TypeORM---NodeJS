import { rateLimit } from "express-rate-limit";

// Limiter das rotas PÚBLICAS de leitura do catálogo (home "/" e "/products").
// Fica aqui (e não em app.ts) porque é usado em dois lugares: app.ts aplica em
// "/products" e routes.ts aplica na home.
// Com TRUST_PROXY ativo + o Next repassando o X-Forwarded-For, o limite passa a
// valer POR VISITANTE. Sem isso (ou sem proxy confiável na frente), as leituras SSR
// chegam pelo IP do servidor Next (um só) — por isso o limite é generoso, para não
// estrangular o site.
export const catalogLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    message: { error: "Muitas requisições. Tente novamente em instantes." },
});
