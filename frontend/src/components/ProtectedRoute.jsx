import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, token } = useContext(AuthContext);

  // Wait for auth state to load
  if (token === null || user === null) {
    return <div className="flex justify-center items-center h-screen text-white">Loading...</div>; 
  }

  // 🚀 Redirect to landing page if token expired
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // 🚀 Redirect to their respective dashboard if they are unauthorized
  if (!allowedRoles.includes(user.role)) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'schoolGroup':
        return <Navigate to="/school-group" replace />;
      case 'school':
        return <Navigate to="/school" replace />;
      case 'teacher':
        return <Navigate to="/teacher" replace />;
      case 'student':
        return <Navigate to="/student" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
