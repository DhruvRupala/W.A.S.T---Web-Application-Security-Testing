import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, ShieldAlert, LayoutDashboard, LogOut, Crown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useContext(AuthContext);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'New Scan', path: '/scan', icon: Activity },
    { name: 'Vulnerabilities', path: '/reports', icon: ShieldAlert },
    { name: 'Admin Panel', path: '/admin', icon: Crown },
  ];

  return (
    <div className="w-64 glass-panel border-r border-gray-800 flex flex-col pt-8 pb-4 px-4 h-full relative z-20">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-cyber-pink tracking-widest animate-pulse-fast">
          W.A.S.T.
        </h1>
        <p className="text-xs text-cyber-blue font-mono mt-2 tracking-widest opacity-80">SECURITY PLATFORM</p>
      </div>

      <nav className="flex-1 space-y-4">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 font-mono text-sm border-l-2 ${
                  isActive 
                    ? 'border-cyber-blue bg-cyber-blue/10 text-cyber-blue text-glow-blue' 
                    : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500 hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              {link.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-gray-800">
        <div className="px-4 py-2 mb-4 text-xs font-mono text-gray-500 truncate">
          OP: {user?.email || 'GUEST'}
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-cyber-pink hover:bg-cyber-pink/10 rounded-md transition-all duration-300 font-mono text-sm border border-transparent hover:border-cyber-pink/30"
        >
          <LogOut size={18} />
          DISCONNECT
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
