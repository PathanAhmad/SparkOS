// src/pages/admin/AdminPortal.jsx
import React, { useState, useContext } from 'react';
import AdminUsers from './components/AdminUsers';
import AdminCourses from './components/AdminCourses';
import AdminNotifications from './components/AdminNotifications';
import { AuthContext } from '../../context/AuthContext';

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('users');
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout && logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen w-screen flex flex-col m-0 p-0">
      {/* Top Navigation Bar */}
      <nav className="w-full bg-gray-100 border-b border-gray-300 flex items-center justify-between p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-gray-700 hover:text-gray-900 focus:outline-none ${activeTab === 'users' ? 'font-semibold' : ''}`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 text-gray-700 hover:text-gray-900 focus:outline-none ${activeTab === 'courses' ? 'font-semibold' : ''}`}
          >
            Courses
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 text-gray-700 hover:text-gray-900 focus:outline-none ${activeTab === 'notifications' ? 'font-semibold' : ''}`}
          >
            Notifications
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 w-screen m-0 p-0">
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'courses' && <AdminCourses />}
        {activeTab === 'notifications' && <AdminNotifications />}
      </div>
    </div>
  );
}
