import React, { useState, useEffect } from 'react';

export default function AlertDemo() {
  const [logs, setLogs] = useState<string[]>([]);
  const [city, setCity] = useState("Bangalore");
  const [status, setStatus] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Poll for status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/demo/status");
        const data = await res.json();
        setStatus(data);
        setIsSimulating(data.is_active);
        
        if (data.status === "completed" && !showEmailModal && logs.some(l => l.includes("📧"))) {
          setShowEmailModal(true);
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, [logs, showEmailModal]);

  // Connect to SSE stream
  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8000/api/demo/stream");
    
    eventSource.addEventListener("log", (event) => {
      setLogs((prevLogs) => [...prevLogs, event.data]);
    });
    
    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      // Automatically reconnects by default in browsers
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const triggerOutbreak = async () => {
    if (isSimulating) return;
    setLogs([]);
    setShowEmailModal(false);
    
    try {
      await fetch("http://localhost:8000/api/demo/trigger-outbreak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city })
      });
    } catch (e) {
      console.error("Failed to trigger", e);
    }
  };

  const resetDemo = async () => {
    try {
      await fetch("http://localhost:8000/api/demo/reset", { method: "POST" });
      setLogs([]);
      setShowEmailModal(false);
    } catch (e) {
      console.error("Failed to reset", e);
    }
  };

  const formatLog = (log: string) => {
    // Basic color coding for emojis and tags
    if (log.includes("🔴") || log.includes("CRITICAL")) return <span className="text-helix-danger font-bold">{log}</span>;
    if (log.includes("⚠️") || log.includes("MEDIUM")) return <span className="text-helix-warning font-bold">{log}</span>;
    if (log.includes("🚨") || log.includes("HIGH")) return <span className="text-orange-500 font-bold">{log}</span>;
    if (log.includes("📧")) return <span className="text-blue-400 font-bold">{log}</span>;
    if (log.includes("🟢")) return <span className="text-helix-success font-bold">{log}</span>;
    return <span className="text-helix-text">{log}</span>;
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold text-helix-text flex items-center gap-3">
          Alert Escalation <span className="text-helix-accent">Lifecycle</span>
          <div className="px-3 py-1 rounded-full bg-helix-danger/10 border border-helix-danger/20">
             <span className="text-[10px] text-helix-danger font-bold uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-helix-danger animate-pulse" /> Live Simulation
             </span>
          </div>
        </h1>
        <p className="text-helix-text-muted text-sm mt-2">End-to-End demonstration: Detection → Multi-modal fusion → Risk escalation → Automated dispatch</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls & Visuals */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-helix-surface border border-helix-border rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-helix-danger/5 rounded-full blur-3xl -mr-10 -mt-10" />
            
            <h2 className="text-xl font-bold text-helix-text mb-6 uppercase tracking-widest border-b border-helix-border pb-4">Simulation Control</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs text-helix-text-muted uppercase font-bold tracking-widest mb-2">Target Region</label>
                <select 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isSimulating}
                  className="w-full bg-helix-bg border border-helix-border text-helix-text rounded-xl p-3 outline-none focus:border-helix-accent transition-colors disabled:opacity-50"
                >
                  <option value="Bangalore">Bangalore (High Baseline)</option>
                  <option value="Mumbai">Mumbai (Dense Pop)</option>
                  <option value="Pune">Pune (Moderate Risk)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-helix-border">
                <button
                  onClick={triggerOutbreak}
                  disabled={isSimulating}
                  className={`w-full py-5 rounded-2xl font-black text-xl transition-all uppercase tracking-widest
                    ${isSimulating 
                      ? 'bg-helix-bg text-helix-text-muted border border-helix-border cursor-not-allowed' 
                      : 'bg-helix-danger/20 text-helix-danger border-2 border-helix-danger hover:bg-helix-danger hover:text-white shadow-[0_0_20px_#EF4444]'
                    }`}
                >
                  {isSimulating ? 'Simulation Running...' : '🚨 Trigger Outbreak'}
                </button>
              </div>
              
              <div className="text-center">
                <button 
                  onClick={resetDemo}
                  className="text-xs text-helix-text-muted hover:text-helix-text underline transition-colors"
                >
                  Reset Simulation
                </button>
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="bg-helix-surface border border-helix-border rounded-3xl p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-helix-text-muted uppercase font-bold tracking-widest mb-1">Current Risk Tier</p>
              <h3 className="text-2xl font-black text-helix-text">{status?.status === "baseline" ? "NORMAL" : status?.status}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-helix-text-muted uppercase font-bold tracking-widest mb-1">Fused Risk Score</p>
              <div className="text-3xl font-black text-helix-accent">{status?.risk_score || 40}%</div>
            </div>
          </div>

        </div>

        {/* Right Column: Live Event Log */}
        <div className="lg:col-span-7">
          <div className="bg-helix-bg border border-helix-border rounded-3xl flex flex-col h-[500px]">
            <div className="p-4 border-b border-helix-border bg-helix-surface rounded-t-3xl flex justify-between items-center">
              <h3 className="font-bold text-helix-text uppercase tracking-widest text-sm flex items-center gap-2">
                📡 Sub-System Telemetry Feed
              </h3>
              {isSimulating && <span className="text-[10px] text-helix-accent uppercase font-mono animate-pulse">Streaming...</span>}
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto font-mono text-sm space-y-3">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-helix-text-muted italic opacity-50">
                  Waiting for trigger...
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="animate-fade-in-up border-l-2 border-helix-border pl-3">
                    {formatLog(log)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mock Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden text-gray-800">
            {/* Email Header */}
            <div className="bg-gray-100 p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 font-medium">New Message</p>
                <p className="font-bold text-gray-900">HELIX Automated Intelligence Dispatch</p>
              </div>
              <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            
            {/* Email Body */}
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
                <div className="w-16 h-16 rounded-xl bg-red-100 flex items-center justify-center border border-red-200 text-3xl">
                  🚨
                </div>
                <div>
                  <h2 className="text-2xl font-black text-red-600 tracking-tight">HIGH RISK ALERT: Outbreak Detected</h2>
                  <p className="text-sm text-gray-500 mt-1">Generated by Helix Predictive Engine • {new Date().toLocaleString()}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="font-medium text-gray-800">To: {city} Municipal Health Authority,</p>
                
                <p className="text-gray-600 leading-relaxed">
                  The Helix Intelligence Platform has detected an anomalous spike in symptomatic reports corroborated by real-time environmental risk factors.
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Region</p>
                     <p className="text-lg font-bold text-gray-900">{city}</p>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Computed Risk</p>
                     <p className="text-lg font-bold text-red-600">85% (HIGH)</p>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Primary Indicators</p>
                     <p className="text-sm font-medium text-gray-800">Symptom Surge (n=50) + High Rainfall</p>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Projected Trajectory</p>
                     <p className="text-sm font-medium text-red-600">CRITICAL within 48h</p>
                   </div>
                </div>

                <div className="pt-4">
                   <p className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-2">Recommended Actions:</p>
                   <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                     <li>Deploy rapid testing kits to primary health centers in Ward 4 & 7.</li>
                     <li>Initiate vector control operations immediately.</li>
                     <li>Issue localized SMS advisories to vulnerable demographics.</li>
                   </ul>
                </div>
              </div>
              
              <div className="pt-6 text-center">
                <button 
                  onClick={() => setShowEmailModal(false)}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
                >
                  Acknowledge & Escalate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
