import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, AuthContext } from './context/AuthContext';

import LandingPage from './pages/auth/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Unauthorized from './pages/auth/Unauthorized';

// Login Pages
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

        {/* 🚀 Handle 404 Routes - Redirect Users to Their Portals or Landing Page */}
        <Route path="*" element={<RoleBasedRedirect />} />
      </Routes>
    </AuthProvider>
  );
}

// 🚀 Dynamically Redirect Users Based on Their Role or Send Them to Landing Page
function RoleBasedRedirect() {
  const { user } = useContext(AuthContext);

  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'schoolGroup') return <Navigate to="/school-group" replace />;
  if (user?.role === 'school') return <Navigate to="/school" replace />;
  if (user?.role === 'teacher') return <Navigate to="/teacher" replace />;
  if (user?.role === 'student') return <Navigate to="/student" replace />;
  
  return <Navigate to="/" replace />;
}
