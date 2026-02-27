import { Router } from 'express';
import { healthCheck, livenessProbe, readinessProbe } from './health.controller';

const router = Router();

// Main health check endpoint
router.get('/health', healthCheck);

// Kubernetes-compatible probes
router.get('/health/live', livenessProbe);   // Liveness probe
router.get('/health/ready', readinessProbe); // Readiness probe

export default router;
