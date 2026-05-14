import { useState, useEffect } from 'react';

export default function DualLayerDemo() {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto my-12 bg-helix-surface border border-helix-border rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="border-b border-helix-border bg-helix-surface-light px-8 py-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-helix-text">Live Intelligence Synthesis</h3>
          <p className="text-sm text-helix-text-muted mt-1">
            Real-time data flowing between Population and Individual models
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-helix-success/10 border border-helix-success/20">
          <div className={`w-2.5 h-2.5 rounded-full bg-helix-success ${pulse ? 'opacity-100 scale-110' : 'opacity-50'} transition-all duration-500`} />
          <span className="text-xs font-semibold text-helix-success">Bi-directional Sync Active</span>
        </div>
      </div>

      {/* Main Split View */}
      <div className="relative flex flex-col lg:flex-row p-8 gap-8 items-stretch bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-helix-surface-light via-helix-surface to-helix-surface">
        
        {/* LEFT: INDIVIDUAL VIEW */}
        <div className="flex-1 bg-black/40 border border-helix-border/50 rounded-2xl p-6 flex flex-col gap-6 relative z-10 backdrop-blur-md">
          <div className="flex items-center gap-4 border-b border-helix-border/50 pb-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-400 uppercase tracking-wider text-sm">Individual Layer</h4>
              <p className="text-xs text-helix-text-muted">Digital Health Twin</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* User Profile Mock */}
            <div className="bg-helix-surface/50 p-4 rounded-xl border border-helix-border/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-helix-text-muted uppercase">Subject ID</span>
                <span className="text-xs font-mono text-helix-text">US-8492-AX</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-helix-text-muted uppercase">Vitals (Live)</span>
                <span className="text-xs font-mono text-helix-success">HR: 72 | SpO2: 98%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-helix-text-muted uppercase">Reported Symptoms</span>
                <span className="text-xs font-medium text-helix-warning">Mild Fever (38°C)</span>
              </div>
            </div>

            {/* Personal Risk Score */}
            <div className="bg-helix-surface/50 p-4 rounded-xl border border-helix-border/30 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-helix-warning/40 flex items-center justify-center relative">
                <span className="text-xl font-bold text-helix-warning">68%</span>
                {pulse && <div className="absolute inset-0 rounded-full border border-helix-warning animate-ping opacity-20" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-helix-text">Personal Dengue Risk</p>
                <p className="text-xs text-helix-text-muted mt-1">Elevated due to recent fever and high local transmission.</p>
              </div>
            </div>

            {/* Projection */}
            <div className="bg-helix-surface/50 p-4 rounded-xl border border-helix-border/30">
              <h5 className="text-xs text-helix-text-muted uppercase mb-3">5-Year Stroke Projection</h5>
              <div className="flex items-end gap-2 h-16">
                {[20, 22, 21, 24, 28, 35].map((val, i) => (
                  <div key={i} className="flex-1 bg-indigo-500/20 rounded-t-sm relative group">
                    <div 
                      className={`absolute bottom-0 left-0 right-0 rounded-t-sm transition-all duration-1000 ${i === 5 ? 'bg-indigo-400' : 'bg-indigo-500/50'}`}
                      style={{ height: `${val}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-helix-text-muted">Today</span>
                <span className="text-[10px] text-indigo-400 font-semibold">+15% vs baseline</span>
                <span className="text-[10px] text-helix-text-muted">+5 Yrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* BRIDGE - The Connection */}
        <div className="hidden lg:flex flex-col items-center justify-center relative z-20 w-32 shrink-0">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-12 pointer-events-none">
            {/* Arrow: Individual -> Population */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-[10px] font-semibold text-helix-text-muted uppercase bg-helix-surface px-2 rounded">Feeds</div>
              <div className={`h-1 w-full bg-gradient-to-r from-indigo-500/50 to-helix-danger/50 relative overflow-hidden`}>
                <div className={`absolute top-0 bottom-0 w-8 bg-white/40 blur-sm transform ${pulse ? 'translate-x-[200%] transition-transform duration-1000' : '-translate-x-[100%]'}`} />
              </div>
              <span className="text-helix-danger/50 text-xs">▶</span>
            </div>

            {/* Arrow: Population -> Individual */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-helix-warning text-xs">◀</span>
              <div className={`h-1 w-full bg-gradient-to-l from-helix-danger/50 to-helix-warning/50 relative overflow-hidden`}>
                <div className={`absolute top-0 bottom-0 w-8 bg-white/40 blur-sm transform ${pulse ? '-translate-x-[200%] transition-transform duration-1000' : 'translate-x-[100%]'}`} />
              </div>
              <div className="text-[10px] font-semibold text-helix-text-muted uppercase bg-helix-surface px-2 rounded text-center leading-tight mt-1">
                Contextualizes
              </div>
            </div>
          </div>
          
          <div className="bg-helix-surface border border-helix-warning/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] rounded-xl p-3 text-center w-48 absolute top-1/2 -translate-y-1/2">
            <span className="text-xl mb-1 block">⚠️</span>
            <p className="text-[10px] text-helix-text font-medium leading-relaxed">
              Your Dengue risk is elevated because your region has <span className="text-helix-danger font-bold">HIGH</span> outbreak activity.
            </p>
          </div>
        </div>

        {/* RIGHT: POPULATION VIEW */}
        <div className="flex-1 bg-black/40 border border-helix-border/50 rounded-2xl p-6 flex flex-col gap-6 relative z-10 backdrop-blur-md">
          <div className="flex items-center gap-4 border-b border-helix-border/50 pb-4">
            <div className="w-12 h-12 rounded-full bg-helix-danger/20 flex items-center justify-center border border-helix-danger/30">
              <span className="text-2xl">🌍</span>
            </div>
            <div>
              <h4 className="font-semibold text-helix-danger uppercase tracking-wider text-sm">Population Layer</h4>
              <p className="text-xs text-helix-text-muted">Epidemiological AI</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Regional Status Mock */}
            <div className="bg-helix-surface/50 p-4 rounded-xl border border-helix-border/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-helix-text-muted uppercase">Active Region</span>
                <span className="text-xs font-mono text-helix-text">Mumbai (IN-MH)</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-helix-text-muted uppercase">Active Cases</span>
                <span className="text-xs font-mono text-helix-danger">1,248 (+12% WoW)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-helix-text-muted uppercase">Env. Modifier</span>
                <span className="text-xs font-medium text-helix-warning">Humidity: 85% (1.4x risk)</span>
              </div>
            </div>

            {/* Outbreak Alert */}
            <div className="bg-helix-danger/10 p-4 rounded-xl border border-helix-danger/30 flex items-start gap-4">
              <div className="mt-1">
                <span className="text-xl">🚨</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-white bg-helix-danger px-1.5 py-0.5 rounded uppercase">Critical Alert</span>
                  <span className="text-xs text-helix-danger font-mono">DENGUE</span>
                </div>
                <p className="text-xs text-helix-text mt-2 leading-relaxed">
                  Z-score spike detected (+3.2σ) in reported fever and joint pain symptoms within 5km radius.
                </p>
              </div>
            </div>

            {/* Map Mock */}
            <div className="bg-helix-surface/50 p-4 rounded-xl border border-helix-border/30 h-28 relative overflow-hidden flex items-center justify-center">
               {/* Grid Background */}
               <div className="absolute inset-0 border-[0.5px] border-helix-border/20 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px]" />
               
               {/* Pulsing Hotspot */}
               <div className="relative">
                 <div className="w-12 h-12 bg-helix-danger/30 rounded-full animate-ping absolute -inset-2 opacity-50" />
                 <div className="w-8 h-8 bg-helix-danger/60 rounded-full border border-helix-danger flex items-center justify-center z-10 relative backdrop-blur-sm">
                    <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]" />
                 </div>
               </div>
               
               {/* Surrounding dots */}
               <div className="absolute top-6 left-12 w-3 h-3 bg-helix-warning/50 rounded-full" />
               <div className="absolute bottom-4 right-16 w-4 h-4 bg-helix-danger/40 rounded-full" />
               <div className="absolute top-10 right-8 w-2 h-2 bg-helix-warning/60 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
