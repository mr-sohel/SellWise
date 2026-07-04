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
import { authenticate } from '../middleware/authenticate';
import { requireStoreMembership } from '../middleware/requireStoreMembership';

const router = Router();

router.use('/auth', authRoutes);
router.use('/stores', storeRoutes);
router.use('/stores/:storeId/products', authenticate, requireStoreMembership, productRoutes);
router.use('/stores/:storeId/orders', authenticate, requireStoreMembership, orderRoutes);
router.use('/stores/:storeId/customers', authenticate, requireStoreMembership, customerRoutes);
router.use('/stores/:storeId/expenses', authenticate, requireStoreMembership, expenseRoutes);
router.use('/stores/:storeId/analytics', authenticate, requireStoreMembership, analyticsRoutes);
router.use('/stores/:storeId/alerts', authenticate, requireStoreMembership, alertRoutes);
router.use('/stores/:storeId/categories', authenticate, requireStoreMembership, categoryRoutes);
router.use('/webhooks', webhookRoutes);

export default router;