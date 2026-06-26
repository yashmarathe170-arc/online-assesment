import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';
import Notification from '../models/Notification.js';
import { notifyUser } from '../services/socketService.js';

// @desc    Create a Quiz
// @route   POST /api/quizzes
// @access  Private/Instructor
export const createQuiz = async (req, res, next) => {
  try {
    const { title, courseId, timer, questions } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Associated course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to create quizzes for this course' });
    }

    const quiz = await Quiz.create({
      title,
      course: courseId,
      timer: timer || 10,
      questions,
    });

    res.status(201).json({ success: true, message: 'Quiz created successfully', quiz });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Quizzes for a Course
// @route   GET /api/quizzes/course/:courseId
// @access  Private
export const getCourseQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId });

    // Format quiz response: if requester is a Student, hide correctAnswerIndex for questions
    const formattedQuizzes = quizzes.map((quiz) => {
      const quizObj = quiz.toObject();
      if (req.user.role === 'Student') {
        quizObj.questions = quizObj.questions.map((q) => {
          const { correctAnswerIndex, ...questionWithoutAnswer } = q;
          return questionWithoutAnswer;
        });
      }
      return quizObj;
    });

    res.status(200).json({ success: true, count: formattedQuizzes.length, quizzes: formattedQuizzes });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit Quiz Answers & Calculate Score
// @route   POST /api/quizzes/:id/submit
// @access  Private/Student
export const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body; // Array of selected option indexes matching quiz questions index
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Double check if student is enrolled in the parent course
    const course = await Course.findById(quiz.course);
    if (!course || !course.students.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized: You are not enrolled in this course' });
    }

    let score = 0;
    const totalQuestions = quiz.questions.length;

    // Calculate score
    quiz.questions.forEach((question, index) => {
      if (answers && answers[index] !== undefined && answers[index] === question.correctAnswerIndex) {
        score++;
      }
    });

    // Record attempt
    const attempt = {
      student: req.user.id,
      score,
      totalQuestions,
      attemptedAt: new Date(),
    };

    quiz.attempts.push(attempt);
    await quiz.save();

    // Create system notification
    const quizNotification = await Notification.create({
      receiver: req.user.id,
      type: 'success',
      message: `You completed the quiz "${quiz.title}" with a score of ${score}/${totalQuestions}.`,
    });
    notifyUser(req.user.id, quizNotification);

    res.status(200).json({
      success: true,
      message: 'Quiz submitted and graded successfully',
      score,
      totalQuestions,
      attempt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Quiz Details By ID
// @route   GET /api/quizzes/:id
// @access  Private
export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const quizObj = quiz.toObject();
    // Cheating protection: strip correct answers for students
    if (req.user.role === 'Student') {
      quizObj.questions = quizObj.questions.map((q) => {
        const { correctAnswerIndex, ...questionWithoutAnswer } = q;
        return questionWithoutAnswer;
      });
    }

    res.status(200).json({ success: true, quiz: quizObj });
  } catch (error) {
    next(error);
  }
};
