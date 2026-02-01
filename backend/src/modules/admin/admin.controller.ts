
import { Router, Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { requireAuth, restrictTo } from '../../core/middleware/auth.middleware';
import { AppError } from '../../core/errors/app-error';

const router = Router();
const adminService = new AdminService();

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

router.get('/products', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await adminService.getProducts();
        res.status(200).json(products);
    } catch (err) {
        next(err);
    }
});

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

export const adminRouter = router;
