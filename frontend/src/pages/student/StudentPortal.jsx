// src/pages/student/StudentPortal.jsx

import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Dashboard from './components/Dashboard';
import Courses from './components/Courses';
import { LogOut, LayoutDashboard, BookOpen } from 'lucide-react';

export default function StudentPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout && logout();
    window.location.href = '/';
  };

  return (
    <div 
      className="min-h-screen w-screen flex" 
      style={{ backgroundColor: '#F5F5F7' }} // subtle near-white
    >
      {/* Sidebar */}
      <aside 
        className="w-64 h-screen flex flex-col" 
        style={{
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 
            className="text-lg font-semibold text-gray-900 text-center"
          >
            Student Portal
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-md transition-all text-sm font-medium"
                style={
                  activeTab === 'dashboard'
                    ? { backgroundColor: '#E5E7EB', color: '#111827' }
                    : { color: '#111827' }
                }
                onMouseEnter={(e) => {
                  if (activeTab !== 'dashboard') {
                    e.currentTarget.style.backgroundColor = '#F3F4F6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'dashboard') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <LayoutDashboard className="w-5 h-5 text-gray-600" />
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('courses')}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-md transition-all text-sm font-medium"
                style={
                  activeTab === 'courses'
                    ? { backgroundColor: '#E5E7EB', color: '#111827' }
                    : { color: '#111827' }
                }
                onMouseEnter={(e) => {
                  if (activeTab !== 'courses') {
                    e.currentTarget.style.backgroundColor = '#F3F4F6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'courses') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <BookOpen className="w-5 h-5 text-gray-600" />
                Courses
              </button>
            </li>
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all"
            style={{
              backgroundColor: '#FEE2E2', // gentle red highlight
              color: '#B91C1C', // deep red
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FECACA';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FEE2E2';
            }}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'courses' && <Courses />}
      </main>
    </div>
  );
}
