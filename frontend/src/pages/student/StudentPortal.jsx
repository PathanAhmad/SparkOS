import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Dashboard from './components/Dashboard';
import Courses from './components/Courses';
import { LogOut, LayoutDashboard, BookOpen } from 'lucide-react';

export default function StudentPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col min-h-screen w-screen overflow-x-hidden bg-white text-black">
      {/* Header Section */}
      <header style={{ backgroundColor: '#FFF', color: '#000' }}>
        {/* Title Row */}
        <div 
          className="p-4 border-b" 
          style={{ fontWeight: 'bold', fontSize: '1rem' }}
        >
          Student Portal
        </div>

        {/* Nav Row: 3 buttons across full width */}
        <nav className="grid grid-cols-3 text-center border-b">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="py-3 border-r inline-flex items-center justify-center gap-1"
            style={{ backgroundColor: '#FFF', color: '#000' }}
          >
            <LayoutDashboard style={{ width: '16px', height: '16px' }} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className="py-3 border-r inline-flex items-center justify-center gap-1"
            style={{ backgroundColor: '#FFF', color: '#000' }}
          >
            <BookOpen style={{ width: '16px', height: '16px' }} />
            Courses
          </button>
          <button
            onClick={handleLogout}
            className="py-3 inline-flex items-center justify-center gap-1"
            style={{ backgroundColor: '#FFF', color: '#000' }}
          >
            <LogOut style={{ width: '16px', height: '16px' }} />
            Logout
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4" style={{ backgroundColor: '#FFF', color: '#000' }}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'courses' && <Courses />}
      </main>
    </div>
  );
}
