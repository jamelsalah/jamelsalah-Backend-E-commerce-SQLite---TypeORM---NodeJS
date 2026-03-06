import * as express from "express";

import UserController from "./controllers/UserController";
import CategoryController from "./controllers/CategoryController";
import ProductController from "./controllers/ProductController";
import CartController from "./controllers/CartController";
import AddressController from "./controllers/AddressController";
import PaymentController from "./controllers/PaymentController";
import OrderController from "./controllers/OrderController";
import EventsController from "./controllers/EventsController";

import { validateDTO } from "./middlewares/validateDTO";
import { CreateUserDTO } from "./dtos/CreateUserDTO";
import { AuthDTO } from "./dtos/AuthDTO";
import { CreateCategoryDTO, UpdateCategoryDTO } from "./dtos/CategoryDTO";
import { AddToCartDTO } from "./dtos/CartDTO";
import { UpdateRelevanceDTO } from "./dtos/RelevanceDTO";
import { CheckoutDTO } from "./dtos/CheckoutDTO";
import { CreateAddressDTO, UpdateAddressDTO } from "./dtos/AddressDTO";
import { CreateProductDTO, UpdateProductDTO } from "./dtos/ProductDTO";
import { UpdateOrderStatusDTO } from "./dtos/OrderDTO";

import { authMiddleware } from "./middlewares/auth";

import { allowRoles } from "./middlewares/roleMiddleware";
import { UserRole } from "./types/UserRole";

const router = express.Router();


router.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});




/**
 * @openapi
 * /:
 *   get:
 *     summary: Vitrine pública agrupada por categoria
 *     tags: [Products]
 *     description: Retorna até 20 produtos por categoria (mais relevantes), incluindo seção `promo` com produtos em promoção. Não paginada.
 *     responses:
 *       200:
 *         description: Vitrine montada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: array
 *                 items: { $ref: '#/components/schemas/Product' }
 */
router.get("/", ProductController.home);


/**
 * @openapi
 * /signin:
 *   post:
 *     summary: Cadastra novo usuário e retorna token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserDTO'
 *     responses:
 *       201:
 *         description: Usuário criado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user: { type: object }
 *                 token: { type: string }
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *       409:
 *         description: Email ou username já em uso
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       429: { description: Rate limit excedido }
 */
router.post(
    "/signin",
    validateDTO(CreateUserDTO),
    UserController.addUser
);
/**
 * @openapi
 * /auth:
 *   post:
 *     summary: Autentica usuário e retorna token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AuthDTO' }
 *     responses:
 *       200:
 *         description: Autenticação bem-sucedida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 user: { type: object }
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *       401:
 *         description: Credenciais incorretas
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       429: { description: Rate limit excedido }
 */
router.post(
    "/auth",
    validateDTO(AuthDTO),
    UserController.auth
);


/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Lista categorias ativas
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Category' }
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get(
    "/categories",
    authMiddleware,
    allowRoles(UserRole.ADMIN, UserRole.SELLER, UserRole.CUSTOMER),
    CategoryController.list
);
/**
 * @openapi
 * /categories:
 *   post:
 *     summary: Cria nova categoria (ou restaura soft-deleted com mesmo nome)
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateCategoryDTO' }
 *     responses:
 *       201:
 *         description: Categoria criada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Category' }
 *       400: { description: Dados inválidos }
 *       401: { description: Não autenticado }
 *       403: { description: Sem permissão (apenas ADMIN) }
 *       409: { description: Categoria com mesmo nome já existe e está ativa }
 */
router.post(
    "/categories",
    authMiddleware,
    allowRoles(UserRole.ADMIN),
    validateDTO(CreateCategoryDTO),
    CategoryController.create
);
/**
 * @openapi
 * /categories/{id}:
 *   put:
 *     summary: Atualiza categoria
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateCategoryDTO' }
 *     responses:
 *       200:
 *         description: Atualizada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Category' }
 *       400: { description: Dados inválidos }
 *       401: { description: Não autenticado }
 *       403: { description: Sem permissão }
 *       404: { description: Categoria não encontrada }
 */
