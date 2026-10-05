import { Router } from 'express';
import { getUsers, getUserById, updateUser, deleteUser, toggleUserStatus } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
router.get('/', authenticate, authorize('ADMIN'), getUsers);
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, updateUser);
router.patch('/:id/toggle', authenticate, authorize('ADMIN'), toggleUserStatus);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteUser);
export default router;
