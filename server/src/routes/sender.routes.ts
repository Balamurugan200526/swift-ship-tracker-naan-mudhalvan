import { Router } from 'express';
import { getSenders, createSender, updateSender, deleteSender, getSenderParcels } from '../controllers/sender.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
router.get('/', authenticate, getSenders);
router.get('/:id/parcels', authenticate, getSenderParcels);
router.post('/', authenticate, authorize('ADMIN', 'CUSTOMER'), createSender);
router.put('/:id', authenticate, authorize('ADMIN'), updateSender);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteSender);
export default router;
