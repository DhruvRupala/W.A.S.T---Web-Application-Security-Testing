import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Activity, ShieldAlert, Trash2, Crown, BarChart3, LineChart as LineChartIcon, List } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, Legend } from 'recharts';
import { io } from 'socket.io-client';

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

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    socket.on('active_users', (count) => {
      setActiveUsers(count);
    });

    return () => socket.disconnect();
  }, [days]);

  const fetchAll = async () => {
    try {
      const [statsRes, usersRes, scansRes, trafficRes, activityRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/stats`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/scans`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/analytics/traffic?days=${days}`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/analytics/activity`),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setScans(scansRes.data);
      setTraffic(trafficRes.data);
      setActivity(activityRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Access denied or server error.');
    }
  };

  const toggleRole = async (userId) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${userId}/role`);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user and all their scan data?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${userId}`);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="glass-panel p-8 text-center border border-cyber-pink/50 max-w-md">
          <ShieldAlert className="mx-auto text-cyber-pink mb-4" size={48} />
          <h3 className="text-xl font-bold text-cyber-pink uppercase mb-2">Access Denied</h3>
          <p className="text-gray-400 text-sm" style={{ fontFamily: "'Fira Code', monospace" }}>{error}</p>
          <p className="text-gray-600 text-xs mt-4" style={{ fontFamily: "'Fira Code', monospace" }}>
            To become admin, manually set your user's role to "admin" in the MongoDB database.
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center text-cyber-blue animate-pulse py-20 uppercase tracking-widest">Loading Admin Console...</div>;
  }

  const chartData = [
    { name: 'Critical', value: stats.critical, color: '#ff003c' },
    { name: 'High', value: stats.high, color: '#ff4d00' },
    { name: 'Medium', value: stats.medium, color: '#fcee0a' },
    { name: 'Low', value: stats.low, color: '#b026ff' },
  ];

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'traffic', label: 'Traffic & Live', icon: LineChartIcon },
    { key: 'activity', label: 'Activity Feed', icon: List },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'scans', label: 'All Scans', icon: Activity },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-black uppercase tracking-widest flex items-center gap-3">
          <Crown className="text-cyber-yellow" size={32} /> Admin Console
        </h2>
        <p className="text-cyber-blue text-sm" style={{ fontFamily: "'Fira Code', monospace" }}>Platform-wide management and analytics</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-4 overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 uppercase tracking-wider text-sm font-bold border transition-all duration-300
                ${tab === t.key
                  ? 'border-cyber-blue text-cyber-blue bg-cyber-blue/10'
                  : 'border-gray-800 text-gray-400 hover:text-white hover:border-gray-600'}`}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Users', val: stats.totalUsers, color: 'text-cyber-blue border-cyber-blue' },
              { label: 'Total Scans', val: stats.totalScans, color: 'text-cyber-pink border-cyber-pink' },
              { label: 'Completed', val: stats.completedScans, color: 'text-cyber-green border-cyber-green' },
              { label: 'Failed', val: stats.failedScans, color: 'text-orange-500 border-orange-500' },
            ].map(s => (
              <div key={s.label} className={`glass-panel p-6 border-t-4 ${s.color}`}>
                <p className="text-gray-400 text-xs uppercase tracking-widest" style={{ fontFamily: "'Fira Code', monospace" }}>{s.label}</p>
                <h3 className="text-4xl font-black mt-2">{s.val}</h3>
              </div>
            ))}
          </div>

          <div className="glass-panel p-6 border border-gray-800">
            <h3 className="text-xl font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <BarChart3 className="text-cyber-blue" /> Risk Distribution (All Users)
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#12121c', borderColor: '#374151' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Traffic Tab */}
      {tab === 'traffic' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div className="glass-panel px-6 py-4 flex items-center gap-4 border border-cyber-pink">
              <div className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-pink opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-cyber-pink"></span>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-mono tracking-widest">Real-time Connected Devices</p>
                <p className="text-3xl font-black text-cyber-pink animate-pulse">{activeUsers}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setDays(7)} 
                className={`px-4 py-2 border text-xs font-mono uppercase transition-colors ${days === 7 ? 'bg-cyber-blue text-black border-cyber-blue' : 'text-cyber-blue border-cyber-blue hover:bg-cyber-blue/20'}`}>
                7 Days
              </button>
              <button 
                onClick={() => setDays(30)} 
                className={`px-4 py-2 border text-xs font-mono uppercase transition-colors ${days === 30 ? 'bg-cyber-blue text-black border-cyber-blue' : 'text-cyber-blue border-cyber-blue hover:bg-cyber-blue/20'}`}>
                30 Days
              </button>
            </div>
          </div>

          <div className="glass-panel p-6 border border-gray-800">
            <h3 className="text-xl font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <LineChartIcon className="text-cyber-blue" /> Page Views Trends
            </h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={traffic}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                  <XAxis dataKey="_id" stroke="#6b7280" tick={{ fontSize: 12, fill: '#6b7280' }} tickMargin={10} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} tickMargin={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#12121c', borderColor: '#374151', borderRadius: '8px' }}
                    itemStyle={{ color: '#00f0ff' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    name="Page Views" 
                    stroke="#00f0ff" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#12121c', stroke: '#00f0ff', strokeWidth: 2 }} 
                    activeDot={{ r: 8, fill: '#00f0ff' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
              {traffic.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-gray-500 font-mono text-sm">No traffic data for this period.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Activity Feed Tab */}
      {tab === 'activity' && (
        <div className="glass-panel border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-gray-400 uppercase tracking-widest" style={{ fontFamily: "'Fira Code', monospace" }}>
                <th className="p-4">Action</th>
                <th className="p-4">User</th>
                <th className="p-4">Details</th>
                <th className="p-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {activity.map(a => (
                <tr key={a._id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-sm uppercase font-bold tracking-wider
                      ${a.action === 'LOGIN' ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/30' :
                        a.action === 'REGISTER' ? 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30' :
                        a.action === 'SCAN_STARTED' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                      {a.action}
                    </span>
                  </td>
                  <td className="p-4" style={{ fontFamily: "'Fira Code', monospace" }}>
                    <div className="text-white font-bold">{a.user?.name || 'Unknown Operator'}</div>
                    <div className="text-gray-500 text-xs mt-1">{a.user?.email || 'N/A'}</div>
                  </td>
                  <td className="p-4 text-cyber-blue text-xs max-w-xs truncate">{a.details || '-'}</td>
                  <td className="p-4 text-gray-500 text-xs text-right whitespace-nowrap">{new Date(a.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {activity.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500 font-mono tracking-widest text-xs uppercase">No recent activity found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="glass-panel border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-gray-400 uppercase tracking-widest" style={{ fontFamily: "'Fira Code', monospace" }}>
                <th className="p-4">Identity</th>
                <th className="p-4">Role</th>
                <th className="p-4 bg-gray-900/50">Last Login</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                  <td className="p-4" style={{ fontFamily: "'Fira Code', monospace" }}>
                    <div className="text-white font-bold">{u.name || 'Unknown'}</div>
                    <div className="text-gray-500 text-xs mt-1">{u.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2 py-1 rounded-sm uppercase font-bold tracking-widest border ${u.role === 'admin' ? 'bg-cyber-yellow/10 text-cyber-yellow border-cyber-yellow/30' : 'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300 text-xs bg-gray-900/30">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : <span className="text-gray-600">Never</span>}
                  </td>
                  <td className="p-4 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => toggleRole(u._id)} className="px-3 py-1.5 border border-cyber-yellow text-cyber-yellow hover:bg-cyber-yellow/10 transition-colors text-[10px] tracking-widest font-bold uppercase rounded-sm">
                      <Crown size={12} className="inline mr-1" /> Toggle Role
                    </button>
                    <button onClick={() => deleteUser(u._id)} className="px-3 py-1.5 border border-cyber-pink text-cyber-pink hover:bg-cyber-pink/10 transition-colors text-[10px] tracking-widest font-bold uppercase rounded-sm">
                      <Trash2 size={12} className="inline mr-1" /> Terminate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Scans Tab */}
      {tab === 'scans' && (
        <div className="glass-panel border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-gray-400 uppercase tracking-widest" style={{ fontFamily: "'Fira Code', monospace" }}>
                <th className="p-4">Target</th>
                <th className="p-4">User</th>
                <th className="p-4">Status</th>
                <th className="p-4">Risk</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {scans.map(s => (
                <tr key={s._id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white text-xs max-w-[200px] truncate" style={{ fontFamily: "'Fira Code', monospace" }}>{s.targetUrl}</td>
                  <td className="p-4 text-gray-400 text-xs">{s.user?.email || 'N/A'}</td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2 py-1 rounded-sm uppercase font-bold tracking-widest border
                      ${s.status === 'completed' ? 'bg-cyber-green/10 text-cyber-green border-cyber-green/30' :
                        s.status === 'failed' ? 'bg-cyber-pink/10 text-cyber-pink border-cyber-pink/30' :
                        'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "'Fira Code', monospace" }}>
                    <span className={
                      s.riskLevel === 'Critical' ? 'text-cyber-pink' :
                      s.riskLevel === 'High' ? 'text-orange-500' :
                      s.riskLevel === 'Medium' ? 'text-cyber-yellow' :
                      s.riskLevel === 'Secure' ? 'text-cyber-green' : 'text-cyber-blue'
                    }>{s.riskLevel}</span>
                  </td>
                  <td className="p-4 text-gray-500 text-xs">{new Date(s.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;
