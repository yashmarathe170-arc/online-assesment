import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Course from './models/Course.js';
import Assignment from './models/Assignment.js';
import Quiz from './models/Quiz.js';
import Certificate from './models/Certificate.js';
import Notification from './models/Notification.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected!');

    // Clear existing records
    console.log('Purging database collections...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Assignment.deleteMany({});
    await Quiz.deleteMany({});
    await Certificate.deleteMany({});
    await Notification.deleteMany({});

    console.log('Seeding default users...');
    // Seeding users (their passwords will be hashed automatically by userSchema pre-save hook)
    const admin = await User.create({
      name: 'Emma Watson (Admin)',
      email: 'admin@eduverse.com',
      password: 'password123',
      role: 'Admin',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    });

    const instructor = await User.create({
      name: 'Prof. Richard Feynman',
      email: 'instructor@eduverse.com',
      password: 'password123',
      role: 'Instructor',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    });

    const student = await User.create({
      name: 'John Doe (Student)',
      email: 'student@eduverse.com',
      password: 'password123',
      role: 'Student',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    });

    console.log('Seeding courses...');
    const course1 = await Course.create({
      title: 'Full Stack Web Development with MERN Stack',
      description: 'Master React, Node.js, Express, and MongoDB by building production-grade web applications from scratch. This course includes deep-dives into database design, API security, and real-time sockets.',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      instructor: instructor._id,
      students: [student._id],
      lessons: [
        {
          title: 'Introduction to MERN & Project Setup',
          content: 'In this lesson, we cover the basics of React Vite configurations, setting up Node environments, and establishing hot reloading with nodemon.',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          duration: 12,
        },
        {
          title: 'MongoDB & Mongoose Schemas design',
          content: 'Deep dive into Mongoose modeling, sub-documents, validators, pre-save hooks, and relationships mapping.',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          duration: 20,
        },
        {
          title: 'JWT Authentication & Refresh Tokens',
          content: 'Securing routes, signing and verifying JSON Web Tokens (JWT), HTTPOnly cookies, and building an automated token refreshing middleware.',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          duration: 25,
        },
        {
          title: 'Real-time WebSockets with Socket.io',
          content: 'Understanding sockets, establishing events handshakes, broadcasting notifications, and connecting socket triggers in controllers.',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          duration: 18,
        },
      ],
      progress: [
        {
          student: student._id,
          completedLessons: [], // Student starts with no lessons completed
        },
      ],
      published: true,
    });

    console.log('Seeding assignments...');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // Due in 7 days
    await Assignment.create({
      title: 'Build secure REST API for Blogging application',
      description: 'Design a REST API utilizing JWT authentication, Bcrypt passwords hashing, and Express validator sanitizations. Submit your submission as a single PDF document outlining server structure and code snippets.',
      course: course1._id,
      dueDate: futureDate,
      attachments: '',
      submissions: [],
    });

    console.log('Seeding quizzes...');
    await Quiz.create({
      title: 'MERN Stack & JWT Authentication Quiz',
      course: course1._id,
      timer: 10, // 10 minutes
      questions: [
        {
          questionText: 'Which HTTP header holds the authentication JWT access token by standard conventions?',
          options: ['Content-Type', 'Authorization', 'X-Auth-Token', 'Cookie'],
          correctAnswerIndex: 1, // Authorization
        },
        {
          questionText: 'What is the purpose of using HTTPOnly cookies to store refresh tokens?',
          options: [
            'To speed up loading times',
            'To enable frontend javascript to read the token',
            'To prevent cross-site scripting (XSS) theft of the token',
            'To make the token run on older browsers',
          ],
          correctAnswerIndex: 2, // To prevent XSS
        },
        {
          questionText: 'In MongoDB/Mongoose, which function allows referencing other collections documents?',
          options: ['.include()', '.lookup()', '.populate()', '.join()'],
          correctAnswerIndex: 2, // .populate()
        },
      ],
      attempts: [],
    });

    console.log('Seeding notifications...');
    await Notification.create({
      receiver: student._id,
      type: 'info',
      message: 'Welcome to EduVerse LMS! You have been auto-enrolled in the MERN Full Stack course for testing.',
    });

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
