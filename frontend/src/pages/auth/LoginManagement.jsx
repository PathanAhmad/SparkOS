// src/pages/auth/LoginManagement.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function LoginManagement() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', {
        login,
        password,
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Redirect based on role
      if (data.user.role === 'admin') {
        window.location.href = '/admin';
      } else if (data.user.role === 'schoolGroup') {
        window.location.href = '/school-group';
      } else {
        window.location.href = '/school';
      }
    } catch (err) {
      setError('Invalid credentials or server error.');
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-xs">
        <h2 className="text-xl font-semibold mb-4 text-center">Management Login</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form className="bg-gray-100 shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>
          <label className="block text-gray-700 text-sm font-bold mb-2">Login (email/username)</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 mb-4"
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />

          <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 mb-4"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            type="submit"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
