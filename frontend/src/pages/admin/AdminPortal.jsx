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
    <div className="min-h-screen w-screen flex flex-col bg-gray-900 text-white">
      {/* 🔹 Top Navigation Bar */}
      <nav className="w-full bg-gray-800 shadow-md flex items-center justify-between px-6 py-4 border-b border-gray-700">
        {/* Left Side - Tabs */}
        <div className="flex space-x-4">
          {[
            { id: 'users', label: 'Users' },
            { id: 'courses', label: 'Courses' },
            { id: 'notifications', label: 'Notifications' }
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 rounded-md transition-all font-medium text-gray-300 ${
                activeTab === id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right Side - Logout Button */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-all shadow-md"
        >
          Logout
        </button>
      </nav>

      {/* 🔹 Main Content */}
      <div className="flex-1 w-full p-6">
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'courses' && <AdminCourses />}
        {activeTab === 'notifications' && <AdminNotifications />}
      </div>
    </div>
  );
}
