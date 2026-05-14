import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function XAIView() {
  const [selectedModel, setSelectedModel] = useState('Outbreak Ensemble');
  
  const mockSHAPData = [
    { feature: 'Rainfall (Weekly)', impact: 24, description: 'Increased stagnant water' },
    { feature: 'Symptom Spikes', impact: 18, description: 'Detected regional clustering' },
    { feature: 'Temperature', impact: 12, description: 'Accelerated pathogen growth' },
    { feature: 'AQI', impact: -8, description: 'Decreased respiratory transmission' },
    { feature: 'Mobility Index', impact: 5, description: 'Inter-regional travel' }
  ];

  const correlations = [
    { source: 'Rainfall', target: 'Dengue Cases', correlation: 0.82 },
    { source: 'Humidity', target: 'Malaria Risk', correlation: 0.75 },
    { source: 'AQI', target: 'Influenza', correlation: 0.68 }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-helix-text">Model <span className="text-helix-accent">Interpretability</span></h1>
          <p className="text-helix-text-muted text-sm">SHAP-based feature attribution and causality analysis</p>
        </div>
        <select 
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="bg-helix-surface border border-helix-border text-xs text-helix-text rounded-xl px-4 py-2 outline-none focus:border-helix-accent"
        >
          <option>Outbreak Ensemble</option>
          <option>Diabetes Classifier</option>
          <option>Heart Disease Model</option>
          <option>Stroke Guard Engine</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Waterfall Chart */}
        <div className="lg:col-span-2 bg-helix-surface border border-helix-border rounded-3xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-bold text-helix-text uppercase tracking-widest">Global Feature Attribution</h3>
            <span className="text-[10px] text-helix-text-muted font-mono">Algorithm: SHAP TreeExplainer</span>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockSHAPData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
                <XAxis type="number" stroke="#9CA3AF" fontSize={11} hide />
                <YAxis dataKey="feature" type="category" stroke="#9CA3AF" fontSize={11} width={120} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D1421', border: '1px solid #1F2937', borderRadius: '12px' }}
                  cursor={{ fill: '#1F2937', opacity: 0.4 }}
                />
                <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                  {mockSHAPData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.impact > 0 ? '#EF4444' : '#10B981'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 p-6 bg-helix-bg rounded-2xl border border-helix-border">
             <h4 className="text-xs font-bold text-helix-text mb-2 uppercase tracking-widest">Interpretation Narrative</h4>
             <p className="text-xs text-helix-text-muted leading-relaxed italic">
               "For the {selectedModel}, current predictions are highly sensitive to <span className="text-helix-accent font-bold">Rainfall</span>. 
               A 10% increase in weekly precipitation typically results in a 2.4% rise in predicted risk, indicating a strong causal link between environmental stagnant water and pathogen proliferation."
             </p>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-8">
          <div className="bg-helix-surface border border-helix-border rounded-3xl p-8">
             <h3 className="text-sm font-bold text-helix-text uppercase tracking-widest mb-6">Cross-Correlations</h3>
             <div className="space-y-4">
                {correlations.map((c, i) => (
                  <div key={i} className="p-4 bg-helix-bg rounded-xl border border-helix-border flex justify-between items-center">
                     <div>
                        <p className="text-[10px] text-helix-text-muted uppercase font-bold">{c.source}</p>
                        <p className="text-xs font-bold text-helix-text">{c.target}</p>
                     </div>
                     <div className="text-right">
                        <span className="text-lg font-black text-helix-accent">{c.correlation}</span>
                        <p className="text-[8px] text-helix-text-muted uppercase">Pearson</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-helix-surface border border-helix-border rounded-3xl p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-helix-accent/5 rounded-full -mr-12 -mt-12" />
             <h3 className="text-sm font-bold text-helix-text uppercase tracking-widest mb-4">How it works</h3>
             <p className="text-xs text-helix-text-muted leading-relaxed">
                Helix uses **SHAP (SHapley Additive exPlanations)** to break down complex ensemble models into human-readable contributions. 
             </p>
             <p className="text-xs text-helix-text-muted leading-relaxed mt-4">
                By calculating the marginal contribution of each feature across all possible combinations, we ensure that every prediction is **transparent, accountable, and medically justifiable**.
             </p>
             <button className="w-full mt-6 py-3 border border-helix-accent/50 text-helix-accent text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-helix-accent/10 transition-all">
                Download Model Card (v0.1)
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