router.put(
    "/categories/:id",
    authMiddleware,
    allowRoles(UserRole.ADMIN),
    validateDTO(UpdateCategoryDTO),
    CategoryController.update
);
/**
 * @openapi
 * /categories/{id}:
 *   delete:
 *     summary: Soft-delete da categoria (produtos vinculados são preservados)
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Removida }
 *       401: { description: Não autenticado }
 *       403: { description: Sem permissão }
 *       404: { description: Categoria não encontrada }
 */
router.delete(
    "/categories/:id",
    authMiddleware,
    allowRoles(UserRole.ADMIN),
    CategoryController.remove
);
/**
 * @openapi
 * /categories/{id}/relevance:
 *   patch:
 *     summary: Incrementa ou decrementa a relevância da categoria
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateRelevanceDTO' }
 *     responses:
 *       200:
 *         description: Atualizada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Category' }
 *       400: { description: Dados inválidos }
 *       401: { description: Não autenticado }
 *       403: { description: Sem permissão }
 *       404: { description: Categoria não encontrada }
 */
router.patch(
    "/categories/:id/relevance",
    authMiddleware,
    allowRoles(UserRole.ADMIN),
    validateDTO(UpdateRelevanceDTO),
    CategoryController.updateRelevance
);


/**
 * @openapi
 * /products:
 *   get:
 *     summary: Lista produtos paginados (filtro opcional por categoria)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Nome da categoria (case-insensitive). Inclui sub-categorias.
 *     responses:
 *       200:
 *         description: Lista paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Product' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       400: { description: Parâmetros inválidos (page/limit) }
 *       401: { description: Não autenticado }
 *       404: { description: Categoria não encontrada (quando filtro é passado) }
 */
router.get(
    "/products",
    authMiddleware,
    allowRoles(UserRole.ADMIN, UserRole.SELLER, UserRole.CUSTOMER),
    ProductController.list
);
/**
 * @openapi
 * /products:
 *   post:
 *     summary: Cria novo produto
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateProductDTO' }
 *     responses:
 *       201:
 *         description: Produto criado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       400: { description: Dados inválidos }
 *       401: { description: Não autenticado }
 *       403: { description: Sem permissão (apenas ADMIN) }
 *       404: { description: Categoria referenciada não existe }
 */
router.post(
    "/products",
    authMiddleware,
    allowRoles(UserRole.ADMIN),
    validateDTO(CreateProductDTO),
    ProductController.create
);
/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Detalhe do produto com todas as imagens e o campo details
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Produto encontrado (inclui o campo details)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProductDetail' }
 *       400: { description: ID inválido }
 *       401: { description: Não autenticado }
 *       404: { description: Produto não encontrado }
 */
router.get(
    "/products/:id",
    authMiddleware,
    allowRoles(UserRole.ADMIN, UserRole.SELLER, UserRole.CUSTOMER),
    ProductController.getById
);
/**
 * @openapi
 * /products/{id}:
 *   put:
 *     summary: Atualiza produto
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateProductDTO' }
 *     responses:
 *       200:
 *         description: Atualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       400: { description: Dados inválidos }
 *       401: { description: Não autenticado }
 *       403: { description: Sem permissão }
 *       404: { description: Produto não encontrado }
 */
router.put(
    "/products/:id",
    authMiddleware,
    allowRoles(UserRole.ADMIN),
    validateDTO(UpdateProductDTO),
    ProductController.update
);
/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     summary: Remove produto
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Removido }
 *       401: { description: Não autenticado }
 *       403: { description: Sem permissão }
 *       404: { description: Produto não encontrado }
 */
router.delete(
    "/products/:id",
    authMiddleware,
    allowRoles(UserRole.ADMIN),
    ProductController.remove
);
/**
 * @openapi
 * /products/{id}/relevance:
 *   patch:
 *     summary: Incrementa ou decrementa a relevância do produto
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateRelevanceDTO' }
 *     responses:
 *       200:
 *         description: Atualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       400: { description: Dados inválidos }
 *       401: { description: Não autenticado }
 *       403: { description: Sem permissão }
 *       404: { description: Produto não encontrado }
 */
router.patch(
    "/products/:id/relevance",
    authMiddleware,
    allowRoles(UserRole.ADMIN),
    validateDTO(UpdateRelevanceDTO),
    ProductController.updateRelevance
);


