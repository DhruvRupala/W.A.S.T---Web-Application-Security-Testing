import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Activity, ShieldAlert, Trash2, Crown, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [scans, setScans] = useState([]);
  const [tab, setTab] = useState('overview');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, usersRes, scansRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats'),
        axios.get('http://localhost:5000/api/admin/users'),
        axios.get('http://localhost:5000/api/admin/scans'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setScans(scansRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Access denied or server error.');
    }
  };

  const toggleRole = async (userId) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/users/${userId}/role`);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user and all their scan data?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
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
      <div className="flex gap-2 border-b border-gray-800 pb-4">
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

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="glass-panel border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-gray-400 uppercase tracking-widest" style={{ fontFamily: "'Fira Code', monospace" }}>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white" style={{ fontFamily: "'Fira Code', monospace" }}>{u.email}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-sm uppercase font-bold ${u.role === 'admin' ? 'bg-cyber-yellow/20 text-cyber-yellow' : 'bg-cyber-blue/20 text-cyber-blue'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => toggleRole(u._id)} className="px-3 py-1 border border-cyber-yellow text-cyber-yellow hover:bg-cyber-yellow/10 transition-colors text-xs uppercase">
                      <Crown size={14} className="inline mr-1" /> Toggle Role
                    </button>
                    <button onClick={() => deleteUser(u._id)} className="px-3 py-1 border border-cyber-pink text-cyber-pink hover:bg-cyber-pink/10 transition-colors text-xs uppercase">
                      <Trash2 size={14} className="inline mr-1" /> Delete
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
                    <span className={`text-xs px-2 py-1 rounded-sm uppercase font-bold
                      ${s.status === 'completed' ? 'bg-cyber-green/20 text-cyber-green' :
                        s.status === 'failed' ? 'bg-cyber-pink/20 text-cyber-pink' :
                        'bg-cyber-blue/20 text-cyber-blue'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-bold" style={{ fontFamily: "'Fira Code', monospace" }}>
                    <span className={
                      s.riskLevel === 'Critical' ? 'text-cyber-pink' :
                      s.riskLevel === 'High' ? 'text-orange-500' :
                      s.riskLevel === 'Medium' ? 'text-cyber-yellow' :
                      s.riskLevel === 'Secure' ? 'text-cyber-green' : 'text-cyber-blue'
                    }>{s.riskLevel}</span>
                  </td>
                  <td className="p-4 text-gray-400 text-xs">{new Date(s.createdAt).toLocaleString()}</td>
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
