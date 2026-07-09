import swaggerJsdoc from "swagger-jsdoc";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";

// Importar DTOs força o registro dos decorators no metadata storage
// do class-validator. Sem isso, validationMetadatasToSchemas vê vazio.
import "./dtos/CreateUserDTO";
import "./dtos/AuthDTO";
import "./dtos/CategoryDTO";
import "./dtos/ProductDTO";
import "./dtos/CartDTO";
import "./dtos/AddressDTO";
import "./dtos/CheckoutDTO";
import "./dtos/OrderDTO";
import "./dtos/RelevanceDTO";

const schemas = validationMetadatasToSchemas({
    refPointerPrefix: "#/components/schemas/",
});

const manualSchemas = {
    PaginationMeta: {
        type: "object",
        properties: {
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 20 },
            total: { type: "integer", example: 47 },
            totalPages: { type: "integer", example: 3 },
        },
    },
    ErrorResponse: {
        type: "object",
        properties: {
            error: { type: "string", example: "Recurso não encontrado" },
        },
    },
    ValidationErrorResponse: {
        type: "object",
        properties: {
            error: { type: "string", example: "Dados inválidos" },
            details: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        field: { type: "string", example: "price" },
                        messages: {
                            type: "array",
                            items: { type: "string" },
                            example: ["price must be a number"],
                        },
                    },
                },
            },
        },
    },
    User: {
        type: "object",
        properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ["CUSTOMER", "SELLER", "ADMIN"] },
        },
    },
    AuthResponse: {
        type: "object",
        properties: {
            user: { $ref: "#/components/schemas/User" },
            token: { type: "string", description: "JWT Bearer usado nas requests protegidas" },
        },
    },
    Category: {
        type: "object",
        properties: {
            id: { type: "integer" },
            name: { type: "string" },
            relevance: { type: "integer" },
        },
    },
    Product: {
        type: "object",
        properties: {
            id: { type: "integer" },
            name: { type: "string" },
            desc: { type: "string" },
            price: { type: "integer", description: "Preço em centavos (ex: 1050 = R$ 10,50)" },
            promo: { type: "integer", nullable: true, description: "Preço promocional em centavos" },
            category_id: { type: "integer" },
            sub_category_id: { type: "integer", nullable: true },
            img_url: { type: "string" },
            relevance: { type: "integer" },
            images: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        url: { type: "string" },
                    },
                },
            },
        },
    },
    ProductDetail: {
        allOf: [
            { $ref: "#/components/schemas/Product" },
            {
                type: "object",
                properties: {
                    details: { type: "string", description: "Informações detalhadas do produto (apenas em GET /products/:id)" },
                },
            },
        ],
    },
    CartItem: {
        type: "object",
        properties: {
            id: { type: "integer" },
            cart_id: { type: "integer" },
            product_id: { type: "integer" },
            quantity: { type: "integer" },
            product: { $ref: "#/components/schemas/Product" },
        },
    },
    Cart: {
        type: "object",
        properties: {
            id: { type: "integer" },
            user_id: { type: "integer" },
            items: {
                type: "array",
                items: { $ref: "#/components/schemas/CartItem" },
            },
            total: { type: "integer", description: "Soma de price × quantity de todos os itens, em centavos" },
        },
    },
    Address: {
        type: "object",
        properties: {
            id: { type: "integer" },
            user_id: { type: "integer" },
            postal_code: { type: "integer" },
            city: { type: "string" },
            state: { type: "string" },
            address: { type: "string" },
            number: { type: "string" },
            complement: { type: "string", nullable: true },
        },
    },
    OrderItem: {
        type: "object",
        properties: {
            id: { type: "integer" },
            order_id: { type: "integer" },
            product_id: { type: "integer", nullable: true },
            product_name: { type: "string" },
            unit_price: { type: "integer", description: "Preço unitário em centavos no momento do pedido" },
            quantity: { type: "integer" },
            product_img_url: { type: "string" },
        },
    },
    PaymentStatus: {
        type: "string",
        enum: ["pending", "paid", "failed"],
    },
    OrderStatus: {
        type: "string",
        enum: ["analyzing", "approved", "dispatched", "on_the_way", "delivered", "canceled"],
    },
    Order: {
        type: "object",
        properties: {
            id: { type: "integer" },
            date: { type: "string", format: "date-time" },
            user_id: { type: "integer" },
            price: { type: "integer", description: "Total do pedido em centavos" },
            payment_method: { type: "string", example: "pix" },
            shipping_postal_code: { type: "integer" },
            shipping_city: { type: "string" },
            shipping_state: { type: "string" },
            shipping_address: { type: "string" },
            shipping_number: { type: "string" },
            shipping_complement: { type: "string", nullable: true },
            fiscal_note: { type: "string", nullable: true },
            payment_status: { $ref: "#/components/schemas/PaymentStatus" },
            status: { $ref: "#/components/schemas/OrderStatus" },
            asaas_payment_id: { type: "string", nullable: true },
            items: {
                type: "array",
                items: { $ref: "#/components/schemas/OrderItem" },
            },
        },
    },
    CheckoutResponse: {
        type: "object",
        properties: {
            order_id: { type: "integer" },
            qrCode: { type: "string", description: "Imagem PNG em base64" },
            copyPaste: { type: "string", description: "Código PIX copia-e-cola" },
            expiresAt: { type: "string", format: "date-time" },
            amount: { type: "integer", description: "Total da cobrança em centavos" },
        },
    },
    UploadResponse: {
        type: "object",
        properties: {
            files: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        url: { type: "string", description: "URL pública da imagem no Cloudinary (CDN)" },
                        public_id: { type: "string", description: "Identificador da imagem no Cloudinary" },
                        width: { type: "integer" },
                        height: { type: "integer" },
                    },
                },
            },
        },
    },
};

const isDev = process.env.NODE_ENV !== "production";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "E-commerce API",
            version: "1.0.0",
            description: "API REST do backend de e-commerce com pagamento PIX via Asaas.",
        },
        servers: [
            { url: "http://localhost:3000", description: "Local" }
        ],
        components: {
            schemas: { ...schemas, ...manualSchemas } as Record<string, unknown>,
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Token JWT obtido via POST /auth"
                }
            }
        },
    },
    apis: isDev
        ? ["./src/routes.ts", "./src/controllers/*.ts"]
        : ["./dist/routes.js", "./dist/controllers/*.js"],
};

export const openapiSpec = swaggerJsdoc(options);
