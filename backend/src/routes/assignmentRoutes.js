import express from 'express';
import {
  createAssignment,
  getCourseAssignments,
  submitAssignment,
  gradeSubmission,
} from '../controllers/assignmentController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect); // Require auth for all assignment operations

// Course assignments list
router.get('/course/:courseId', getCourseAssignments);

// Student actions
router.post('/:id/submit', restrictTo('Student'), upload.single('assignment'), submitAssignment);

// Instructor / Admin actions
router.post('/', restrictTo('Instructor', 'Admin'), upload.single('attachment'), createAssignment);
router.put('/:id/grade', restrictTo('Instructor', 'Admin'), gradeSubmission);

export default router;
