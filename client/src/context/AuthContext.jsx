import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch user profile from backend
      axios.get('http://localhost:5000/api/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          // Token expired or invalid — use basic info from stored token
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({ id: payload.user?.id });
          } catch {
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
          }
        })
        .finally(() => setLoading(false));
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return true;
    } catch (err) {
      throw err.response?.data || { message: 'Login failed' };
    }
  };

  const register = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { email, password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return true;
    } catch (err) {
      throw err.response?.data || { message: 'Registration failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
