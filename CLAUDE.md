# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Desenvolvimento (ts-node, sem build)
npm run dev

# Build de produção
npm run build

# Rodar build de produção
npm start

# Criar admin manualmente (rodar uma vez no setup)
npm run seed:admin
```

There is no lint script or test runner configured yet.

## Stack
- Node.js + TypeScript
- TypeORM + SQLite3
- Express.js
- Asaas (PIX payment gateway)

## Workflow
- Sempre analise o código existente antes de propor mudanças
- Apresente um plano antes de escrever código
- Aguarde aprovação antes de modificar arquivos
- Explique o raciocínio por trás das decisões técnicas

## Architecture

This is a Node.js/Express REST API backend for an e-commerce application, written in TypeScript with TypeORM and SQLite3.

### Request lifecycle

Every authenticated request flows through:
1. `authMiddleware` (`src/middlewares/auth.ts`) — verifies the JWT Bearer token, attaches `{ id, role }` to `req.user`
2. `allowRoles(...)` (`src/middlewares/roleMiddleware.ts`) — checks `req.user.role` against allowed roles
3. `validateDTO(SomeDTO)` (`src/middlewares/validateDTO.ts`) — uses `class-validator` + `class-transformer` to validate and transform `req.body` into a typed DTO instance
4. Controller (wrapped in `asyncHandler`) — chama o service e retorna JSON
5. `errorHandler` (`src/middlewares/errorHandler.ts`) — registrado depois das rotas em `app.ts`, captura qualquer erro propagado

Routes are defined in `src/routes.ts`, which wires middlewares to controller methods.

### Layer responsibilities

- **`src/entities/`** — TypeORM entity classes (SQLite schema). `synchronize` is enabled only when `NODE_ENV !== "production"`.
- **`src/dtos/`** — Input validation classes using `class-validator` decorators. Always use `validateDTO(DTO)` middleware before controllers that accept a body.
- **`src/services/`** — Business logic and all database access via `AppDataSource`. Services are singleton objects exported as `ServiceName()` (factory pattern called once at module load). Erros de domínio são lançados como `HttpError` (`src/utils/HttpError.ts`) com status apropriado (404, 409, 401, 400…).
- **`src/controllers/`** — Thin Express handlers wrapped in `asyncHandler` (`src/utils/asyncHandler.ts`). Sem `try/catch` — qualquer throw propaga pro `errorHandler`.
- **`src/middlewares/errorHandler.ts`** — handler global. `HttpError` vira `{ error }` com seu status; qualquer outro erro vira 500 + log no servidor.
- **`src/types/`** — Shared types and enums. `UserRole` enum (`CUSTOMER`, `SELLER`, `ADMIN`). `express.d.ts` extends the Express `Request` type to include `user: { id: number, role: UserRole }`.

### Key design decisions

- **Env vars são validadas no startup** (`src/utils/validateEnv.ts`). Se algo faltar, o processo aborta antes do `initialize()`.
- **JWT secret** é lido de `process.env.JWT_SECRET` em `src/utils/jwt.ts` e `src/middlewares/auth.ts`. Sem fallback hardcoded.
- **Admin seeding** é manual via `npm run seed:admin` (`scripts/seedAdmin.ts`). O `server.ts` não cria admin automaticamente.
- **Pagamento PIX** via Asaas (`src/services/PaymentService.ts`). Webhook em `POST /webhook` valida `asaas-access-token` com `timingSafeEqual` e é idempotente (state-based: PAID→PAID retorna).
- **Graceful shutdown**: `server.ts` escuta `SIGTERM`/`SIGINT`, fecha conexões pendentes e o `AppDataSource` antes de sair.
- **All category and product write routes require `ADMIN` role**. `GET /` é a listagem pública (home).
- **`User` has a self-referential `seller` relationship**: customers can be linked to a seller user via `seller_id`.
