import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

interface ModelStatus {
  model_name: string;
  last_trained: string;
  current_rmse: number;
  drift_score: number;
  retrain_due: boolean;
}

interface Improvement {
  timestamp: string;
  model: string;
  reason: string;
  old_rmse: number;
  new_rmse: number;
  improvement_pct: number;
  status: string;
}

export default function LearningCenter() {
  const [status, setStatus] = useState<ModelStatus[]>([]);
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrainingModel, setRetrainingModel] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusRes, improveRes] = await Promise.all([
        axios.get('http://localhost:8000/api/learning/status'),
        axios.get('http://localhost:8000/api/learning/improvements')
      ]);
      setStatus(statusRes.data);
      setImprovements(improveRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrain = async (modelName: string) => {
    setRetrainingModel(modelName);
    try {
      await axios.post(`http://localhost:8000/api/learning/trigger-retrain/${modelName}`);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setRetrainingModel(null);
    }
  };

  // Mock performance data for the chart
  const performanceData = [
    { day: 'Day 1', dengue: 55, malaria: 48, stroke: 42 },
    { day: 'Day 2', dengue: 53, malaria: 47, stroke: 41 },
    { day: 'Day 3', dengue: 56, malaria: 52, stroke: 43 },
    { day: 'Day 4', dengue: 48, malaria: 45, stroke: 40 }, // Retrain event
    { day: 'Day 5', dengue: 46, malaria: 44, stroke: 39 },
    { day: 'Day 6', dengue: 45, malaria: 43, stroke: 38 },
    { day: 'Day 7', dengue: 44, malaria: 42, stroke: 37 },
  ];

  const getStatusBadge = (s: ModelStatus) => {
    if (retrainingModel === s.model_name) return <span className="bg-helix-accent/20 text-helix-accent px-3 py-1 rounded-full text-[10px] font-bold animate-pulse">🔄 Retraining</span>;
    if (s.drift_score > 0.7) return <span className="bg-helix-danger/10 text-helix-danger px-3 py-1 rounded-full text-[10px] font-bold border border-helix-danger/30">⚠️ Drift Detected</span>;
    if (s.retrain_due) return <span className="bg-helix-warning/10 text-helix-warning px-3 py-1 rounded-full text-[10px] font-bold border border-helix-warning/30">🔄 Update Due</span>;
    return <span className="bg-helix-success/10 text-helix-success px-3 py-1 rounded-full text-[10px] font-bold border border-helix-success/30">✅ Healthy</span>;
  };

  if (loading && status.length === 0) return (
    <div className="min-h-screen bg-helix-background flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-helix-accent/20 border-t-helix-accent rounded-full animate-spin mb-6" />
      <p className="text-xl font-medium text-helix-text-muted">Analyzing Neural Performance...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-helix-background p-8 pb-32 text-helix-text animate-fade-in">
      <div className="flex items-center gap-4 mb-10">
        <span className="text-4xl">🧠</span>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Helix <span className="text-helix-accent">Learning Center</span></h1>
          <p className="text-sm text-helix-text-muted">Automated model maintenance and continuous intelligence loop</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Model Status Table */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-helix-surface border border-helix-border rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-8">Intelligence Inventory</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-helix-text-muted uppercase tracking-widest border-b border-helix-border">
                    <th className="pb-4 font-bold">Model Name</th>
                    <th className="pb-4 font-bold">Last Trained</th>
                    <th className="pb-4 font-bold">RMSE</th>
                    <th className="pb-4 font-bold">Drift Score</th>
                    <th className="pb-4 font-bold">Status</th>
                    <th className="pb-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-helix-border/50">
                  {status.map((s) => (
                    <tr key={s.model_name} className="group hover:bg-white/5 transition-all">
                      <td className="py-6 font-bold">{s.model_name}</td>
                      <td className="py-6 text-xs text-helix-text-muted font-mono">{new Date(s.last_trained).toLocaleDateString()}</td>
                      <td className="py-6 text-xs font-mono">{s.current_rmse}</td>
                      <td className="py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-1.5 bg-helix-border rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${s.drift_score > 0.7 ? 'bg-helix-danger' : 'bg-helix-accent'}`} 
                              style={{ width: `${s.drift_score * 100}%` }} 
                            />
                          </div>
                          <span className="text-[10px] font-mono">{s.drift_score}</span>
                        </div>
                      </td>
                      <td className="py-6">{getStatusBadge(s)}</td>
                      <td className="py-6 text-right">
                        <button 
                          onClick={() => handleRetrain(s.model_name)}
                          disabled={retrainingModel === s.model_name}
                          className="px-4 py-2 bg-helix-surface-light border border-helix-border rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-helix-accent hover:text-black hover:border-helix-accent transition-all disabled:opacity-50"
                        >
                          Retrain
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Timeline */}
          <div className="bg-helix-surface border border-helix-border rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-bold">Accuracy Convergence</h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-helix-accent" />
                  <span className="text-[10px] font-bold text-helix-text-muted uppercase">Dengue LSTM</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-helix-success" />
                  <span className="text-[10px] font-bold text-helix-text-muted uppercase">Malaria Prophet</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="day" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <ReferenceLine x="Day 4" stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'top', value: 'RETRAIN', fill: '#EF4444', fontSize: 10 }} />
                  <Line type="monotone" dataKey="dengue" stroke="#00D4FF" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="malaria" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-helix-text-muted text-center mt-6 italic">RMSE values trending downwards indicate the system is becoming smarter over time.</p>
          </div>
        </div>

        {/* Learning Feed */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-helix-surface border border-helix-border rounded-[2.5rem] p-8 shadow-2xl flex flex-col h-full">
            <h2 className="text-xl font-bold mb-8">Learning Feed</h2>
            <div className="space-y-6 flex-1">
              {improvements.length > 0 ? (
                improvements.slice().reverse().map((imp, i) => (
                  <div key={i} className="relative pl-6 border-l border-helix-accent/30 py-1">
                    <div className="absolute top-2 -left-1.5 w-3 h-3 rounded-full bg-helix-accent" />
                    <p className="text-xs font-bold mb-1">{imp.model} Refined</p>
                    <p className="text-[10px] text-helix-text-muted leading-relaxed mb-2">
                      RMSE improved from <span className="text-helix-text font-bold">{imp.old_rmse}</span> → <span className="text-helix-success font-bold">{imp.new_rmse}</span> 
                      ({imp.improvement_pct}% improvement)
                    </p>
                    <p className="text-[10px] text-helix-accent font-mono">{new Date(imp.timestamp).toLocaleTimeString()}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 opacity-30">
                  <span className="text-4xl block mb-4">💤</span>
                  <p className="text-xs">No improvements logged yet today.</p>
                </div>
              )}
              
              <div className="relative pl-6 border-l border-helix-border py-1 opacity-50">
                <div className="absolute top-2 -left-1.5 w-3 h-3 rounded-full bg-helix-border" />
                <p className="text-xs font-bold mb-1">New Symptom Data Ingested</p>
                <p className="text-[10px] text-helix-text-muted mb-2">547 new records incorporated into online training buffer.</p>
                <p className="text-[10px] font-mono">01:45 AM</p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-helix-accent/5 border border-helix-accent/20 rounded-2xl">
              <h4 className="text-[10px] font-black text-helix-accent uppercase tracking-widest mb-2">System Telemetry</h4>
              <div className="flex justify-between items-center text-xs">
                <span className="text-helix-text-muted">Retrain Cycles</span>
                <span className="font-bold">6h Interval</span>
              </div>
              <div className="flex justify-between items-center text-xs mt-2">
                <span className="text-helix-text-muted">A/B Testing</span>
                <span className="font-bold text-helix-success">Shadow Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
