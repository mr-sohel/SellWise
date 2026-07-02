import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { validate } from '../middleware/validate';
import { createOrderSchema, updateOrderStatusSchema } from '@sellwise/shared';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(requireRole(['owner', 'manager']));

router.get('/', orderController.list);
router.post('/', validate(createOrderSchema), orderController.create);
router.get('/:id', orderController.get);
router.patch('/:id/status', validate(updateOrderStatusSchema), orderController.updateStatus);

export default router;
