import { Router } from 'express';
import authRoutes from './auth.routes';
import storeRoutes from './store.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import customerRoutes from './customer.routes';
import expenseRoutes from './expense.routes';
import analyticsRoutes from './analytics.routes';
import webhookRoutes from './webhook.routes';
import alertRoutes from './alert.routes';
import categoryRoutes from './category.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/stores', storeRoutes);
router.use('/stores/:storeId/products', productRoutes);
router.use('/stores/:storeId/orders', orderRoutes);
router.use('/stores/:storeId/customers', customerRoutes);
router.use('/stores/:storeId/expenses', expenseRoutes);
router.use('/stores/:storeId/analytics', analyticsRoutes);
router.use('/stores/:storeId/alerts', alertRoutes);
router.use('/stores/:storeId/categories', categoryRoutes);
router.use('/webhooks', webhookRoutes);

export default router;