import { Router } from 'express';
import { storeController } from '../controllers/store.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createStoreSchema } from '@sellwise/shared';

const router = Router();

// Store routes must be authenticated
router.use(authenticate);

router.post('/', validate(createStoreSchema), storeController.create);
router.get('/', storeController.list);

export default router;