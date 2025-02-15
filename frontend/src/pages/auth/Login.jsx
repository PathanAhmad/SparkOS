import React from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Choose Your Login Type</h1>
      <p className="text-lg text-gray-300 mb-6">Select your role to continue.</p>

      <div className="flex flex-col gap-4 w-72">
        <Link to="/login-class">
          <button className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all">
            Class Login
          </button>
        </Link>
        <Link to="/login-management">
          <button className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all">
            Management Login
          </button>
        </Link>
        <Link to="/">
          <button className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all">
            Back
          </button>
        </Link>
      </div>
    </div>
  );
}
