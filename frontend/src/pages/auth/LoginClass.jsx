import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function LoginClass() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login: authLogin } = useContext(AuthContext);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5100';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, { login, password });
      
      authLogin(data.token, data.user);
    } catch (err) {
      console.error('Login Error:', err);
      setError('Invalid credentials or server error.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Class Login</h1>
      <p className="text-lg text-gray-300 mb-6">Enter your credentials to access your class portal.</p>

      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-80">
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="text-gray-300 mb-1">Email / Username</label>
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="w-full p-3 mb-4 text-black rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter email or username"
            required
          />

          <label className="text-gray-300 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-4 text-black rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter password"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all"
          >
            Sign In
          </button>
        </form>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <Link to="/register" className="text-blue-400 hover:text-blue-300">Create an account</Link>
        <Link to="/" className="text-gray-400 hover:text-white">← Back to Home</Link>
      </div>
    </div>
  );
}
