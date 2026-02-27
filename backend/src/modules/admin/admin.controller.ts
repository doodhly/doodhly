
import { Router, Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { MetricsService } from './metrics.service';
import { requireAuth, restrictTo } from '../../core/middleware/auth.middleware';
import { AppError } from '../../core/errors/app-error';

const router = Router();
const adminService = new AdminService();
const metricsService = new MetricsService();

// All routes require ADMIN role
router.use(requireAuth, restrictTo('ADMIN'));

router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cityId = Number(req.user?.city_id);
        if (!cityId) throw new AppError('City Context Required', 400);

        const summary = await adminService.getDashboardSummary(cityId);
        res.status(200).json(summary);
    } catch (err) {
        next(err);
    }
});

router.get('/metrics/dashboard', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dashboard = await metricsService.getDashboardMetrics();
        res.status(200).json(dashboard);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /admin/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve list of all products (admin only)
 *     tags:
 *       - Admin - Products
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price_paisa:
 *                     type: integer
 *                     description: Price in paisa (100 paisa = ₹1)
 *                   is_active:
 *                     type: boolean
 *       401:
 *         description: Unauthorized - JWT required
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/products', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await adminService.getProducts();
        res.status(200).json(products);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /admin/products/{id}/toggle:
 *   patch:
 *     summary: Toggle product active status
 *     description: Enable or disable a product (admin only)
 *     tags:
 *       - Admin - Products
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_active
 *             properties:
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Product status updated successfully
 *       400:
 *         description: Bad request - is_active field required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.patch('/products/:id/toggle', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        if (is_active === undefined) throw new AppError('is_active field required', 400);

        await adminService.toggleProduct(Number(id), is_active);
        res.status(200).json({ status: 'success' });
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /admin/products:
 *   post:
 *     summary: Create a new product
 *     description: Add a new product to the catalog (admin only)
 *     tags:
 *       - Admin - Products
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price_paisa
 *               - is_active
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pure Cow Milk
 *               description:
 *                 type: string
 *                 example: Fresh cow milk delivered daily by 10 AM
 *               price_paisa:
 *                 type: integer
 *                 description: Price in paisa (100 paisa = ₹1)
 *                 example: 6000
 *               category:
 *                 type: string
 *                 example: MILK
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 price_paisa:
 *                   type: integer
 *                 is_active:
 *                   type: boolean
 *       400:
 *         description: Bad request - Missing required fields
 *       401:
 *         description: Unauthorized - JWT required
 *       403:
 *         description: Forbidden - Admin role required
 */
router.post('/products', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await adminService.createProduct(req.body);
        res.status(201).json(product);
    } catch (err) {
        next(err);
    }
});

router.patch('/products/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminService.updateProduct(Number(req.params.id), req.body);
        res.status(200).json({ status: 'success' });
    } catch (err) {
        next(err);
    }
});

router.get('/customers', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cityId = Number(req.user?.city_id);
        const { search } = req.query;
        const customers = await adminService.getCustomers(cityId, search as string);
        res.status(200).json(customers);
    } catch (err) {
        next(err);
    }
});

router.post('/customers/:id/wallet-adjust', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const adminId = Number(req.user?.id);
        const userId = Number(req.params.id);
        const { amount_paisa, note } = req.body;

        if (!amount_paisa || !note) throw new AppError('Amount and Note required', 400);

        const result = await adminService.adjustWallet(adminId, userId, amount_paisa, note);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

router.patch('/customers/:id/toggle-status', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        if (is_active === undefined) throw new AppError('is_active field required', 400);

        await adminService.toggleCustomerStatus(Number(id), is_active);
        res.status(200).json({ status: 'success' });
    } catch (err) {
        next(err);
    }
});

router.get('/subscriptions', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cityId = Number(req.user?.city_id);
        const subscriptions = await adminService.getSubscriptionsSummary(cityId);
        res.status(200).json(subscriptions);
    } catch (err) {
        next(err);
    }
});

router.get('/run-sheets', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cityId = Number(req.user?.city_id);
        const { date } = req.query;

        if (!cityId || !date) throw new AppError('City ID and Date required', 400);

        const data = await adminService.getRunSheets(cityId, date as string);
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
});

// --- User Management Endpoints ---

import { validate } from '../../core/middleware/validate.middleware';
import { listUsersSchema, updateUserRoleSchema, createUserSchema } from '../../core/validation/admin-users.schema';

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users
 *     description: Get all users with optional filtering and pagination (admin only)
 *     tags:
 *       - Admin - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or phone
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [CUSTOMER, ADMIN, DELIVERY_PARTNER]
 *         description: Filter by role
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by active status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Users list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/users', validate(listUsersSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { search, role, is_active, page, limit } = req.query;
        const data = await adminService.getAllUsers({
            search: search as string,
            role: role as string,
            is_active: is_active as string,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined
        });
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /admin/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     description: Change a user's role (admin only)
 *     tags:
 *       - Admin - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [CUSTOMER, ADMIN, DELIVERY_PARTNER]
 *                 example: ADMIN
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid role value
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: User not found
 */
router.patch('/users/:id/role', validate(updateUserRoleSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        await adminService.updateUserRole(Number(id), role);
        res.status(200).json({ status: 'success', message: 'Role updated successfully' });
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /admin/users/create:
 *   post:
 *     summary: Create new user (quick onboard)
 *     description: Create admin or delivery partner without OTP flow (admin only)
 *     tags:
 *       - Admin - Users
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - name
 *               - role
 *               - default_city_id
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+917247344300"
 *                 description: Phone in E.164 format
 *               name:
 *                 type: string
 *                 example: "New Admin"
 *               role:
 *                 type: string
 *                 enum: [ADMIN, DELIVERY_PARTNER]
 *                 example: ADMIN
 *               default_city_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 phone:
 *                   type: string
 *                 name:
 *                   type: string
 *                 role:
 *                   type: string
 *       400:
 *         description: Bad request - Duplicate phone or invalid data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.post('/users/create', validate(createUserSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await adminService.createUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /admin/impersonate:
 *   post:
 *     summary: Impersonate a customer
 *     description: Generate a JWT to log in as a specific customer for debugging (admin only)
 *     tags:
 *       - Admin - Support
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *             properties:
 *               targetUserId:
 *                 type: integer
 *                 example: 42
 *     responses:
 *       200:
 *         description: Impersonation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: User not found
 */
router.post('/impersonate', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const adminId = Number(req.user?.id);
        const { targetUserId } = req.body;

        if (!targetUserId) throw new AppError('targetUserId is required', 400);

        const result = await adminService.impersonateUser(adminId, Number(targetUserId));

        // Also set as cookie to mimic normal login
        res.cookie('jwt', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        res.status(200).json({ status: 'success', data: result });
    } catch (err) {
        if (err instanceof Error) {
            next(new AppError(err.message, 400));
        } else {
            next(err);
        }
    }
});

export const adminRouter = router;
