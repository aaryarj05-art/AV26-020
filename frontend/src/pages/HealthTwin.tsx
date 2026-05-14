import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function HealthTwin() {
  const [interventions, setInterventions] = useState({
    weight_loss: 0,
    exercise: 0,
    quit_smoking: false
  });
  const [baselineData, setBaselineData] = useState<any[]>([]);
  const [simulatedData, setSimulatedData] = useState<any[]>([]);
  const [reduction, setReduction] = useState(0);

  const mockProfile = { age: 45, bmi: 31, bp_systolic: 145, smoking: 1 };

  const fetchSimulations = async () => {
    try {
      // Fetch Baseline
      const res1 = await fetch('http://localhost:8000/api/personal/health-twin/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: mockProfile, years: 5 })
      });
      const base = await res1.json();
      setBaselineData(base);

      // Fetch Simulated
      const res2 = await fetch('http://localhost:8000/api/personal/health-twin/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          profile: mockProfile, 
          years: 5, 
          interventions 
        })
      });
      const sim = await res2.json();
      setSimulatedData(sim);

      // Fetch Reduction
      const res3 = await fetch('http://localhost:8000/api/personal/health-twin/reduction?intervention=weight_loss&value=' + interventions.weight_loss, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockProfile)
      });
      const red = await res3.json();
      setReduction(red.reduction);

    } catch (err) {
      console.error("Simulation failed:", err);
    }
  };

  useEffect(() => {
    fetchSimulations();
  }, [interventions]);

  const combinedData = baselineData.map((d, i) => ({
    ...d,
    sim_diabetes: simulatedData[i]?.diabetes,
    sim_heart: simulatedData[i]?.heart
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-helix-text">Digital <span className="text-helix-accent">Health Twin</span></h1>
          <p className="text-helix-text-muted text-sm italic">Longitudinal risk projection and intervention modeling</p>
        </div>
        <div className="bg-helix-surface border border-helix-border px-4 py-2 rounded-xl text-xs font-bold text-helix-text-muted uppercase tracking-widest">
           Sync ID: <span className="text-helix-accent">HT-9921-A</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simulator Controls */}
        <div className="space-y-6">
          <div className="bg-helix-surface border border-helix-border rounded-3xl p-8 space-y-8">
            <h3 className="text-sm font-bold text-helix-text uppercase tracking-widest">Intervention Simulator</h3>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-helix-text">Weight Reduction</span>
                  <span className="text-helix-accent">{interventions.weight_loss} kg</span>
                </div>
                <input 
                  type="range" min="0" max="20" step="1"
                  value={interventions.weight_loss}
                  onChange={(e) => setInterventions({...interventions, weight_loss: parseInt(e.target.value)})}
                  className="w-full accent-helix-accent h-1.5 bg-helix-bg rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-helix-text">Weekly Exercise</span>
                  <span className="text-helix-accent">{interventions.exercise} hrs</span>
                </div>
                <input 
                  type="range" min="0" max="10" step="0.5"
                  value={interventions.exercise}
                  onChange={(e) => setInterventions({...interventions, exercise: parseFloat(e.target.value)})}
                  className="w-full accent-helix-accent h-1.5 bg-helix-bg rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => setInterventions({...interventions, quit_smoking: !interventions.quit_smoking})}
                  className={`w-full p-4 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                    interventions.quit_smoking ? 'border-helix-accent bg-helix-accent/10 text-helix-accent' : 'border-helix-border bg-helix-bg text-helix-text-muted'
                  }`}
                >
                  {interventions.quit_smoking ? '🚭 Smoking Cessation Active' : 'Smoking Status: Active'}
                </button>
              </div>
            </div>

            <div className="p-6 bg-helix-bg rounded-2xl border border-helix-border text-center">
               <p className="text-[10px] text-helix-text-muted uppercase font-bold mb-1">Potential Risk Reduction</p>
               <h4 className="text-4xl font-bold text-helix-success">-{reduction}%</h4>
               <p className="text-[9px] text-helix-text-muted mt-2 italic">Aggregated across all chronic vectors</p>
            </div>
          </div>
        </div>

        {/* Projections */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-helix-surface border border-helix-border rounded-3xl p-8">
            <h3 className="text-sm font-bold text-helix-text uppercase tracking-widest mb-8">5-Year Health Trajectory</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedData}>
                  <defs>
                    <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="year" stroke="#9CA3AF" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0D1421', border: '1px solid #1F2937', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  
                  {/* Baseline Diabetes */}
                  <Area 
                    type="monotone" 
                    dataKey="diabetes" 
                    name="Baseline Risk" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    fill="url(#colorBase)" 
                    strokeDasharray="5 5"
                  />
                  
                  {/* Simulated Diabetes */}
                  <Area 
                    type="monotone" 
                    dataKey="sim_diabetes" 
                    name="Optimized Risk" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    fill="url(#colorSim)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 flex gap-8 justify-center text-[10px] uppercase font-bold tracking-widest text-helix-text-muted">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-helix-danger border-t-2 border-dashed border-helix-danger" />
                  <span>Current Path</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-helix-success" />
                  <span>Mitigated Path</span>
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-helix-surface border border-helix-border rounded-2xl p-6 relative overflow-hidden">
               <h4 className="text-xs font-bold text-helix-text mb-4 uppercase">Neurological Guard</h4>
               <p className="text-xs text-helix-text-muted mb-4">Neural engine active. Scan biometric feed for facial/speech asymmetry anomalies.</p>
               <button className="w-full bg-helix-bg border border-helix-border py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-helix-accent transition-all">Launch StrokeGuard™</button>
            </div>
            <div className="bg-helix-surface border border-helix-border rounded-2xl p-6 relative overflow-hidden">
               <h4 className="text-xs font-bold text-helix-text mb-4 uppercase">Bio-Metric Lock</h4>
               <p className="text-xs text-helix-text-muted mb-4">Integrate live wearable telemetry for real-time twin synchronization.</p>
               <button className="w-full bg-helix-bg border border-helix-border py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-helix-accent transition-all">Link Wearable</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
