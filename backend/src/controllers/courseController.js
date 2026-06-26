import Course from '../models/Course.js';
import Notification from '../models/Notification.js';
import { notifyUser } from '../services/socketService.js';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import fs from 'fs';

// @desc    Get All Published Courses (with Search, Filter, Pagination)
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const skip = (page - 1) * limit;

    const query = {};

    // By default, public endpoint only returns published courses unless instructor checks their own
    if (req.query.all !== 'true') {
      query.published = true;
    }

    // Search query keyword matching
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Filter by instructor ID
    if (req.query.instructor) {
      query.instructor = req.query.instructor;
    }

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('instructor', 'name email avatar')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      page,
      pages: Math.ceil(total / limit),
      total,
      count: courses.length,
      courses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Course Details By ID
// @route   GET /api/courses/:id
// @access  Public (Enrolls checklist will verify if student has access to lessons detail)
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email avatar')
      .populate('students', 'name email avatar');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a Course
// @route   POST /api/courses
// @access  Private/Instructor
export const createCourse = async (req, res, next) => {
  try {
    const { title, description, lessons } = req.body;

    let thumbnailUrl = '';
    if (req.file) {
      if (isCloudinaryConfigured) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: 'eduverse/courses',
        });
        thumbnailUrl = uploadResult.secure_url;
        fs.unlinkSync(req.file.path);
      } else {
        thumbnailUrl = `/uploads/thumbnails/${req.file.filename}`;
      }
    }

    // Parse lessons if passed as string JSON
    let parsedLessons = [];
    if (lessons) {
      parsedLessons = typeof lessons === 'string' ? JSON.parse(lessons) : lessons;
    }

    const course = await Course.create({
      title,
      description,
      thumbnail: thumbnailUrl,
      instructor: req.user.id,
      lessons: parsedLessons,
    });

    res.status(201).json({ success: true, message: 'Course created successfully', course });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Course
// @route   PUT /api/courses/:id
// @access  Private/Instructor
export const updateCourse = async (req, res, next) => {
  try {
    const { title, description, lessons, published } = req.body;
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Authorization check
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this course' });
    }

    if (title) course.title = title;
    if (description) course.description = description;
    if (published !== undefined) course.published = published;

    if (lessons) {
      course.lessons = typeof lessons === 'string' ? JSON.parse(lessons) : lessons;
    }

    if (req.file) {
      if (isCloudinaryConfigured) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: 'eduverse/courses',
        });
        course.thumbnail = uploadResult.secure_url;
        fs.unlinkSync(req.file.path);
      } else {
        course.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
      }
    }

    await course.save();

    res.status(200).json({ success: true, message: 'Course updated successfully', course });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Authorization check
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Enroll in a Course
// @route   POST /api/courses/:id/enroll
// @access  Private/Student
export const enrollCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (!course.published) {
      return res.status(400).json({ success: false, message: 'Cannot enroll in an unpublished course' });
    }

    // Check if already enrolled
    if (course.students.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this course' });
    }

    // Add student to course
    course.students.push(req.user.id);
    // Initialize student progress
    course.progress.push({
      student: req.user.id,
      completedLessons: [],
    });

    await course.save();

    // Create system notification for student and instructor
    const studentNotification = await Notification.create({
      receiver: req.user.id,
      type: 'info',
      message: `You have successfully enrolled in "${course.title}". Happy learning!`,
    });
    notifyUser(req.user.id, studentNotification);

    const instructorNotification = await Notification.create({
      sender: req.user.id,
      receiver: course.instructor,
      type: 'announcement',
      message: `${req.user.name} has enrolled in your course "${course.title}".`,
    });
    notifyUser(course.instructor.toString(), instructorNotification);

    res.status(200).json({ success: true, message: 'Successfully enrolled in course' });
  } catch (error) {
    next(error);
  }
};

// @desc    Track Lesson Progress
// @route   PUT /api/courses/:id/lessons/:lessonId/complete
// @access  Private/Student
export const completeLesson = async (req, res, next) => {
  try {
    const { id, lessonId } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const studentProgressIndex = course.progress.findIndex(
      (p) => p.student.toString() === req.user.id
    );

    if (studentProgressIndex === -1) {
      return res.status(400).json({ success: false, message: 'You are not enrolled in this course' });
    }

    const progress = course.progress[studentProgressIndex];

    // Check if lesson is already completed
    if (progress.completedLessons.includes(lessonId)) {
      return res.status(200).json({ success: true, message: 'Lesson already completed', course });
    }

    progress.completedLessons.push(lessonId);
    await course.save();

    res.status(200).json({ success: true, message: 'Lesson progress recorded', course });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Enrolled Courses for Current Student
// @route   GET /api/courses/enrolled
// @access  Private/Student
export const getEnrolledCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ students: req.user.id }).populate(
      'instructor',
      'name email avatar'
    );
    res.status(200).json({ success: true, count: courses.length, courses });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Instructor Courses
// @route   GET /api/courses/instructor
// @access  Private/Instructor
export const getInstructorCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user.id });
    res.status(200).json({ success: true, count: courses.length, courses });
  } catch (error) {
    next(error);
  }
};
