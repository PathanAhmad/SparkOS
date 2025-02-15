import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

import LandingPage from './pages/auth/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Unauthorized from './pages/auth/Unauthorized';

// Add LoginClass & LoginManagement pages
import LoginClass from './pages/auth/LoginClass';
import LoginManagement from './pages/auth/LoginManagement';

// Role-based portals
import AdminPortal from './pages/admin/AdminPortal';
import SchoolGroupPortal from './pages/schoolGroup/SchoolGroupPortal';
import SchoolPortal from './pages/school/SchoolPortal';
import TeacherPortal from './pages/teacher/TeacherPortal';
import StudentPortal from './pages/student/StudentPortal';

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="/login-class" element={<LoginClass />} />
        <Route path="/login-management" element={<LoginManagement />} />

        {/* Protected Routes by Role */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminPortal />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['schoolGroup']} />}>
          <Route path="/school-group" element={<SchoolGroupPortal />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['school']} />}>
          <Route path="/school" element={<SchoolPortal />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
          <Route path="/teacher" element={<TeacherPortal />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student" element={<StudentPortal />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Unauthorized />} />
      </Routes>
    </AuthProvider>
  );
}
