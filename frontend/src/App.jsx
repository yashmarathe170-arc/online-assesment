import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from './store/authSlice.js';

// Public Pages
import Lobby from './pages/public/Lobby.jsx';
import Login from './pages/public/Login.jsx';
import Register from './pages/public/Register.jsx';
import VerifyEmail from './pages/public/VerifyEmail.jsx';
import ForgotPassword from './pages/public/ForgotPassword.jsx';
import ResetPassword from './pages/public/ResetPassword.jsx';

// Common Layout & Protected route
import Layout from './components/common/Layout.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import MyCourses from './pages/student/MyCourses.jsx';
import CourseDetail from './pages/student/CourseDetail.jsx';
import QuizPlayPage from './pages/student/QuizPlayPage.jsx';
import CertificatesList from './pages/student/CertificatesList.jsx';
import StudentProfile from './pages/student/StudentProfile.jsx';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard.jsx';
import CreateCourse from './pages/instructor/CreateCourse.jsx';
import InstructorAssignments from './pages/instructor/InstructorAssignments.jsx';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageUsers from './pages/admin/ManageUsers.jsx';
import AnalyticsPage from './pages/admin/AnalyticsPage.jsx';

export const App = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, token]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Catalog pages */}
        <Route path="/" element={<Lobby />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Dashboard layouts protected under common layout shell */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Student routes */}
          <Route path="student/dashboard" element={<StudentDashboard />} />
          <Route path="student/courses" element={<MyCourses />} />
          <Route path="student/courses/:id" element={<CourseDetail />} />
          <Route path="student/quizzes/:id" element={<QuizPlayPage />} />
          <Route path="student/certificates" element={<CertificatesList />} />
          <Route path="student/profile" element={<StudentProfile />} />

          {/* Instructor routes */}
          <Route
            path="instructor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Instructor', 'Admin']}>
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="instructor/create-course"
            element={
              <ProtectedRoute allowedRoles={['Instructor', 'Admin']}>
                <CreateCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="instructor/edit-course/:id"
            element={
              <ProtectedRoute allowedRoles={['Instructor', 'Admin']}>
                <CreateCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="instructor/assignments"
            element={
              <ProtectedRoute allowedRoles={['Instructor', 'Admin']}>
                <InstructorAssignments />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* Generic Catch all fallback redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
