# E-commerce Backend

API REST de e-commerce com autenticação JWT, RBAC, carrinho, pedidos e pagamento PIX via Asaas.

## Stack

- **Node.js** 22+
- **TypeScript** + **Express 5**
- **TypeORM** + **SQLite**
- **class-validator** / **class-transformer** (DTOs)
- **bcrypt** + **jsonwebtoken** (auth)
- **pino** (logging estruturado)
- **Asaas** (gateway PIX)

## Pré-requisitos

- Node ≥ 22 (definido em `engines`, fail-fast via `.npmrc`)
- npm
- Conta sandbox no [Asaas](https://www.asaas.com/) para gerar `ASAAS_API_KEY`

## Setup local

```bash
# 1. Instalar deps
npm install

# 2. Copiar arquivo de env e preencher
cp .env.example .env
# editar .env com seus valores

# 3. Criar admin inicial (uma vez)
npm run seed:admin

# 4. Subir em modo desenvolvimento
npm run dev
```

API disponível em `http://localhost:3000`. Documentação Swagger em `http://localhost:3000/docs`.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe via `ts-node` com `TZ=UTC` |
| `npm run build` | Compila TS pra `dist/` |
| `npm start` | Roda `dist/server.js` (produção) |
| `npm run seed:admin` | Cria usuário admin inicial |

## Variáveis de ambiente

Configuração via arquivo `.env` na raiz. Use `.env.example` como referência.

| Var | Obrigatória | Descrição |
|---|---|---|
| `PORT` | sim | Porta HTTP |
| `NODE_ENV` | sim | `development` ou `production` |
| `DB_PATH` | sim | Caminho do arquivo de banco |
| `JWT_SECRET` | sim | Chave de assinatura de token |
| `ENCRYPTION_KEY` | sim | Chave de criptografia simétrica para campos sensíveis |
| `ASAAS_API_KEY` | sim | Credencial do gateway de pagamento |
| `ASAAS_BASE_URL` | sim | URL base do Asaas |
| `ASAAS_WEBHOOK_TOKEN` | sim | Token validado em chamadas de webhook |
| `ALLOWED_ORIGINS` | sim | Origens CORS permitidas, separadas por vírgula |
| `LOG_LEVEL` | não | Nível de log (default `info`) |

Validação no startup: se faltar qualquer obrigatória, processo falha com log `fatal` antes de inicializar.

## Estrutura

```
src/
├── app.ts                   # Express setup, middlewares, mount routes
├── server.ts                # Entry point, startup, graceful shutdown
├── data-source.ts           # TypeORM DataSource
├── routes.ts                # Definição de rotas + JSDoc para Swagger
├── swagger.ts               # Config OpenAPI
├── controllers/             # Handlers Express (asyncHandler + service call)
├── services/                # Lógica de negócio + acesso ao banco
├── entities/                # Modelos TypeORM
├── dtos/                    # Classes de validação (class-validator)
├── middlewares/             # auth, roles, validateDTO, errorHandler
├── utils/                   # HttpError, asyncHandler, logger, parseIdParam, parsePagination, jwt, crypto, validateEnv
└── types/                   # express.d.ts (augment Request com req.user)
```

## Documentação da API

Swagger UI interativa em **`/docs`** lista todos os endpoints com:
- Descrição, parâmetros e schemas de request/response
- Botão "Authorize" pra colocar o JWT obtido em `POST /auth`
- "Try it out" para testar direto no navegador

## Convenções de código

- **Controllers thin**: só fazem `await Service.x(...)` e respondem JSON. Sem `try/catch` — `asyncHandler` propaga pro `errorHandler`.
- **Erros de domínio**: services lançam `HttpError.notFound(...)`, `HttpError.conflict(...)`, etc. — nunca `res.status(...).json(...)`.
- **DTOs em todo body de POST/PUT/PATCH**: validação via `validateDTO(SomeDTO)` no middleware da rota.
- **Listas paginadas** retornam envelope `{ data, meta }`. Recursos individuais retornam objeto cru.
- **DELETEs** retornam 204 sem body (exceto operações que devolvem estado pós-mutação).
- **Ownership**: services que mexem com recursos do usuário filtram por `user_id` no `where` (ex: `AddressService`, `OrderService.customer`).

## Logging

`pino` em modo JSON em produção, `pino-pretty` colorido em dev. Toda request gera um log automático via `pino-http`.

```
[15:42:01] INFO: GET /products 200 (12ms)
[15:42:08] INFO: POST /cart/items 201 (45ms) (userId=5, role="customer")
[15:42:15] WARN: GET /orders/999 404 (8ms) (userId=5, role="customer")
```

`/docs` e `/health` ignorados pelo logger pra não poluir.

## Roadmap

Itens fora do escopo do MVP, candidatos pra próximas iterações:

- [ ] **Migrations TypeORM** (substituir `synchronize`)
- [ ] **Dockerfile + docker-compose**
- [ ] **Testes** (Jest + Supertest) cobrindo fluxos críticos: auth, checkout, webhook
- [ ] **`npm audit fix --force`** para vulnerabilidades transitivas (sqlite3@6.x quando TypeORM suportar)
- [ ] **Soft delete** em endereços (hoje só categorias têm)
- [ ] **Filtros e ordenação** em endpoints de listagem (`?sort=`, `?status=`)
- [ ] **Endpoint de gestão de cliente** (atualização de dados pessoais, troca de senha)
- [ ] **Validação de conteúdo de `ENCRYPTION_KEY`** no `validateEnv` (hoje só checa presença)
- [ ] **Dashboard admin** com métricas básicas (vendas, pedidos por status)

## Licença

ISC
