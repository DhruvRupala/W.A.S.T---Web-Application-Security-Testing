import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Activity, ShieldAlert, Trash2, Crown, BarChart3, LineChart as LineChartIcon, List } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, Legend } from 'recharts';
import { io } from 'socket.io-client';

const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://wast-backend.onrender.com' : 'http://localhost:5000');

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [scans, setScans] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [activity, setActivity] = useState([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [tab, setTab] = useState('overview');
  const [error, setError] = useState('');
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchAll();
    const socket = io(API);
    socket.on('active_users', (count) => setActiveUsers(count));
    return () => socket.disconnect();
  }, [days]);

  const fetchAll = async () => {
    try {
      const [statsRes, usersRes, scansRes, trafficRes, activityRes] = await Promise.all([
        axios.get(`${API}/api/admin/stats`),
        axios.get(`${API}/api/admin/users`),
        axios.get(`${API}/api/admin/scans`),
        axios.get(`${API}/api/admin/system/usage?days=${days}`),
        axios.get(`${API}/api/admin/system/audit`),
      ]);
      setStats(statsRes.data); setUsers(usersRes.data); setScans(scansRes.data);
      setTraffic(trafficRes.data); setActivity(activityRes.data); setError('');
    } catch (err) { setError(err.response?.data?.message || 'Access denied or server error.'); }
  };

  const toggleRole = async (id) => {
    try { await axios.patch(`${API}/api/admin/users/${id}/role`); fetchAll(); } catch (err) { console.error(err); }
  };
  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user and all their scan data?')) return;
    try { await axios.delete(`${API}/api/admin/users/${id}`); fetchAll(); } catch (err) { console.error(err); }
  };

  if (error) return (
    <div className="flex items-center justify-center h-96 px-4">
      <div className="glass-panel p-6 sm:p-8 text-center border border-cyber-pink/50 max-w-md w-full">
        <ShieldAlert className="mx-auto text-cyber-pink mb-4" size={40} />
        <h3 className="text-lg sm:text-xl font-bold text-cyber-pink uppercase mb-2">Access Denied</h3>
        <p className="text-gray-400 text-xs sm:text-sm font-mono">{error}</p>
      </div>
    </div>
  );

  if (!stats) return <div className="text-center text-cyber-blue animate-pulse py-20 uppercase tracking-widest text-sm">Loading Admin Console...</div>;

  const chartData = [
    { name: 'Critical', value: stats.critical, color: '#ff003c' },
    { name: 'High', value: stats.high, color: '#ff4d00' },
    { name: 'Medium', value: stats.medium, color: '#fcee0a' },
    { name: 'Low', value: stats.low, color: '#b026ff' },
  ];

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'traffic', label: 'Traffic', icon: LineChartIcon },
    { key: 'activity', label: 'Activity', icon: List },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'scans', label: 'Scans', icon: Activity },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <h2 className="text-xl sm:text-3xl font-black uppercase tracking-widest flex items-center gap-2 sm:gap-3">
          <Crown className="text-cyber-yellow flex-shrink-0" size={24} /> Admin Console
        </h2>
        <p className="text-cyber-blue text-xs sm:text-sm font-mono">Platform-wide management and analytics</p>
      </header>

      {/* Tabs - scrollable */}
      <div className="flex gap-2 border-b border-gray-800 pb-3 sm:pb-4 overflow-x-auto scrollbar-hide -mx-1 px-1">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 uppercase tracking-wider text-[10px] sm:text-sm font-bold border transition-all whitespace-nowrap flex-shrink-0
                ${tab === t.key ? 'border-cyber-blue text-cyber-blue bg-cyber-blue/10' : 'border-gray-800 text-gray-400 hover:text-white hover:border-gray-600'}`}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { label: 'Users', val: stats.totalUsers, color: 'text-cyber-blue border-cyber-blue' },
              { label: 'Scans', val: stats.totalScans, color: 'text-cyber-pink border-cyber-pink' },
              { label: 'Completed', val: stats.completedScans, color: 'text-cyber-green border-cyber-green' },
              { label: 'Failed', val: stats.failedScans, color: 'text-orange-500 border-orange-500' },
            ].map(s => (
              <div key={s.label} className={`glass-panel p-4 sm:p-6 border-t-4 ${s.color}`}>
                <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-widest font-mono">{s.label}</p>
                <h3 className="text-2xl sm:text-4xl font-black mt-1 sm:mt-2">{s.val}</h3>
              </div>
            ))}
          </div>
          <div className="glass-panel p-4 sm:p-6 border border-gray-800">
            <h3 className="text-base sm:text-xl font-bold uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2">
              <BarChart3 className="text-cyber-blue" size={20} /> Risk Distribution
            </h3>
            <div className="h-56 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#12121c', borderColor: '#374151', fontSize: 12 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Traffic */}
      {tab === 'traffic' && (
        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="glass-panel px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4 border border-cyber-pink w-full sm:w-auto">
              <div className="relative flex h-3 w-3 sm:h-4 sm:w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-pink opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-cyber-pink"></span>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] sm:text-xs uppercase font-mono tracking-widest">Live Devices</p>
                <p className="text-2xl sm:text-3xl font-black text-cyber-pink animate-pulse">{activeUsers}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[7, 30].map(d => (
                <button key={d} onClick={() => setDays(d)}
                  className={`px-3 sm:px-4 py-2 border text-[10px] sm:text-xs font-mono uppercase transition-colors ${days === d ? 'bg-cyber-blue text-black border-cyber-blue' : 'text-cyber-blue border-cyber-blue hover:bg-cyber-blue/20'}`}>
                  {d} Days
                </button>
              ))}
            </div>
          </div>
          <div className="glass-panel p-4 sm:p-6 border border-gray-800">
            <h3 className="text-base sm:text-xl font-bold uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2">
              <LineChartIcon className="text-cyber-blue" size={20} /> Page Views
            </h3>
            <div className="h-[280px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={traffic}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                  <XAxis dataKey="_id" stroke="#6b7280" tick={{ fontSize: 10, fill: '#6b7280' }} tickMargin={8} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#12121c', borderColor: '#374151', borderRadius: '8px', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="views" name="Views" stroke="#00f0ff" strokeWidth={2} dot={{ r: 3, fill: '#12121c', stroke: '#00f0ff', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#00f0ff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Activity */}
      {tab === 'activity' && (
        <div className="glass-panel border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-800 text-left text-gray-400 uppercase tracking-widest font-mono text-[10px] sm:text-xs">
                  <th className="p-3 sm:p-4">Action</th><th className="p-3 sm:p-4">User</th><th className="p-3 sm:p-4">Details</th><th className="p-3 sm:p-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {activity.map(a => (
                  <tr key={a._id} className="border-b border-gray-800/50 hover:bg-white/5">
                    <td className="p-3 sm:p-4">
                      <span className={`text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-sm uppercase font-bold
                        ${a.action === 'LOGIN' ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/30' :
                          a.action === 'REGISTER' ? 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30' :
                          a.action === 'SCAN_STARTED' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                          'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>{a.action}</span>
                    </td>
                    <td className="p-3 sm:p-4 font-mono"><div className="text-white font-bold text-xs">{a.user?.name || 'Unknown'}</div><div className="text-gray-500 text-[10px] mt-0.5">{a.user?.email || 'N/A'}</div></td>
                    <td className="p-3 sm:p-4 text-cyber-blue text-[10px] sm:text-xs max-w-[120px] truncate">{a.details || '-'}</td>
                    <td className="p-3 sm:p-4 text-gray-500 text-[10px] sm:text-xs text-right whitespace-nowrap">{new Date(a.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {activity.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-gray-500 font-mono text-xs">No recent activity.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="glass-panel border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-800 text-left text-gray-400 uppercase tracking-widest font-mono text-[10px] sm:text-xs">
                  <th className="p-3 sm:p-4">Identity</th><th className="p-3 sm:p-4">Role</th><th className="p-3 sm:p-4">Last Login</th><th className="p-3 sm:p-4">Joined</th><th className="p-3 sm:p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b border-gray-800/50 hover:bg-white/5">
                    <td className="p-3 sm:p-4 font-mono"><div className="text-white font-bold text-xs">{u.name || 'Unknown'}</div><div className="text-gray-500 text-[10px] mt-0.5">{u.email}</div></td>
                    <td className="p-3 sm:p-4">
                      <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-sm uppercase font-bold border ${u.role === 'admin' ? 'bg-cyber-yellow/10 text-cyber-yellow border-cyber-yellow/30' : 'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30'}`}>{u.role}</span>
                    </td>
                    <td className="p-3 sm:p-4 text-gray-300 text-[10px] sm:text-xs whitespace-nowrap">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : <span className="text-gray-600">Never</span>}</td>
                    <td className="p-3 sm:p-4 text-gray-500 text-[10px] sm:text-xs whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 sm:p-4 text-right whitespace-nowrap">
                      <div className="flex gap-1.5 sm:gap-2 justify-end">
                        <button onClick={() => toggleRole(u._id)} className="px-2 sm:px-3 py-1 border border-cyber-yellow text-cyber-yellow hover:bg-cyber-yellow/10 text-[9px] sm:text-[10px] font-bold uppercase rounded-sm">
                          <Crown size={10} className="inline mr-0.5 sm:mr-1" /> Role
                        </button>
                        <button onClick={() => deleteUser(u._id)} className="px-2 sm:px-3 py-1 border border-cyber-pink text-cyber-pink hover:bg-cyber-pink/10 text-[9px] sm:text-[10px] font-bold uppercase rounded-sm">
                          <Trash2 size={10} className="inline mr-0.5 sm:mr-1" /> Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scans */}
      {tab === 'scans' && (
        <div className="glass-panel border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[550px]">
              <thead>
                <tr className="border-b border-gray-800 text-left text-gray-400 uppercase tracking-widest font-mono text-[10px] sm:text-xs">
                  <th className="p-3 sm:p-4">Target</th><th className="p-3 sm:p-4">User</th><th className="p-3 sm:p-4">Status</th><th className="p-3 sm:p-4">Risk</th><th className="p-3 sm:p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {scans.map(s => (
                  <tr key={s._id} className="border-b border-gray-800/50 hover:bg-white/5">
                    <td className="p-3 sm:p-4 text-white text-[10px] sm:text-xs max-w-[150px] truncate font-mono">{s.targetUrl}</td>
                    <td className="p-3 sm:p-4 text-gray-400 text-[10px] sm:text-xs whitespace-nowrap">{s.user?.email || 'N/A'}</td>
                    <td className="p-3 sm:p-4">
                      <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-sm uppercase font-bold border
                        ${s.status === 'completed' ? 'bg-cyber-green/10 text-cyber-green border-cyber-green/30' :
                          s.status === 'failed' ? 'bg-cyber-pink/10 text-cyber-pink border-cyber-pink/30' :
                          'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30'}`}>{s.status}</span>
                    </td>
                    <td className="p-3 sm:p-4 text-[10px] sm:text-xs font-bold uppercase font-mono">
                      <span className={s.riskLevel === 'Critical' ? 'text-cyber-pink' : s.riskLevel === 'High' ? 'text-orange-500' : s.riskLevel === 'Medium' ? 'text-cyber-yellow' : s.riskLevel === 'Secure' ? 'text-cyber-green' : 'text-cyber-blue'}>{s.riskLevel}</span>
                    </td>
                    <td className="p-3 sm:p-4 text-gray-500 text-[10px] sm:text-xs whitespace-nowrap">{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
