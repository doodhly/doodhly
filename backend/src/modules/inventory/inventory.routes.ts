
import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { requireAuth, restrictTo } from '../../core/middleware/auth.middleware';

const router = Router();
const controller = new InventoryController();

// All routes require Admin
router.use(requireAuth, restrictTo('ADMIN'));

router.get('/forecast', controller.getForecast);
router.post('/forecast/generate', controller.triggerForecast);

export default router;
