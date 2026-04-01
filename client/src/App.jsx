import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Scan from './pages/Scan';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import Sidebar from './components/Sidebar';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center text-cyber-blue animate-pulse">Initializing System...</div>;
  if (!user) return <Navigate to="/" />;
  return (
    <div className="flex h-screen bg-cyber-black text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8 relative">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#00f0ff 1px, transparent 1px), linear-gradient(90deg, #00f0ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="relative z-10 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const RouteTracker = () => {
  const location = useLocation();
  useEffect(() => {
    axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/analytics/visit`, { path: location.pathname })
      .catch(() => {});
  }, [location]);
  return null;
};

function App() {
  return (
    <Router>
      <RouteTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;


