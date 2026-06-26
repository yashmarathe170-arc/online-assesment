import express from 'express';
import {
  generateCertificate,
  getMyCertificates,
  getCertificateById,
} from '../controllers/certificateController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Authentication required

// Student-only endpoints
router.post('/generate', restrictTo('Student'), generateCertificate);
router.get('/my', restrictTo('Student'), getMyCertificates);

// Detail lookup (accessible by students, instructors, and admins)
router.get('/:id', getCertificateById);

export default router;
