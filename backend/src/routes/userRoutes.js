import express from 'express';
import {
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from '../controllers/userController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect); // All user routes are protected

router.get('/profile', getProfile);
router.put('/profile', upload.single('avatar'), updateProfile);

// Admin-only endpoints
router.get('/', restrictTo('Admin'), getAllUsers);
router.put('/:id/role', restrictTo('Admin'), updateUserRole);
router.delete('/:id', restrictTo('Admin'), deleteUser);

export default router;
