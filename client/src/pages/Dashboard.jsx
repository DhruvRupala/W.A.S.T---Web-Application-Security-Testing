import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0, medium: 0, low: 0, recentScans: [] });

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://wast-backend.onrender.com' : 'http://localhost:5000')}/api/scans`);
        const scans = res.data;
        let c = 0, h = 0, m = 0, l = 0;
        scans.forEach(s => {
          if (s.riskLevel === 'Critical') c++;
          else if (s.riskLevel === 'High') h++;
          else if (s.riskLevel === 'Medium') m++;
          else if (s.riskLevel === 'Low') l++;
        });
        setStats({ total: scans.length, critical: c, high: h, medium: m, low: l, recentScans: scans.slice(0, 5) });
      } catch (err) { console.error('Failed to load stats', err); }
    };
    fetchScans();
  }, []);

  const chartData = [
    { name: 'Critical', value: stats.critical, color: '#ff003c' },
    { name: 'High', value: stats.high, color: '#ff4d00' },
    { name: 'Medium', value: stats.medium, color: '#fcee0a' },
    { name: 'Low', value: stats.low, color: '#b026ff' },
  ];

  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className={`glass-panel p-4 sm:p-6 border-t-4 ${colorClass} hover:translate-y-[-5px] transition-transform duration-300`}>
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div>
          <p className="text-gray-400 font-mono text-[10px] sm:text-xs uppercase tracking-widest">{title}</p>
          <h3 className="text-2xl sm:text-4xl font-black mt-1 sm:mt-2">{value}</h3>
        </div>
        <div className={`p-2 sm:p-3 rounded-md bg-opacity-20 ${colorClass.replace('border-', 'bg-').replace('text-', 'bg-')} ${colorClass.replace('border-', 'text-')}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <header className="mb-4 sm:mb-8">
        <h2 className="text-xl sm:text-3xl font-black uppercase tracking-widest">System Overview</h2>
        <p className="text-cyber-blue font-mono text-xs sm:text-sm truncate">Welcome back, Operator {user?.email}</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard title="Total Scans" value={stats.total} icon={Activity} colorClass="border-cyber-blue text-cyber-blue" />
        <StatCard title="Critical" value={stats.critical} icon={ShieldAlert} colorClass="border-cyber-pink text-cyber-pink" />
        <StatCard title="High Risks" value={stats.high} icon={AlertTriangle} colorClass="border-orange-500 text-orange-500" />
        <StatCard title="Secure" value={stats.total - (stats.critical+stats.high+stats.medium+stats.low)} icon={CheckCircle} colorClass="border-cyber-green text-cyber-green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 glass-panel p-4 sm:p-6 border border-gray-800">
          <h3 className="text-base sm:text-xl font-bold uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2">
            <Activity className="text-cyber-blue" size={20} /> Risk Distribution
          </h3>
          <div className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#6b7280" tick={{fontFamily: 'Fira Code', fontSize: 10}} />
                <YAxis stroke="#6b7280" tick={{fontFamily: 'Fira Code', fontSize: 10}} allowDecimals={false} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#12121c', borderColor: '#374151', fontFamily: 'Fira Code', fontSize: 12}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-4 sm:p-6 border border-gray-800 flex flex-col">
          <h3 className="text-base sm:text-xl font-bold uppercase tracking-widest mb-4 sm:mb-6 text-cyber-blue border-b border-gray-800 pb-2">Recent Scans</h3>
          <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-1">
            {stats.recentScans.length === 0 ? (
              <p className="text-gray-500 font-mono text-xs sm:text-sm text-center mt-10">No scans executed yet.</p>
            ) : (
              stats.recentScans.map(scan => (
                <div key={scan._id} className="p-3 sm:p-4 bg-cyber-dark/50 border border-gray-800 hover:border-cyber-blue/50 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-[150px] text-gray-300 group-hover:text-white transition-colors">{scan.targetUrl}</span>
                    <span className={`text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-sm uppercase tracking-wider font-bold flex-shrink-0 ml-2
                      ${scan.status === 'completed' ? 'bg-cyber-green/20 text-cyber-green' : 
                        scan.status === 'failed' ? 'bg-cyber-pink/20 text-cyber-pink' : 
                        'bg-cyber-blue/20 text-cyber-blue animate-pulse'}`}>
                      {scan.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono">
                    <span className="text-gray-500">{new Date(scan.createdAt).toLocaleDateString()}</span>
                    <span className={`${scan.riskLevel === 'Critical' ? 'text-cyber-pink' : scan.riskLevel === 'High' ? 'text-orange-500' : scan.riskLevel === 'Secure' ? 'text-cyber-green' : 'text-cyber-yellow'}`}>{scan.riskLevel}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
