import React from 'react';

export default function ModelIntelligenceWidget() {
  const topPredictors = [
    { feature: 'Rainfall', impact: 0.28, trend: 'up' },
    { feature: 'Symptom Spikes', impact: 0.22, trend: 'up' },
    { feature: 'Historical Trend', impact: 0.18, trend: 'stable' }
  ];

  return (
    <div className="bg-helix-surface border border-helix-border rounded-2xl p-6 relative overflow-hidden group">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-helix-text uppercase tracking-widest">Model Intelligence</h3>
        <div className="px-2 py-0.5 rounded-full bg-helix-accent/10 border border-helix-accent/20">
           <span className="text-[8px] font-black text-helix-accent uppercase">XAI Active</span>
        </div>
      </div>

      <p className="text-[10px] text-helix-text-muted mb-6">Global Top Predictors (Last 7 Days)</p>

      <div className="space-y-4">
        {topPredictors.map((p, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <span className="text-xs">{i === 0 ? '🏆' : '🔹'}</span>
               <span className="text-xs font-bold text-helix-text">{p.feature}</span>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-mono text-helix-accent">+{ (p.impact * 100).toFixed(0) }%</span>
               <span className="text-[10px]">{p.trend === 'up' ? '📈' : '➖'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-helix-border">
         <p className="text-[10px] text-helix-text leading-relaxed italic">
            "Currently, <span className="text-helix-accent font-bold">Rainfall</span> is the #1 predictor of outbreak risk across all target regions."
         </p>
      </div>

      <button className="w-full mt-6 py-3 bg-helix-bg border border-helix-border rounded-xl text-[9px] font-bold uppercase tracking-widest text-helix-text-muted hover:border-helix-accent transition-all">
         Deep Model Analysis
      </button>
    </div>
  );
}
