import { Router } from 'express';
import { expenseController } from '../controllers/expense.controller';
import { requireRole } from '../middleware/requireRole';
import { validate } from '../middleware/validate';
import { createExpenseSchema, expenseFiltersSchema } from '@sellwise/shared';

const router = Router({ mergeParams: true });

router.use(requireRole(['owner', 'manager']));

router.get('/', validate(expenseFiltersSchema), expenseController.list);
router.post('/', validate(createExpenseSchema), expenseController.create);
router.get('/:id', expenseController.get);
router.delete('/:id', requireRole(['owner']), expenseController.delete);

export default router;