// src/AppRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/auth/LandingPage'; // Assuming LandingPage has been moved out of /auth based on common usage
import LoginClass from './pages/auth/LoginClass'; // Path updated for Class Login
import LoginManagement from './pages/auth/LoginManagement'; // Path updated for Management Login
import Register from './pages/auth/Register';
import AdminPortal from './pages/admin/AdminPortal';
import SchoolGroupPortal from './pages/schoolGroup/SchoolGroupPortal';
import SchoolPortal from './pages/school/SchoolPortal';
import TeacherPortal from './pages/teacher/TeacherPortal';
import StudentPortal from './pages/student/StudentPortal';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login-class" element={<LoginClass />} />   // New route for Class Login
      <Route path="/login-management" element={<LoginManagement />} /> // New route for Management Login
      <Route path="/register" element={<Register />} />

      <Route path="/admin" element={<AdminPortal />} />
      <Route path="/school-group" element={<SchoolGroupPortal />} />
      <Route path="/school" element={<SchoolPortal />} />
      <Route path="/teacher" element={<TeacherPortal />} />
      <Route path="/student" element={<StudentPortal />} />

      <Route path="*" element={<div className="text-center mt-10">404 Not Found</div>} /> // Catch-all for undefined routes
    </Routes>
  );
}
