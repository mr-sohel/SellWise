import { Router } from 'express';
import { alertController } from '../controllers/alert.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(requireRole(['owner', 'manager']));

router.get('/', alertController.list);
router.post('/generate', alertController.triggerGeneration);
router.patch('/read-all', alertController.markAllAsRead);
router.patch('/:id/read', alertController.markAsRead);

export default router;
