import { Router } from 'express';
import { getReceivers, createReceiver, updateReceiver, deleteReceiver, getReceiverParcels } from '../controllers/receiver.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
router.get('/', authenticate, getReceivers);
router.get('/:id/parcels', authenticate, getReceiverParcels);
router.post('/', authenticate, authorize('ADMIN', 'CUSTOMER'), createReceiver);
router.put('/:id', authenticate, authorize('ADMIN'), updateReceiver);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteReceiver);
export default router;
