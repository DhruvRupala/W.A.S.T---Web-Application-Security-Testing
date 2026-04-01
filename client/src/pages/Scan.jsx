import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Target, Zap, Shield, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const socket = io(import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://wast-backend.onrender.com' : 'http://localhost:5000'));

const Scan = () => {
  const [target, setTarget] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('scan:progress', (data) => {
      setProgress(data.progress);
      setStatusMsg(data.message);
    });

    socket.on('scan:completed', (data) => {
      setScanning(false);
      setScanResult(data);
      setProgress(100);
      setStatusMsg('Scan complete!');
    });

    return () => {
      socket.off('scan:progress');
      socket.off('scan:completed');
    };
  }, []);

  const handleScan = async (e) => {
    e.preventDefault();
    setError('');
    setScanResult(null);
    setProgress(0);
    setStatusMsg('');

    if (!target.startsWith('http')) {
      setError('Target URL must start with http:// or https://');
      return;
    }

    setScanning(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://wast-backend.onrender.com' : 'http://localhost:5000')}/api/scans/start`, { targetUrl: target });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start scan');
      setScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8">
      <div className="mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-widest mb-2 flex items-center gap-3 sm:gap-4">
          <Target className="text-cyber-pink flex-shrink-0" size={28} />
          <span className="sm:hidden">New Scan</span>
          <span className="hidden sm:inline">New Target Scan</span>
        </h2>
        <p className="text-cyber-blue text-xs sm:text-sm max-w-2xl" style={{ fontFamily: "'Fira Code', monospace" }}>
          Initialize a comprehensive security vulnerability scan against the specified target.
        </p>
      </div>

      <div className="glass-panel p-4 sm:p-8 border border-cyber-pink/30 relative overflow-hidden">
        {scanning && (
          <div className="absolute top-0 left-0 h-1 bg-cyber-pink shadow-lg transition-all duration-500" style={{ width: `${progress}%`, boxShadow: '0 0 10px #ff003c' }}></div>
        )}

        <form onSubmit={handleScan} className="space-y-6 sm:space-y-8 relative z-10">
          <div>
            <label className="block text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 uppercase tracking-widest" style={{ fontFamily: "'Fira Code', monospace" }}>Target Endpoint URL</label>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input
                type="text"
                className="cyber-input text-base sm:text-lg py-3 sm:py-4 flex-1 border-gray-700 bg-cyber-black focus:border-cyber-pink focus:ring-cyber-pink"
                placeholder="https://vulnerable-app.local"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                disabled={scanning}
                required
              />
              <button
                type="submit"
                disabled={scanning}
                className="relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 overflow-hidden font-bold tracking-widest text-white uppercase bg-cyber-pink/20 border border-cyber-pink hover:bg-cyber-pink/40 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-48"
              >
                {scanning ? (
                  <span className="flex items-center gap-2 animate-pulse text-cyber-pink">
                    <Zap className="animate-spin" size={18} /> SCANNING...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap size={18} /> START SCAN
                  </span>
                )}
              </button>
            </div>
            {error && <p className="text-cyber-pink text-xs sm:text-sm mt-3 flex items-center gap-2" style={{ fontFamily: "'Fira Code', monospace" }}><Shield size={14} /> {error}</p>}
          </div>
        </form>

        {/* Real-time Progress */}
        {scanning && (
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs sm:text-sm text-cyber-blue uppercase tracking-widest" style={{ fontFamily: "'Fira Code', monospace" }}>Scan Progress</span>
              <span className="text-xs sm:text-sm text-cyber-pink font-bold" style={{ fontFamily: "'Fira Code', monospace" }}>{progress}%</span>
            </div>
            <div className="w-full h-2 sm:h-3 bg-cyber-black border border-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #00f0ff, #ff003c)', boxShadow: '0 0 12px rgba(0,240,255,0.5)' }}
              ></div>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-2 animate-pulse" style={{ fontFamily: "'Fira Code', monospace" }}>{statusMsg}</p>
          </div>
        )}

        {/* Scan Result Summary */}
        {scanResult && !scanning && (
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              {scanResult.status === 'completed' ? (
                <CheckCircle className="text-cyber-green" size={24} />
              ) : (
                <XCircle className="text-cyber-pink" size={24} />
              )}
              <span className="text-base sm:text-lg font-bold uppercase">{scanResult.status === 'completed' ? 'Scan Complete' : 'Scan Failed'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div className="p-3 border border-gray-800 bg-cyber-black">
                <span className="block text-xs text-gray-500" style={{ fontFamily: "'Fira Code', monospace" }}>RISK</span>
                <span className="font-bold text-white">{scanResult.riskLevel}</span>
              </div>
              <div className="p-3 border border-gray-800 bg-cyber-black">
                <span className="block text-xs text-gray-500" style={{ fontFamily: "'Fira Code', monospace" }}>VULNS</span>
                <span className="font-bold text-white text-xl">{scanResult.vulnerabilities?.length || 0}</span>
              </div>
              <div className="p-3 border border-gray-800 bg-cyber-black">
                <span className="block text-xs text-gray-500" style={{ fontFamily: "'Fira Code', monospace" }}>TARGET</span>
                <span className="font-bold text-white text-xs truncate block">{scanResult.targetUrl}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/reports')}
              className="cyber-btn w-full"
            >
              View Full Report →
            </button>
          </div>
        )}

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800">
          <h4 className="text-cyber-blue uppercase text-xs sm:text-sm mb-4 sm:mb-6 pb-2 border-b border-gray-800 inline-block" style={{ fontFamily: "'Fira Code', monospace" }}>Active Modules</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {['XSS Injector', 'SQLi Scanner', 'Port Discovery', 'Security Headers'].map(mod => (
              <div key={mod} className="flex items-center gap-3 p-3 bg-cyber-black border border-gray-800 rounded-sm">
                <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse flex-shrink-0"></div>
                <span className="text-xs sm:text-sm text-gray-300" style={{ fontFamily: "'Fira Code', monospace" }}>{mod}</span>
                <ChevronRight className="ml-auto text-gray-600 flex-shrink-0" size={16} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scan;
