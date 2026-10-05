import { Router } from 'express';
import {
  getParcels, getParcelById, createParcel, updateParcel,
  updateParcelStatus, deleteParcel, trackParcel
} from '../controllers/parcel.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
// Public tracking route (must be before /:id)
router.get('/track/:parcelId', trackParcel);
// Protected routes
router.get('/', authenticate, getParcels);
router.get('/:id', authenticate, getParcelById);
router.post('/', authenticate, authorize('ADMIN', 'CUSTOMER'), createParcel);
router.put('/:id', authenticate, authorize('ADMIN'), updateParcel);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'DELIVERY_AGENT'), updateParcelStatus);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteParcel);
export default router;
