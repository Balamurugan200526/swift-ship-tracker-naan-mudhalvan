import { Router } from 'express';
import { getDeliveries, getDeliveryById, createDelivery, updateDelivery, updateLocation, assignAgent } from '../controllers/delivery.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
router.get('/', authenticate, getDeliveries);
router.get('/:id', authenticate, getDeliveryById);
router.post('/', authenticate, authorize('ADMIN'), createDelivery);
router.put('/:id', authenticate, authorize('ADMIN', 'DELIVERY_AGENT'), updateDelivery);
router.patch('/:id/location', authenticate, authorize('ADMIN', 'DELIVERY_AGENT'), updateLocation);
router.patch('/:id/assign', authenticate, authorize('ADMIN'), assignAgent);
export default router;
