import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DataFusionPanel() {
  const [fusionData, setFusionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFusionData = async () => {
      try {
        const [statusRes, contribRes] = await Promise.all([
          fetch('http://localhost:8000/api/fusion/status?region=Maharashtra'),
          fetch('http://localhost:8000/api/fusion/contribution?disease=Dengue&region=Maharashtra')
        ]);
        const status = await statusRes.json();
        const contrib = await contribRes.json();
        setFusionData({ ...status, contribution: contrib });
      } catch (err) {
        console.error("Failed to fetch fusion data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFusionData();
  }, []);

  if (loading) return <div className="p-8 text-center text-helix-text-muted">Initializing Neural Fusion...</div>;
  if (!fusionData || !fusionData.sources || !fusionData.contribution) return null;

  const COLORS = ['#00D4FF', '#10B981', '#F59E0B'];

  return (
    <div className="bg-helix-surface border border-helix-border rounded-3xl p-6 lg:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl font-bold text-helix-text flex items-center gap-2">
            Multi-Source <span className="text-helix-accent">Data Fusion</span>
            <div className="flex gap-1 ml-2">
               <div className="w-2 h-2 rounded-full bg-helix-accent animate-pulse" />
               <div className="w-2 h-2 rounded-full bg-helix-success animate-pulse delay-75" />
               <div className="w-2 h-2 rounded-full bg-helix-warning animate-pulse delay-150" />
            </div>
          </h2>
          <p className="text-xs text-helix-text-muted mt-1">Real-time synthesis of Historical, Environmental, and Symptom arrays</p>
        </div>

        <div className="flex items-center gap-4 bg-helix-bg border border-helix-border p-4 rounded-2xl">
           <div>
              <p className="text-[10px] text-helix-text-muted uppercase font-bold tracking-widest text-right">Fusion Confidence</p>
              <div className="text-3xl font-black text-helix-accent text-right">{fusionData.confidence}%</div>
           </div>
           <div className="w-12 h-12 rounded-full bg-helix-accent/10 flex items-center justify-center border border-helix-accent/20">
              <span className="text-xl">🧬</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fusionData.sources.map((src: any, i: number) => (
          <div key={i} className="p-5 rounded-2xl bg-helix-bg border border-helix-border flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
               <h3 className="text-xs font-bold text-helix-text uppercase tracking-widest">{src.name}</h3>
               <div className={`w-2.5 h-2.5 rounded-full ${src.status === 'Healthy' ? 'bg-helix-success' : 'bg-helix-warning'} shadow-[0_0_8px_currentColor]`} />
            </div>
            <div className="space-y-1">
               <p className="text-[10px] text-helix-text-muted font-mono">{src.record_count} records</p>
               <p className="text-[9px] text-helix-text-muted uppercase tracking-widest">Weight: <span className="text-helix-text font-bold">{src.weight}%</span></p>
               <p className="text-[9px] text-helix-text-muted uppercase mt-2">Sync: {new Date(src.last_updated).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pt-4 border-t border-helix-border">
        <div className="h-48 w-full flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={fusionData.contribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {fusionData.contribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0D1421', border: '1px solid #1F2937', borderRadius: '8px' }}
                itemStyle={{ color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-6">
           <div>
              <h4 className="text-[10px] font-bold text-helix-text uppercase tracking-widest mb-3">Ingestion Timeline (Last 6h)</h4>
              <div className="relative h-2 bg-helix-bg rounded-full overflow-hidden">
                 <div className="absolute top-0 left-0 h-full w-full bg-helix-success/30" />
                 <div className="absolute top-0 left-1/4 h-full w-[10%] bg-helix-danger/50" title="API Rate Limit Gap" />
                 <div className="absolute top-0 left-3/4 h-full w-[5%] bg-helix-danger/50" title="Telemetry Drop" />
                 
                 {/* Current time marker */}
                 <div className="absolute top-0 right-0 h-full w-1 bg-helix-accent shadow-[0_0_8px_#00D4FF]" />
              </div>
              <div className="flex justify-between text-[8px] text-helix-text-muted mt-1 font-mono uppercase">
                 <span>-6h</span>
                 <span>-3h</span>
                 <span className="text-helix-accent">Live</span>
              </div>
           </div>
           
           <p className="text-xs text-helix-text-muted leading-relaxed italic border-l-2 border-helix-accent pl-3">
              "High confidence driven by deep historical convergence combined with active Live Environmental telemetry. Minor gaps in real-time symptom reporting automatically mitigated by dynamic weight shifting to Historical arrays."
           </p>
        </div>
      </div>
    </div>
  );
}
