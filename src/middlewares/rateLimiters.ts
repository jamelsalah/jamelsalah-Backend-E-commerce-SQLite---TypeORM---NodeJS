import { rateLimit } from "express-rate-limit";

// Limiter das rotas PÚBLICAS de leitura do catálogo (home "/" e "/products").
// Fica aqui (e não em app.ts) porque é usado em dois lugares: app.ts aplica em
// "/products" e routes.ts aplica na home. Limite generoso: sob SSR as leituras
// chegam pelo IP do servidor Next (um só), então um limite baixo estrangularia o site.
export const catalogLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    message: { error: "Muitas requisições. Tente novamente em instantes." },
});
