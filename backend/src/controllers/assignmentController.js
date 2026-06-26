import Assignment from '../models/Assignment.js';
import Course from '../models/Course.js';
import Notification from '../models/Notification.js';
import { notifyUser } from '../services/socketService.js';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import fs from 'fs';

// @desc    Create an Assignment
// @route   POST /api/assignments
// @access  Private/Instructor
export const createAssignment = async (req, res, next) => {
  try {
    const { title, description, courseId, dueDate } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Associated course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to create assignments for this course' });
    }

    let attachmentUrl = '';
    if (req.file) {
      if (isCloudinaryConfigured) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: 'eduverse/assignments/briefs',
        });
        attachmentUrl = uploadResult.secure_url;
        fs.unlinkSync(req.file.path);
      } else {
        attachmentUrl = `/uploads/assignments/${req.file.filename}`;
      }
    }

    const assignment = await Assignment.create({
      title,
      description,
      course: courseId,
      dueDate,
      attachments: attachmentUrl,
    });

    // Notify all enrolled students
    for (const studentId of course.students) {
      const assignmentNotification = await Notification.create({
        receiver: studentId,
        type: 'assignment',
        message: `A new assignment "${title}" has been posted in course "${course.title}".`,
      });
      notifyUser(studentId.toString(), assignmentNotification);
    }

    res.status(201).json({ success: true, message: 'Assignment created successfully', assignment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Assignments for a Course
// @route   GET /api/assignments/course/:courseId
// @access  Private
export const getCourseAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate('course', 'title instructor')
      .sort({ dueDate: 1 });

    res.status(200).json({ success: true, count: assignments.length, assignments });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit an Assignment (Upload PDF)
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
export const submitAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('course', 'title instructor');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF submission' });
    }

    let submissionUrl = '';
    if (isCloudinaryConfigured) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'eduverse/assignments/submissions',
      });
      submissionUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    } else {
      submissionUrl = `/uploads/assignments/${req.file.filename}`;
    }

    // Check if student has already submitted, if so, replace the entry, otherwise push
    const existingIndex = assignment.submissions.findIndex(
      (sub) => sub.student.toString() === req.user.id
    );

    const submissionPayload = {
      student: req.user.id,
      pdfUrl: submissionUrl,
      submittedAt: new Date(),
      grade: '',
      feedback: '',
    };

    if (existingIndex > -1) {
      assignment.submissions[existingIndex] = submissionPayload;
    } else {
      assignment.submissions.push(submissionPayload);
    }

    await assignment.save();

    // Notify Instructor
    const instructorNotification = await Notification.create({
      sender: req.user.id,
      receiver: assignment.course.instructor,
      type: 'assignment',
      message: `${req.user.name} submitted assignment "${assignment.title}" for "${assignment.course.title}".`,
    });
    notifyUser(assignment.course.instructor.toString(), instructorNotification);

    res.status(200).json({ success: true, message: 'Assignment submitted successfully', assignment });
  } catch (error) {
    next(error);
  }
};

// @desc    Grade & Provide Feedback for Student Submission
// @route   PUT /api/assignments/:id/grade
// @access  Private/Instructor
export const gradeSubmission = async (req, res, next) => {
  try {
    const { studentId, grade, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id).populate('course', 'title instructor');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Authorization
    if (assignment.course.instructor.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to grade this assignment' });
    }

    const submissionIndex = assignment.submissions.findIndex(
      (sub) => sub.student.toString() === studentId
    );

    if (submissionIndex === -1) {
      return res.status(404).json({ success: false, message: 'No submission found for this student' });
    }

    assignment.submissions[submissionIndex].grade = grade;
    assignment.submissions[submissionIndex].feedback = feedback;

    await assignment.save();

    // Notify Student
    const studentNotification = await Notification.create({
      receiver: studentId,
      type: 'grade',
      message: `Your submission for assignment "${assignment.title}" in "${assignment.course.title}" has been graded: ${grade}.`,
    });
    notifyUser(studentId, studentNotification);

    res.status(200).json({ success: true, message: 'Submission graded successfully', assignment });
  } catch (error) {
    next(error);
  }
};
