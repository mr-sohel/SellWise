import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';
import { webhookAuth } from '../middleware/webhookAuth';
import { validate } from '../middleware/validate';
import { createOrderSchema } from '@sellwise/shared';

const router = Router();

// Webhook routes use API Key auth instead of JWT
router.use(webhookAuth);

router.post('/orders', validate(createOrderSchema), webhookController.handleOrder);

export default router;