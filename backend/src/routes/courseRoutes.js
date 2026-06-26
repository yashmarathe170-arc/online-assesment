import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  completeLesson,
  getEnrolledCourses,
  getInstructorCourses,
} from '../controllers/courseController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Protected routes
router.use(protect);

// Student endpoints
router.get('/enrolled/me', restrictTo('Student'), getEnrolledCourses);
router.post('/:id/enroll', restrictTo('Student'), enrollCourse);
router.put('/:id/lessons/:lessonId/complete', restrictTo('Student'), completeLesson);

// Instructor / Admin endpoints
router.get('/instructor/me', restrictTo('Instructor', 'Admin'), getInstructorCourses);
router.post('/', restrictTo('Instructor', 'Admin'), upload.single('thumbnail'), createCourse);
router.put('/:id', restrictTo('Instructor', 'Admin'), upload.single('thumbnail'), updateCourse);
router.delete('/:id', restrictTo('Instructor', 'Admin'), deleteCourse);

export default router;
