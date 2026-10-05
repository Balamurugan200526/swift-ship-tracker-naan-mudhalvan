import { Router } from 'express';
import { chat } from '../controllers/ai.controller';

const router = Router();
// Public - no auth required for AI chat
router.post('/chat', chat);
export default router;
