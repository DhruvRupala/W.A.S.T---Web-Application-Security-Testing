import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldAlert, Terminal, AlertOctagon, Info, FileWarning, Download, ChevronDown, ChevronUp } from 'lucide-react';

const Reports = () => {
  const [scans, setScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);
  const [showScanList, setShowScanList] = useState(true);

  useEffect(() => { fetchScans(); }, []);

  const fetchScans = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://wast-backend.onrender.com' : 'http://localhost:5000')}/api/scans`);
      setScans(res.data);
      if (res.data.length > 0) setSelectedScan(res.data[0]);
    } catch (err) { console.error(err); }
  };

  const downloadPDF = async (scanId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://wast-backend.onrender.com' : 'http://localhost:5000')}/api/pdf/${scanId}`, {
        responseType: 'blob', headers: { Authorization: `Bearer ${token}` }
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `WAST-Report-${scanId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) { console.error('PDF download failed', err); }
  };

  const getSeverityColor = (sev) => {
    const map = {
      Critical: 'text-cyber-pink border-cyber-pink bg-cyber-pink/10',
      High: 'text-orange-500 border-orange-500 bg-orange-500/10',
      Medium: 'text-cyber-yellow border-cyber-yellow bg-cyber-yellow/10',
      Low: 'text-cyber-blue border-cyber-blue bg-cyber-blue/10',
    };
    return map[sev] || 'text-gray-400 border-gray-400 bg-gray-400/10';
  };

  const handleSelectScan = (scan) => {
    setSelectedScan(scan);
    if (window.innerWidth < 768) setShowScanList(false);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 sm:gap-6 h-auto md:h-[calc(100vh-6rem)]">
      {/* Scan List */}
      <div className="w-full md:w-1/3 glass-panel border border-gray-800 flex flex-col z-10">
        <div className="p-3 sm:p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-bold tracking-widest uppercase text-cyber-blue text-sm"><Terminal size={16} className="inline mr-2" />Scan Logs</h3>
          <div className="flex items-center gap-2">
            <button onClick={fetchScans} className="text-[10px] text-gray-500 hover:text-white font-mono">REFRESH</button>
            <button onClick={() => setShowScanList(!showScanList)} className="md:hidden p-1 text-gray-400 hover:text-white">
              {showScanList ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
        <div className={`flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 transition-all ${showScanList ? 'max-h-[40vh] md:max-h-full' : 'max-h-0 overflow-hidden md:max-h-full md:overflow-y-auto'}`}>
          {scans.map(scan => (
            <div key={scan._id} onClick={() => handleSelectScan(scan)}
              className={`p-3 border cursor-pointer transition-all ${selectedScan?._id === scan._id ? 'border-cyber-blue bg-cyber-blue/10' : 'border-gray-800 bg-cyber-dark hover:border-gray-600'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] sm:text-xs truncate max-w-[140px] font-mono ${selectedScan?._id === scan._id ? 'text-white' : 'text-gray-400'}`}>{scan.targetUrl}</span>
                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm ml-2 flex-shrink-0 ${scan.status === 'completed' ? 'bg-cyber-green/20 text-cyber-green' : scan.status === 'running' ? 'bg-cyber-blue/20 text-cyber-blue animate-pulse' : 'bg-cyber-pink/20 text-cyber-pink'}`}>{scan.status}</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-800/50 text-[10px] font-mono">
                <span className="text-gray-600">{new Date(scan.createdAt).toLocaleDateString()}</span>
                <span className={getSeverityColor(scan.riskLevel).split(' ')[0]}>{scan.riskLevel}</span>
              </div>
            </div>
          ))}
          {scans.length === 0 && <p className="text-center text-xs text-gray-500 mt-10 font-mono">No logs found.</p>}
        </div>
      </div>

      {/* Details */}
      <div className="w-full md:w-2/3 glass-panel border border-gray-800 flex flex-col z-10 min-h-[50vh] md:min-h-0">
        {selectedScan ? (<>
          <div className="p-4 sm:p-6 border-b border-gray-800 bg-cyber-dark/50">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
              <div className="min-w-0 w-full sm:w-auto">
                <h2 className="text-lg sm:text-2xl font-black uppercase text-white mb-1 break-all">{selectedScan.targetUrl}</h2>
                <p className="text-[10px] sm:text-xs text-cyber-blue font-mono">ID: {selectedScan._id}</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                <button onClick={() => downloadPDF(selectedScan._id)} className="flex items-center gap-2 px-3 py-2 border border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10 text-xs uppercase font-bold flex-1 sm:flex-none justify-center">
                  <Download size={14} /> PDF
                </button>
                <div className={`px-3 py-2 border font-bold uppercase text-xs flex items-center gap-1 flex-1 sm:flex-none justify-center ${getSeverityColor(selectedScan.riskLevel)}`}>
                  <AlertOctagon size={14} /> {selectedScan.riskLevel}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              {[
                { label: 'STATUS', val: selectedScan.status },
                { label: 'VULNS FOUND', val: selectedScan.vulnerabilities?.length || 0 },
                { label: 'COMPLETED', val: selectedScan.completedAt ? new Date(selectedScan.completedAt).toLocaleString() : 'N/A' },
              ].map(s => (
                <div key={s.label} className="p-3 border border-gray-800 bg-cyber-black">
                  <span className="block text-[10px] text-gray-500 mb-1 font-mono">{s.label}</span>
                  <span className="font-bold text-white text-sm uppercase">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-cyber-black/50 space-y-4">
            <h3 className="font-bold uppercase tracking-widest text-base flex items-center gap-2 mb-3"><FileWarning className="text-cyber-pink" /> Vulnerability Report</h3>
            {selectedScan.vulnerabilities?.length > 0 ? selectedScan.vulnerabilities.map((v, i) => (
              <div key={i} className={`border p-3 sm:p-5 relative overflow-hidden ${getSeverityColor(v.severity)} bg-opacity-5`}>
                <div className="absolute top-0 left-0 w-1 h-full bg-current" />
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3 pl-3">
                  <h4 className="font-bold text-base">{v.type}</h4>
                  <span className="text-[10px] px-2 py-1 border border-current font-mono">{v.severity}</span>
                </div>
                <p className="text-gray-300 text-xs mb-3 pl-3">{v.description}</p>
                <div className="pl-3 space-y-3 text-[10px] sm:text-xs font-mono">
                  <div><span className="font-bold text-white flex items-center gap-1 mb-1"><Info size={12}/> URL:</span><div className="p-2 bg-cyber-dark border border-gray-800 text-gray-400 break-all">{v.url}</div></div>
                  {v.evidence && <div><span className="font-bold text-white flex items-center gap-1 mb-1"><Terminal size={12}/> EVIDENCE:</span><div className="p-2 bg-cyber-dark border border-gray-800 text-cyber-blue break-all">{v.evidence}</div></div>}
                  {v.suggestion && <div className="p-3 border border-cyber-green bg-cyber-green/5 mt-3"><span className="font-bold text-cyber-green mb-1 block uppercase">Mitigation:</span><span className="text-gray-300">{v.suggestion}</span></div>}
                </div>
              </div>
            )) : (
              <div className="text-center py-8 border border-gray-800 border-dashed">
                <ShieldAlert className="mx-auto text-gray-600 mb-4" size={40} />
                <p className="text-gray-400 text-sm font-mono">No vulnerabilities detected.</p>
              </div>
            )}
          </div>
        </>) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-12 font-mono">
            <Terminal size={40} className="mb-4 opacity-50" />
            <p className="text-sm">Select a scan log to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
