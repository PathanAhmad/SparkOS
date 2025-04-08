import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function LoginManagement() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login: authLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5100';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, { login, password });
      
      authLogin(data.token, data.user); // Uses AuthContext to update state

      // Redirect based on role
      if (data.user.role?.toLowerCase() === 'admin') {
        console.log('Redirecting to /admin');
        navigate('/admin');
      } else if (data.user.role?.toLowerCase() === 'schoolgroup') {
        console.log('Redirecting to /school-group');
        navigate('/school-group');
      } else {
        console.log('Redirecting to /school');
        navigate('/school');
      }

    } catch (err) {
      console.error('Login Error:', err);
      setError('Invalid credentials or server error.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Management Login</h1>
      <p className="text-lg text-gray-300 mb-6">Sign in to manage your school system.</p>

      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-80">
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="text-gray-300 mb-1">Email / Username</label>
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="w-full p-3 mb-4 text-black rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter email or username"
            required
          />

          <label className="text-gray-300 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-4 text-black rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter password"
            required
          />

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-all"
          >
            Sign In
          </button>
        </form>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <Link to="/register" className="text-green-400 hover:text-green-300">Create an account</Link>
        <Link to="/" className="text-gray-400 hover:text-white">← Back to Home</Link>
      </div>
    </div>
  );
}
