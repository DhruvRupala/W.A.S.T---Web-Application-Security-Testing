import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = React.useCallback(() => {
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    const validateToken = (jwtToken) => {
      if (!jwtToken) return false;
      try {
        const payload = JSON.parse(atob(jwtToken.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          return false;
        }
        return true;
      } catch (err) {
        return false;
      }
    };

    if (token) {
      if (!validateToken(token)) {
        logout();
        setLoading(false);
        return () => axios.interceptors.response.eject(interceptor);
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://wast-backend.onrender.com' : 'http://localhost:5000')}/api/auth/me`)
        .then(res => setUser(res.data))
        .catch((err) => {
          if (err.response?.status !== 401) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              setUser({ id: payload.user?.id, role: payload.user?.role });
            } catch {
              logout();
            }
          }
        })
        .finally(() => setLoading(false));
    } else {
      logout();
      setLoading(false);
    }

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token, logout]);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://wast-backend.onrender.com' : 'http://localhost:5000')}/api/auth/login`, { email, password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return true;
    } catch (err) {
      throw err.response?.data || { message: 'Login failed' };
    }
  };

  const register = async (email, password, name = '') => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://wast-backend.onrender.com' : 'http://localhost:5000')}/api/auth/register`, { email, password, name });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return true;
    } catch (err) {
      throw err.response?.data || { message: 'Registration failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
