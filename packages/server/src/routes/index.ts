import { Router } from 'express';
import authRoutes from './auth.routes';
import storeRoutes from './store.routes';
import productRoutes from './product.routes';
import customerRoutes from './customer.routes';
import expenseRoutes from './expense.routes';
import analyticsRoutes from './analytics.routes';
import webhookRoutes from './webhook.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/stores', storeRoutes);
router.use('/stores/:storeId/products', productRoutes);
router.use('/stores/:storeId/customers', customerRoutes);
router.use('/stores/:storeId/expenses', expenseRoutes);
router.use('/stores/:storeId/analytics', analyticsRoutes);
router.use('/webhooks', webhookRoutes);

export default router;