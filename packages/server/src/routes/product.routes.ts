import { Router } from 'express';
import { z } from 'zod';
import { productController } from '../controllers/product.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema, productFiltersSchema } from '@sellwise/shared';

const updateStockSchema = z.object({
  quantityChange: z.number(),
});

const bulkImportSchema = z.object({
  products: z.array(createProductSchema).min(1).max(1000),
});

// Uses mergeParams to access :storeId from the parent router
const router = Router({ mergeParams: true });

// All product routes require authentication and store access
router.use(authenticate);
router.use(requireRole(['owner', 'manager']));

router.get('/', validate(productFiltersSchema), productController.list);
router.post('/', validate(createProductSchema), productController.create);
router.post('/bulk', validate(bulkImportSchema), productController.bulkImport);
router.get('/:id', productController.get);
router.get('/:id/forecast', productController.getForecasts);
router.put('/:id', validate(updateProductSchema), productController.update);
router.delete('/:id', requireRole(['owner']), productController.delete);
router.patch('/:id/stock', validate(updateStockSchema), productController.updateStock);

export default router;