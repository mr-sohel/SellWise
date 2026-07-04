import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { requireRole } from '../middleware/requireRole';

const router = Router({ mergeParams: true });

router.use(requireRole(['owner', 'manager']));

router.get('/overview', analyticsController.getOverview);
router.get('/demand-forecast', analyticsController.getDemandForecast);

export default router;