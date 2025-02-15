// src/pages/admin/components/AdminUsers.jsx
import React from 'react';

export default function AdminUsers() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-6 bg-white border-t-4 border-indigo-300">
      <div className="max-w-3xl w-full">
        <h2 className="text-3xl font-bold mb-6 text-indigo-800 bg-indigo-100 p-3 rounded">
          Users
        </h2>
        <p className="text-gray-600 mb-4">
          This is a placeholder for the Users section. Here, you might display and manage all registered users.
        </p>
        <div className="mt-6 p-4 bg-pink-100 text-pink-800 rounded">
          If you can see this pink box, Tailwind is working!
        </div>
      </div>
    </div>
  );
}
