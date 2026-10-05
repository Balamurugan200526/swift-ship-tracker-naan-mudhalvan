import { Router } from 'express';
import { getOverview, getParcelsReport, getDeliveriesReport, getAgentPerformance } from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
router.get('/overview', authenticate, authorize('ADMIN', 'SUPPORT'), getOverview);
router.get('/parcels', authenticate, authorize('ADMIN', 'SUPPORT'), getParcelsReport);
router.get('/deliveries', authenticate, authorize('ADMIN', 'SUPPORT'), getDeliveriesReport);
router.get('/agents', authenticate, authorize('ADMIN'), getAgentPerformance);
export default router;
