import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

/**
 * Swagger/OpenAPI 3.0 Configuration
 * Auto-generates API documentation from JSDoc comments
 */
const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Doodhly API Reference',
            version: '1.0.0',
            description: `
### 🥛 Doodhly Dairy Delivery Platform API

Welcome to the Doodhly API documentation. This API powers the Doodhly web and mobile applications.

#### 🔐 Authentication
Most endpoints require authentication.
1. **User/Partner**: Use \`BearerAuth\` (JWT in header).
2. **Admin**: Use \`BearerAuth\` (JWT in header).

#### 🛠️ Key Modules
- **Auth**: Login, OTP, Profile management
- **Admin**: Product catalog, User management, Operations
- **Customer**: Subscription management, Wallet, Orders
- **Partner**: Delivery routes, Status updates
            `,
            contact: {
                name: 'Doodhly Dev Team',
                email: 'dev@doodhly.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000/api/v1',
                description: 'Development Server'
            },
            {
                url: 'https://api.doodhly.com/api/v1',
                description: 'Production Server'
            }
        ],
        tags: [
            { name: 'Auth', description: 'Authentication & User Profile' },
            { name: 'Admin - Products', description: 'Product Catalog Management' },
            { name: 'Admin - Users', description: 'User & Role Management' },
            { name: 'Admin - Operations', description: 'Run Sheets & Deliveries' },
            { name: 'Customer', description: 'Customer Actions (Subscriptions, Wallet)' },
            { name: 'Partner', description: 'Delivery Partner Actions' }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token (get it from /auth/verify-otp)'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        message: { type: 'string', example: 'Something went wrong' }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Ramesh Kumar' },
                        phone_hash: { type: 'string', example: '+919876543210' },
                        role: { type: 'string', enum: ['CUSTOMER', 'ADMIN', 'DELIVERY_PARTNER'], example: 'CUSTOMER' },
                        is_active: { type: 'boolean', example: true },
                        default_city_id: { type: 'integer', example: 1 },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 101 },
                        name: { type: 'string', example: 'Full Cream Milk' },
                        price_paisa: { type: 'integer', example: 6600, description: 'Price in paisa (₹66.00)' },
                        image_url: { type: 'string', example: 'https://doodhly.com/img/milk.png' },
                        is_active: { type: 'boolean', example: true }
                    }
                },
                Wallet: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 501 },
                        user_id: { type: 'integer', example: 1 },
                        balance: { type: 'integer', example: 50000, description: 'Balance in paisa (₹500.00)' }
                    }
                }
            }
        },
        security: [
            {
                BearerAuth: []
            }
        ]
    },
    apis: [
        './src/modules/**/*.controller.ts',
        './src/modules/**/*.routes.ts'
    ]
};

const swaggerSpec = swaggerJsdoc(options);

// Custom CSS for Doodhly Branding (Blue #0F2C59, Green #43A047)
const customCss = `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .info .title { color: #0F2C59; font-family: sans-serif; }
    .swagger-ui .info .description h3 { color: #43A047; }
    .swagger-ui .scheme-container { background: #f8fafc; box-shadow: none; border-bottom: 1px solid #e2e8f0; }
    .swagger-ui .btn.authorize { color: #43A047; border-color: #43A047; }
    .swagger-ui .btn.authorize svg { fill: #43A047; }
    .swagger-ui .opblock.opblock-get .opblock-summary { border-color: #61affe; background: #ecf6ff; }
    .swagger-ui .opblock.opblock-post .opblock-summary { border-color: #49cc90; background: #e8f6f0; }
    .swagger-ui .opblock.opblock-delete .opblock-summary { border-color: #f93e3e; background: #fbecec; }
    .swagger-ui .opblock.opblock-patch .opblock-summary { border-color: #50e3c2; background: #e6fcf7; }
`;

/**
 * Setup Swagger UI Express app
 */
export function setupSwagger(app: Express) {
    // Serve Swagger UI at /api-docs
    app.use(
        '/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            explorer: false,
            customSiteTitle: 'Doodhly API Reference',
            customCss: customCss,
            swaggerOptions: {
                persistAuthorization: true, // Keep auth token on refresh
                filter: true,              // Enable endpoint filtering
                displayRequestDuration: true, // Show timing
                docExpansion: 'none',      // Collapse all tags by default
                defaultModelRendering: 'model',
                tryItOutEnabled: true
            }
        })
    );

    // Serve raw OpenAPI JSON spec
    app.get('/api-docs.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    console.log('📚 Swagger documentation available at /api-docs');
}

export { swaggerSpec };
