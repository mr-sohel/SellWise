import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { requireRole } from '../middleware/requireRole';
import { validate } from '../middleware/validate';
import { createCustomerSchema, updateCustomerSchema, customerFiltersSchema } from '@sellwise/shared';

const router = Router({ mergeParams: true });

router.use(requireRole(['owner', 'manager']));

router.get('/', validate(customerFiltersSchema), customerController.list);
router.post('/', validate(createCustomerSchema), customerController.create);
router.get('/:id', customerController.get);
router.put('/:id', validate(updateCustomerSchema), customerController.update);
router.post('/recalculate-rfm', customerController.recalculateRFM);

export default router;