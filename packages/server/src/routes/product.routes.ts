import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema, productFiltersSchema } from '@sellwise/shared';

// Uses mergeParams to access :storeId from the parent router
const router = Router({ mergeParams: true });

// All product routes require authentication and store access
router.use(authenticate);
router.use(requireRole(['owner', 'manager']));

router.get('/', validate(productFiltersSchema), productController.list);
router.post('/', validate(createProductSchema), productController.create);
router.post('/bulk', productController.bulkImport); // Add dedicated schema for bulk if needed
router.get('/:id', productController.get);
router.put('/:id', validate(updateProductSchema), productController.update);
router.delete('/:id', requireRole(['owner']), productController.delete);
router.patch('/:id/stock', productController.updateStock);

export default router;