import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token') || null);
      setUser(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 🚀 Intercept 401 errors globally and log users out if token expires
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout(); // Force logout on token expiry
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const login = (receivedToken, userData) => {
    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(receivedToken);
    setUser(userData);

    // Navigate after state updates
    setTimeout(() => {
      if (userData.role === 'admin') navigate('/admin');
      else if (userData.role === 'schoolGroup') navigate('/school-group');
      else if (userData.role === 'school') navigate('/school');
      else if (userData.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    }, 100); // Small delay ensures state updates first
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/'); // Redirect to Landing Page when logged out
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
