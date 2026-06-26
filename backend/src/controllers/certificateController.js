import fs from 'fs';
import path from 'path';
import Certificate from '../models/Certificate.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { generateCertificatePDF } from '../services/pdfService.js';
import Notification from '../models/Notification.js';
import { notifyUser } from '../services/socketService.js';

// @desc    Generate Certificate for Course Completion
// @route   POST /api/certificates/generate
// @access  Private/Student
export const generateCertificate = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({ student: userId, course: courseId }).populate(
      'course',
      'title'
    );
    if (existingCert) {
      return res.status(200).json({
        success: true,
        message: 'Certificate already generated',
        certificate: existingCert,
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check progress
    const progressObj = course.progress.find((p) => p.student.toString() === userId);
    if (!progressObj) {
      return res.status(400).json({ success: false, message: 'You are not enrolled in this course' });
    }

    const totalLessons = course.lessons.length;
    const completedLessons = progressObj.completedLessons.length;

    if (totalLessons === 0 || completedLessons < totalLessons) {
      return res.status(400).json({
        success: false,
        message: `Course not completed yet. You completed ${completedLessons}/${totalLessons} lessons.`,
      });
    }

    // Generate unique Certificate Number
    const dateStamp = Date.now().toString().slice(-6);
    const userStamp = userId.slice(-4).toUpperCase();
    const courseStamp = courseId.slice(-4).toUpperCase();
    const certificateNumber = `EDU-${courseStamp}-${userStamp}-${dateStamp}`;

    const student = await User.findById(userId);
    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Generate PDF Buffer
    const pdfBuffer = await generateCertificatePDF(
      student.name,
      course.title,
      certificateNumber,
      formattedDate
    );

    // Save PDF buffer locally
    const filename = `cert-${certificateNumber}.pdf`;
    const certPath = path.join('public/uploads/certificates', filename);
    fs.writeFileSync(certPath, pdfBuffer);

    const pdfUrl = `/uploads/certificates/${filename}`;

    // Save to Database
    const certificate = await Certificate.create({
      student: userId,
      course: courseId,
      pdfUrl,
      certificateNumber,
    });

    // Create Notification
    const certNotification = await Notification.create({
      receiver: userId,
      type: 'success',
      message: `Congratulations! Your certificate for completing "${course.title}" has been issued.`,
    });
    notifyUser(userId, certNotification);

    res.status(201).json({
      success: true,
      message: 'Certificate generated successfully!',
      certificate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current Student Certificates
// @route   GET /api/certificates/my
// @access  Private/Student
export const getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ student: req.user.id })
      .populate('course', 'title description thumbnail')
      .populate('student', 'name email')
      .sort({ issuedAt: -1 });

    res.status(200).json({ success: true, count: certificates.length, certificates });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Certificate By ID
// @route   GET /api/certificates/:id
// @access  Private
export const getCertificateById = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('course', 'title instructor')
      .populate('student', 'name email avatar');

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    res.status(200).json({ success: true, certificate });
  } catch (error) {
    next(error);
  }
};
