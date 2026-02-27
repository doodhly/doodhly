
import { Router } from 'express';
import { routeOptimizationController } from './route-optimization.controller';

const router = Router();

router.post('/optimize', routeOptimizationController.optimizeRoute);

export default router;
