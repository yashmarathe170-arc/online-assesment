import express from 'express';
import { createQuiz, getCourseQuizzes, submitQuiz, getQuizById } from '../controllers/quizController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Authentication required

router.get('/course/:courseId', getCourseQuizzes);
router.get('/:id', getQuizById);

// Student actions
router.post('/:id/submit', restrictTo('Student'), submitQuiz);

// Instructor / Admin actions
router.post('/', restrictTo('Instructor', 'Admin'), createQuiz);

export default router;
