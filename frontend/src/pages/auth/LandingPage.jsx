import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to <span className="text-blue-400">Spark.OS</span></h1>
      <p className="text-lg text-gray-300 mb-6">Your gateway to smart, self-directed learning.</p>

      <div className="flex flex-col gap-4 w-72">
        <Link to="/login">
          <button className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all">
            Log In
          </button>
        </Link>
        <Link to="/register">
          <button className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all">
            Register
          </button>
        </Link>
      </div>
    </div>
  );
}
