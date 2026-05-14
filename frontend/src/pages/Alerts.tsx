import React, { useState, useEffect } from 'react';

interface Alert {
  id: number;
  timestamp: string;
  region: string;
  disease: string;
  severity: string;
  message: string;
  is_active: boolean;
}

const AlertExplanation = ({ alertId }: { alertId: number }) => {
  const [explanation, setExplanation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchExplanation = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/explain/alert/${alertId}`);
      const data = await res.json();
      setExplanation(data);
    } catch (err) {
      console.error("Failed to fetch alert explanation:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !explanation) fetchExplanation();
  }, [isOpen]);

  return (
    <div className="mt-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-[10px] font-bold text-helix-accent uppercase tracking-widest flex items-center gap-1.5 hover:underline"
      >
        <span>🧠</span> {isOpen ? 'Hide Explanation' : 'Explain Trigger Logic'}
      </button>
      {isOpen && (
        <div className="mt-2 p-4 bg-helix-bg/50 border border-helix-border rounded-xl animate-fade-in">
          {loading ? (
             <p className="text-[10px] text-helix-text-muted italic">Running rule synthesis...</p>
          ) : (
            <div className="space-y-2">
               <p className="text-[11px] text-helix-text italic">"{explanation?.reason}"</p>
               <p className="text-[9px] text-helix-text-muted uppercase tracking-tighter">{explanation?.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/alerts/active${filter !== 'ALL' ? `?severity=${filter}` : ''}`);
      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const resolveAlert = async (id: number) => {
    try {
      await fetch(`http://localhost:8000/api/alerts/resolve/${id}`, { method: 'POST' });
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    }
  };

  const triggerTest = async () => {
    try {
      await fetch('http://localhost:8000/api/alerts/test', { method: 'POST' });
      fetchAlerts();
    } catch (err) {
      console.error("Test trigger failed:", err);
    }
  };

  const getSeverityStyle = (s: string) => {
    switch (s) {
      case 'CRITICAL': return 'bg-helix-danger/10 text-helix-danger border-helix-danger/20';
      case 'HIGH': return 'bg-helix-warning/10 text-helix-warning border-helix-warning/20';
      case 'MEDIUM': return 'bg-helix-accent/10 text-helix-accent border-helix-accent/20';
      default: return 'bg-helix-success/10 text-helix-success border-helix-success/20';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-helix-text">Early Warning <span className="text-helix-accent">Network</span></h1>
          <p className="text-helix-text-muted text-sm">Autonomous risk detection and emergency escalation</p>
        </div>
        <button 
          onClick={triggerTest}
          className="bg-helix-surface border border-helix-border px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-helix-text-muted hover:text-helix-accent hover:border-helix-accent/50 transition-all"
        >
          Trigger Simulation Alert
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              filter === s ? 'bg-helix-accent text-helix-bg shadow-lg shadow-helix-accent/20' : 'bg-helix-surface text-helix-text-muted border border-helix-border hover:border-helix-accent/30'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading && <div className="text-center text-helix-text-muted text-xs p-12">Scanning network protocols...</div>}
        
        {!loading && alerts.length === 0 && (
          <div className="bg-helix-surface border border-helix-border rounded-2xl p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-helix-success/10 flex items-center justify-center mb-4">
               <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-lg font-semibold text-helix-text">No Active Threats</h3>
            <p className="text-sm text-helix-text-muted max-w-[300px] mt-2">
               All systems normal across target surveillance regions.
            </p>
          </div>
        )}

        {alerts.map(alert => (
          <div 
            key={alert.id}
            className={`bg-helix-surface border-l-4 border rounded-2xl p-6 transition-all hover:scale-[1.01] ${
              alert.severity === 'CRITICAL' ? 'border-helix-danger border-l-helix-danger' : 
              alert.severity === 'HIGH' ? 'border-helix-warning border-l-helix-warning' : 
              'border-helix-border border-l-helix-accent'
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getSeverityStyle(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] text-helix-text-muted font-mono">{new Date(alert.timestamp).toLocaleString()}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-helix-text">{alert.region}: {alert.disease}</h3>
                  <p className="text-sm text-helix-text-muted mt-1 leading-relaxed">{alert.message}</p>
                </div>
                <AlertExplanation alertId={alert.id} />
              </div>
              
              <div className="flex items-center">
                <button 
                  onClick={() => resolveAlert(alert.id)}
                  className="bg-helix-bg border border-helix-border px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-helix-text hover:bg-helix-accent hover:text-helix-bg transition-all"
                >
                  Resolve
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