/**
 * @openapi
 * /cart:
 *   get:
 *     summary: Retorna o carrinho do usuário (cria se não existir)
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Carrinho atual
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Cart' }
 *       401: { description: Não autenticado }
 */
router.get(
    "/cart",
    authMiddleware,
    allowRoles(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
    CartController.getCart
);
/**
 * @openapi
 * /cart/items:
 *   post:
 *     summary: Adiciona produto ao carrinho (incrementa se já existir)
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AddToCartDTO' }
 *     responses:
 *       201:
 *         description: Item criado/incrementado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CartItem' }
 *       400: { description: Dados inválidos }
 *       401: { description: Não autenticado }
 *       404: { description: Produto não encontrado }
 */
router.post(
    "/cart/items",
    authMiddleware,
    allowRoles(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
    validateDTO(AddToCartDTO),
    CartController.addProduct
);
/**
 * @openapi
 * /cart/items/{productId}:
 *   delete:
 *     summary: Decrementa quantidade do item no carrinho (remove ao chegar em 0)
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Decrementado/removido }
 *       401: { description: Não autenticado }
 *       404: { description: Produto não está no carrinho }
 */
router.delete(
    "/cart/items/:productId",
    authMiddleware,
    allowRoles(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
    CartController.removeProduct
);


/**
 * @openapi
 * /addresses:
 *   get:
 *     summary: Lista endereços do usuário (paginado)
 *     tags: [Addresses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200:
 *         description: Lista paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Address' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       400: { description: Parâmetros inválidos }
 *       401: { description: Não autenticado }
 */
router.get(
    "/addresses",
    authMiddleware,
    allowRoles(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
    AddressController.list
);
/**
 * @openapi
 * /addresses:
 *   post:
 *     summary: Cria endereço para o usuário
 *     tags: [Addresses]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateAddressDTO' }
 *     responses:
 *       201:
 *         description: Endereço criado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Address' }
 *       400: { description: Dados inválidos }
 *       401: { description: Não autenticado }
 */
router.post(
    "/addresses",
    authMiddleware,
    allowRoles(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
    validateDTO(CreateAddressDTO),
    AddressController.create
);
/**
 * @openapi
 * /addresses/{id}:
 *   put:
 *     summary: Atualiza endereço (apenas o dono)
 *     tags: [Addresses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateAddressDTO' }
 *     responses:
 *       200:
 *         description: Atualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Address' }
 *       400: { description: Dados inválidos }
 *       401: { description: Não autenticado }
 *       404: { description: Endereço não encontrado (ou não é do usuário) }
 */
router.put(
    "/addresses/:id",
    authMiddleware,
    allowRoles(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
    validateDTO(UpdateAddressDTO),
    AddressController.update
);
/**
 * @openapi
 * /addresses/{id}:
 *   delete:
 *     summary: Remove endereço (apenas o dono)
 *     tags: [Addresses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Removido }
 *       401: { description: Não autenticado }
 *       404: { description: Endereço não encontrado }
 */
router.delete(
    "/addresses/:id",
    authMiddleware,
    allowRoles(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
    AddressController.remove
);


/**
 * @openapi
 * /webhooks/asaas:
 *   post:
 *     summary: Webhook do Asaas (atualiza payment_status do pedido)
 *     tags: [Webhooks]
 *     description: Endpoint chamado pelo Asaas. Autentica via header `asaas-access-token`. Não é chamado por clientes.
 *     parameters:
 *       - in: header
 *         name: asaas-access-token
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event: { type: string, example: "PAYMENT_RECEIVED" }
 *               payment:
 *                 type: object
 *                 properties:
 *                   id: { type: string }
 *     responses:
 *       200:
 *         description: Recebido (idempotente)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received: { type: boolean }
 *       401: { description: Token de webhook inválido }
 */
router.post(
    "/webhooks/asaas",
    PaymentController.webhook
);

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: Lista pedidos do usuário logado (paginado)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200:
 *         description: Lista paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Order' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       400: { description: Parâmetros inválidos }
 *       401: { description: Não autenticado }
 */
router.get(
    "/orders",
    authMiddleware,
    allowRoles(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
    OrderController.customer.list
);
/**
 * @openapi
 * /orders/all:
 *   get:
 *     summary: Lista todos os pedidos (admin, paginado)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200:
 *         description: Lista paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Order' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       401: { description: Não autenticado }
 *       403: { description: Sem permissão (apenas ADMIN) }
 */
router.get(
    "/orders/all",
    authMiddleware,
    allowRoles(UserRole.ADMIN),
    OrderController.admin.list
);
/**
 * @openapi
 * /orders/all/{id}:
 *   get:
 *     summary: Detalhe de qualquer pedido (admin)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Pedido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       401: { description: Não autenticado }
 *       403: { description: Sem permissão }
 *       404: { description: Pedido não encontrado }
 */
router.get(
    "/orders/all/:id",
    authMiddleware,
    allowRoles(UserRole.ADMIN),
    OrderController.admin.getById
);
/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     summary: Detalhe de pedido próprio (customer/seller)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Pedido com items snapshot
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       401: { description: Não autenticado }
 *       404: { description: Pedido não encontrado (ou não é do usuário) }
 */
router.get(
    "/orders/:id",
    authMiddleware,
    allowRoles(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
    OrderController.customer.getById
);
/**
 * @openapi
 * /orders/{id}/cancel:
 *   post:
 *     summary: Cancela um pedido pendente (apenas o dono, apenas PENDING)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Pedido cancelado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       401: { description: Não autenticado }
 *       404: { description: Pedido não encontrado }
 *       409: { description: Pedido não pode ser cancelado (já pago ou já falhado) }
 */
router.post(
    "/orders/:id/cancel",
    authMiddleware,
    allowRoles(UserRole.CUSTOMER, UserRole.SELLER),
    OrderController.customer.cancel
);
/**
 * @openapi
 * /orders/{id}/status:
 *   patch:
 *     summary: Atualiza status do pedido (admin)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateOrderStatusDTO' }
 *     responses:
 *       200:
 *         description: Status atualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       400: { description: Status inválido }
 *       401: { description: Não autenticado }
 *       403: { description: Sem permissão }
 *       404: { description: Pedido não encontrado }
 */
router.patch(
    "/orders/:id/status",
    authMiddleware,
    allowRoles(UserRole.ADMIN),
    validateDTO(UpdateOrderStatusDTO),
    OrderController.admin.updateStatus
);


/**
 * @openapi
 * /checkout:
 *   post:
 *     summary: Cria pedido PIX no Asaas e retorna QR Code
 *     tags: [Checkout]
 *     security: [{ bearerAuth: [] }]
 *     description: Snapshot do carrinho atual + endereço de entrega. Após pagamento, webhook atualiza payment_status.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CheckoutDTO' }
 *     responses:
 *       201:
 *         description: Pedido criado, QR Code gerado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CheckoutResponse' }
 *       400: { description: Dados inválidos ou carrinho vazio }
 *       401: { description: Não autenticado }
 *       404: { description: Endereço não encontrado (ou não é do usuário) }
 *       429: { description: Rate limit excedido }
 */
router.post(
    "/checkout",
    authMiddleware,
    allowRoles(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
    validateDTO(CheckoutDTO),
    PaymentController.checkout
);

/**
 * @openapi
 * /events:
 *   get:
 *     summary: Stream SSE de eventos do usuário (pago, cancelado, expirado)
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     description: |
 *       Conexão HTTP de longa duração. Servidor envia eventos no formato SSE.
 *       Cliente deve usar fetch + ReadableStream (EventSource nativo não permite header Authorization).
 *
 *       Eventos emitidos:
 *       - `order.paid` — pedido confirmado pelo Asaas
 *       - `order.canceled` — usuário cancelou via POST /orders/:id/cancel
 *       - `order.expired` — cron expirou pedido após 1h sem pagamento
 *
 *       Heartbeat: comment `: ping` a cada 15s mantém conexão viva.
 *     responses:
 *       200:
 *         description: Stream aberto
 *         content:
 *           text/event-stream:
 *             schema: { type: string }
 *       401: { description: Não autenticado }
 */
router.get(
    "/events",
    authMiddleware,
    allowRoles(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
    EventsController.subscribe
);

export default router;