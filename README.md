
# EduVerse LMS - Production-Grade Learning Management System

EduVerse is a full-featured, production-ready Online Learning Management System (LMS) built with the MERN stack (MongoDB, Express, React, Node.js). 

## 🚀 Key Features

* **Multi-Role Authentication System**: Separate dashboards and pathways for Students, Instructors, and Administrators.
* **Auto-Refresh JWT Tokens**: Secure access control utilizing HttpOnly Refresh cookies and memory access tokens with automated sliding-session refreshing.
* **Course Syllabus Builder**: Drag-and-drop styled list of lectures, custom media thumbnails, and course publication states.
* **PDF Upload Submissions**: Student assignment submission validation and grading portal for instructors.
* **Timed Quiz Engine**: Live countdown timers, anti-cheat server checks (question answers hidden from students), auto-submission on timeouts, and analytics score metrics.
* **Automated PDF Certificates**: Dynamic completion check, custom landscape PDF rendering on the fly with issuing credentials and download paths.
* **Real-time Socket.io Notifications**: Real-time notifications for enrollment alerts, assignment postings, grading updates, and certificates.
* **Rich Glassmorphic Dark UI**: Modern theme styling using Tailwind CSS v4, collapsible sidebars, and Chart.js metrics widgets.

---

## 🛠 Tech Stack

* **Frontend**: React + Vite, React Router DOM, Redux Toolkit, Axios, Tailwind CSS v4, React Hook Form, Chart.js, Socket.io Client, Lucide Icons.
* **Backend**: Node.js, Express.js, MongoDB + Mongoose, JWT + Cookie Parser, Bcryptjs, Multer, Cloudinary, Nodemailer, Socket.io, PDFKit.
* **Deployment**: Vercel (Frontend), Render (Backend), MongoDB Atlas (Database).
  
```
online-assesment/
├── backend/
│   ├── src/
│   │   ├── config/          # db.js, cloudinary.js
│   │   ├── controllers/     # MVC controller actions
│   │   ├── middleware/      # authMiddleware, uploadMiddleware, errorMiddleware
│   │   ├── models/          # User, Course, Assignment, Quiz, Certificate, Notification
│   │   ├── routes/          # Express route bindings
│   │   ├── services/        # emailService, pdfService, socketService
│   │   ├── index.js         # Express bootstraper & WebSockets server
│   │   └── seed.js          # DB seeder script
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/      # UI components (Layout, ProtectedRoute)
    │   ├── context/         # ThemeContext (light/dark mode toggle)
    │   ├── hooks/           # useSocket, useAuth custom hooks
    │   ├── pages/           # Lobby, Login, Register, VerifyEmail, Dashboards
    │   ├── store/           # Redux Toolkit config and slices (auth, courses, notifications)
    │   ├── utils/           # api.js Axios client
    │   ├── App.jsx          # Route mapping
    │   ├── index.css        # Tailwind v4 imports and custom glassmorphism styles
    │   └── main.jsx         # Render bootsrapper
    ├── vercel.json          # SPA routing config
    └── package.json
```

---

## 🔧 Installation & Local Setup

### Step 1: Clone & Configure Environments

Ensure you have Node.js (v18+) and npm installed.

1. Create a `backend/.env` file with the following variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://yashmarathe170_db_user:39tBNg0Lb2Hf90Om@cluster0.dqr0quy.mongodb.net/eduverse?appName=Cluster0
   JWT_ACCESS_SECRET=your_jwt_access_secret_key
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=
   SMTP_PASS=
   SMTP_FROM=noreply@eduverse.com
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   FRONTEND_URL=http://localhost:5173
   ```
   *(Note: SMTP and Cloudinary are optional. If left blank, the system automatically falls back to local console email logging and public/uploads local directory storage!)*

2. Create a `frontend/.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_WS_URL=http://localhost:5000
   ```

### Step 2: Seed the Database

Populate the database with pre-configured Admin, Instructor, Student, Courses, Assignments, and Quizzes:
```bash
cd backend
npm run seed
```
This prints verification URLs and credentials to the console.

### Step 3: Run the Services

1. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```
   *(Runs on http://localhost:5000)*

2. **Start Frontend Server**:
   ```bash
   cd ../frontend
   npm run dev
   ```
   *(Runs on http://localhost:5173)*

---

## 🔑 Seeder Credentials

* **Student Account**:
  * Email: `student@eduverse.com`
  * Password: `password123`
* **Instructor Account**:
  * Email: `instructor@eduverse.com`
  * Password: `password123`
* **Admin Account**:
  * Email: `admin@eduverse.com`
  * Password: `password123`

---

## ☁️ Production Deployment Guide

### Deploying Backend (Render)

1. Sign up on **Render.com** and connect your GitHub repository.
2. Select **New Web Service**. Set **Root Directory** to `backend`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `npm start`.
5. Under **Environment**, add the configuration parameters matching `backend/.env`. Set `NODE_ENV` to `production`. Set `FRONTEND_URL` to your production Vercel link.

### Deploying Frontend (Vercel)

1. Sign up on **Vercel.com** and import your repository.
2. Set **Root Directory** to `frontend`.
3. Vercel automatically detects the Vite configuration. Set build output folder to `dist`.
4. Under project settings, add the environment variables:
   * `VITE_API_URL`: Your Render backend deployment URL (e.g. `https://eduverse-api.onrender.com/api`).
   * `VITE_WS_URL`: Your Render backend base URL (e.g. `https://eduverse-api.onrender.com`).
5. Vercel will automatically read `vercel.json` and deploy with single-page routing enabled.
 