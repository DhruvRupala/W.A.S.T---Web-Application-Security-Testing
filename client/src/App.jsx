import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Menu } from 'lucide-react';
import { AuthContext } from './context/AuthContext';
import { API_URL } from './config';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Scan from './pages/Scan';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import Sidebar from './components/Sidebar';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-cyber-blue animate-pulse">Initializing System...</div>;
  if (!user) return <Navigate to="/" />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/dashboard" />;

  return (
    <div className="flex h-screen bg-cyber-black text-white overflow-hidden">
      {/* Mobile hamburger button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="mobile-menu-btn lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 overflow-y-auto p-4 pt-16 lg:pt-8 md:p-6 lg:p-8 relative w-full min-w-0">
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
    axios.post(`${API_URL}/api/admin/system/visits`, { path: location.pathname })
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
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><Admin /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
