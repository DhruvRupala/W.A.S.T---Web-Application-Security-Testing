import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldAlert, Terminal, AlertOctagon, Info, FileWarning, Download } from 'lucide-react';

const Reports = () => {
  const [scans, setScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/scans');
      setScans(res.data);
      if (res.data.length > 0) {
        setSelectedScan(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const downloadPDF = async (scanId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/pdf/${scanId}`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `WAST-Report-${scanId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('PDF download failed', err);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'text-cyber-pink border-cyber-pink bg-cyber-pink/10';
      case 'High': return 'text-orange-500 border-orange-500 bg-orange-500/10';
      case 'Medium': return 'text-cyber-yellow border-cyber-yellow bg-cyber-yellow/10';
      case 'Low': return 'text-cyber-blue border-cyber-blue bg-cyber-blue/10';
      default: return 'text-gray-400 border-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6">
      {/* Scan History Sidebar */}
      <div className="w-full md:w-1/3 glass-panel border border-gray-800 flex flex-col z-10">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-bold tracking-widest uppercase text-cyber-blue"><Terminal size={18} className="inline mr-2" /> Scan Logs</h3>
          <button onClick={fetchScans} className="text-xs text-gray-500 hover:text-white transition-colors" style={{ fontFamily: "'Fira Code', monospace" }}>REFRESH</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {scans.map(scan => (
            <div
              key={scan._id}
              onClick={() => setSelectedScan(scan)}
              className={`p-4 border cursor-pointer transition-all duration-300
                ${selectedScan?._id === scan._id
                  ? 'border-cyber-blue bg-cyber-blue/10'
                  : 'border-gray-800 bg-cyber-dark hover:border-gray-600'}`
              }
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs truncate max-w-[180px] ${selectedScan?._id === scan._id ? 'text-white text-glow-blue' : 'text-gray-400'}`} style={{ fontFamily: "'Fira Code', monospace" }}>
                  {scan.targetUrl}
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm
                  ${scan.status === 'completed' ? 'bg-cyber-green/20 text-cyber-green' :
                  (scan.status === 'running' ? 'bg-cyber-blue/20 text-cyber-blue animate-pulse' : 'bg-cyber-pink/20 text-cyber-pink')}`}>
                  {scan.status}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-800/50">
                <span className="text-xs text-gray-600" style={{ fontFamily: "'Fira Code', monospace" }}>
                  {new Date(scan.createdAt).toLocaleString()}
                </span>
                <span className={`text-xs font-bold ${getSeverityColor(scan.riskLevel).split(' ')[0]}`} style={{ fontFamily: "'Fira Code', monospace" }}>
                  {scan.riskLevel}
                </span>
              </div>
            </div>
          ))}
          {scans.length === 0 && <p className="text-center text-sm text-gray-500 mt-10" style={{ fontFamily: "'Fira Code', monospace" }}>No logs found.</p>}
        </div>
      </div>

      {/* Scan Details */}
      <div className="w-full md:w-2/3 glass-panel border border-gray-800 flex flex-col z-10">
        {selectedScan ? (
          <>
            <div className="p-6 border-b border-gray-800 bg-cyber-dark/50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-black uppercase text-white mb-1 break-all">{selectedScan.targetUrl}</h2>
                  <p className="text-xs text-cyber-blue" style={{ fontFamily: "'Fira Code', monospace" }}>ID: {selectedScan._id}</p>
                </div>
                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => downloadPDF(selectedScan._id)}
                    className="flex items-center gap-2 px-4 py-2 border border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10 transition-colors text-sm uppercase tracking-wider font-bold"
                  >
                    <Download size={16} /> PDF
                  </button>
                  <div className={`px-4 py-2 border font-bold uppercase tracking-widest text-sm flex items-center gap-2 ${getSeverityColor(selectedScan.riskLevel)}`}>
                    <AlertOctagon size={18} />
                    {selectedScan.riskLevel}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="p-3 border border-gray-800 bg-cyber-black">
                  <span className="block text-xs text-gray-500 mb-1" style={{ fontFamily: "'Fira Code', monospace" }}>STATUS</span>
                  <span className="font-bold text-white uppercase">{selectedScan.status}</span>
                </div>
                <div className="p-3 border border-gray-800 bg-cyber-black">
                  <span className="block text-xs text-gray-500 mb-1" style={{ fontFamily: "'Fira Code', monospace" }}>VULNS FOUND</span>
                  <span className="font-bold text-white text-xl">{selectedScan.vulnerabilities?.length || 0}</span>
                </div>
                <div className="p-3 border border-gray-800 bg-cyber-black">
                  <span className="block text-xs text-gray-500 mb-1" style={{ fontFamily: "'Fira Code', monospace" }}>COMPLETED</span>
                  <span className="font-bold text-white text-sm">{selectedScan.completedAt ? new Date(selectedScan.completedAt).toLocaleString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-cyber-black/50 space-y-6">
              <h3 className="font-bold uppercase tracking-widest text-lg flex items-center gap-2 mb-4">
                <FileWarning className="text-cyber-pink" />
                Vulnerability Report
              </h3>

              {selectedScan.vulnerabilities && selectedScan.vulnerabilities.length > 0 ? (
                selectedScan.vulnerabilities.map((vuln, idx) => (
                  <div key={idx} className={`border p-5 relative overflow-hidden ${getSeverityColor(vuln.severity)} bg-opacity-5`}>
                    <div className="absolute top-0 left-0 w-1 h-full bg-current"></div>
                    <div className="flex justify-between items-start mb-3 pl-4">
                      <h4 className="font-bold text-lg">{vuln.type}</h4>
                      <span className="text-xs px-2 py-1 border border-current" style={{ fontFamily: "'Fira Code', monospace" }}>{vuln.severity}</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-4 pl-4">{vuln.description}</p>

                    <div className="pl-4 space-y-4 text-xs" style={{ fontFamily: "'Fira Code', monospace" }}>
                      <div>
                        <span className="font-bold text-white flex items-center gap-1 mb-1"><Info size={14}/> URL PATH:</span>
                        <div className="p-2 bg-cyber-dark border border-gray-800 text-gray-400 break-all">{vuln.url}</div>
                      </div>
                      {vuln.evidence && (
                        <div>
                          <span className="font-bold text-white flex items-center gap-1 mb-1"><Terminal size={14}/> EVIDENCE:</span>
                          <div className="p-2 bg-cyber-dark border border-gray-800 text-cyber-blue break-all">{vuln.evidence}</div>
                        </div>
                      )}
                      {vuln.suggestion && (
                        <div className="p-4 border border-cyber-green bg-cyber-green/5 mt-4">
                          <span className="font-bold text-cyber-green mb-1 block uppercase">Mitigation Suggestion:</span>
                          <span className="text-gray-300">{vuln.suggestion}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border border-gray-800 border-dashed">
                  <ShieldAlert className="mx-auto text-gray-600 mb-4" size={48} />
                  <p className="text-gray-400" style={{ fontFamily: "'Fira Code', monospace" }}>No vulnerabilities detected.</p>
                  <p className="text-gray-600 text-xs mt-2" style={{ fontFamily: "'Fira Code', monospace" }}>Target appears secure based on the selected criteria.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500" style={{ fontFamily: "'Fira Code', monospace" }}>
            <Terminal size={48} className="mb-4 opacity-50" />
            <p>Select a scan log to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
