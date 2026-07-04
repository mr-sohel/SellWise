import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { validate } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '@sellwise/shared';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', categoryController.list);
router.post('/', requireRole(['owner', 'manager']), validate(createCategorySchema), categoryController.create);
router.patch('/:categoryId', requireRole(['owner', 'manager']), validate(updateCategorySchema), categoryController.update);
router.delete('/:categoryId', requireRole(['owner']), categoryController.remove);

export default router;
