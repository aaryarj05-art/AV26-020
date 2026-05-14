import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

interface Alert {
  id: number;
  region: string;
  disease: string;
  severity: string;
  timestamp: string;
}

export default function NotificationBell() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchRecent = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/alerts/notifications');
      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      console.error("Failed to poll notifications:", err);
    }
  };

  useEffect(() => {
    fetchRecent();
    const interval = setInterval(fetchRecent, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-helix-surface-light transition-colors group"
      >
        <span className="text-xl">🔔</span>
        {alerts.length > 0 && (
          <span className={`absolute top-0 right-0 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-helix-bg ${
            criticalCount > 0 ? 'bg-helix-danger animate-pulse' : 'bg-helix-accent'
          }`}>
            {alerts.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-80 bg-helix-surface border border-helix-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in origin-top-right">
            <div className="p-4 border-b border-helix-border flex justify-between items-center bg-helix-bg/50">
              <h3 className="text-[10px] font-black text-helix-text uppercase tracking-widest">Active Alerts</h3>
              <NavLink 
                to="/alerts" 
                onClick={() => setIsOpen(false)}
                className="text-[10px] text-helix-accent hover:underline uppercase"
              >
                View Feed
              </NavLink>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-xs text-helix-text-muted italic">
                  No active threats detected.
                </div>
              ) : (
                alerts.map(alert => (
                  <NavLink
                    key={alert.id}
                    to="/alerts"
                    onClick={() => setIsOpen(false)}
                    className="p-4 border-b border-helix-border/50 block hover:bg-helix-surface-light transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${
                        alert.severity === 'CRITICAL' ? 'border-helix-danger text-helix-danger bg-helix-danger/10' :
                        alert.severity === 'HIGH' ? 'border-helix-warning text-helix-warning bg-helix-warning/10' :
                        'border-helix-accent text-helix-accent bg-helix-accent/10'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-[8px] text-helix-text-muted font-mono">{new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-xs font-bold text-helix-text group-hover:text-helix-accent transition-colors">{alert.region}: {alert.disease}</p>
                  </NavLink>
                ))
              )}
            </div>
            
            <div className="p-3 text-center bg-helix-bg/30">
               <span className="text-[9px] text-helix-text-muted italic uppercase">Helix Surveillance Active</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
