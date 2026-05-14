import React, { useState, useEffect } from 'react';

export default function WearableWidget() {
  const [data, setData] = useState<any>(null);

  const fetchLatest = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/wearables/latest');
      const latest = await res.json();
      setData(latest);
    } catch (err) {
      console.error("Wearable fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchLatest();
    const interval = setInterval(fetchLatest, 10000); // Sync every 10s
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  return (
    <div className="bg-helix-surface border border-helix-border rounded-2xl p-6 relative overflow-hidden group">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-helix-text uppercase tracking-widest">Wearable Live Vitals</h3>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-helix-success/10 border border-helix-success/20">
           <div className="w-1 h-1 rounded-full bg-helix-success animate-pulse" />
           <span className="text-[8px] font-black text-helix-success uppercase">Active</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
           <p className="text-[10px] text-helix-text-muted uppercase font-bold">Heart Rate</p>
           <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-helix-text">{data.heart_rate}</span>
              <span className="text-[10px] text-helix-text-muted">BPM</span>
           </div>
        </div>
        <div className="space-y-1">
           <p className="text-[10px] text-helix-text-muted uppercase font-bold">SpO2</p>
           <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-helix-accent">{data.spo2}%</span>
           </div>
        </div>
        <div className="space-y-1">
           <p className="text-[10px] text-helix-text-muted uppercase font-bold">Steps</p>
           <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-helix-text">{data.steps?.toLocaleString()}</span>
           </div>
        </div>
        <div className="space-y-1">
           <p className="text-[10px] text-helix-text-muted uppercase font-bold">Sleep</p>
           <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-helix-text">{data.sleep_hours}h</span>
           </div>
        </div>
      </div>

      {/* Sparkline simulation using CSS */}
      <div className="mt-6 h-8 w-full flex items-end gap-1 opacity-30">
         {[40, 60, 55, 70, 65, 80, 75, 90, 85, 95].map((h, i) => (
           <div key={i} className="flex-1 bg-helix-accent rounded-t-sm" style={{ height: `${h}%` }} />
         ))}
      </div>
    </div>
  );
}
