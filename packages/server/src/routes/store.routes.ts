import { Router } from 'express';
import { storeController } from '../controllers/store.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { validate } from '../middleware/validate';
import { createStoreSchema, createMemberSchema, completeOnboardingSchema } from '@sellwise/shared';

const router = Router();

// Store routes must be authenticated
router.use(authenticate);

router.post('/', validate(createStoreSchema), storeController.create);
router.get('/', storeController.list);

// Onboarding
router.patch('/:storeId/onboarding', requireRole(['owner']), validate(completeOnboardingSchema), storeController.completeOnboarding);

// Store profile update
router.patch('/:storeId/profile', requireRole(['owner']), storeController.updateProfile);

// Staff management routes
router.post('/:storeId/members', requireRole(['owner']), validate(createMemberSchema), storeController.createMember);
router.get('/:storeId/members', requireRole(['owner']), storeController.listMembers);
router.delete('/:storeId/members/:userId', requireRole(['owner']), storeController.removeMember);

export default router;
