import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';

interface Intervention {
  day: number;
  type: string;
}

const formatNumber = (num: number) => new Intl.NumberFormat('en-IN').format(num);

export default function Simulation() {
  const [presets, setPresets] = useState<any>({});
  const [disease, setDisease] = useState("Dengue");
  const [model, setModel] = useState("SEIR");
  const [population, setPopulation] = useState(1000000);
  const [R0, setR0] = useState(3.5);
  const [gamma, setGamma] = useState(0.14);
  const [days, setDays] = useState(180);
  
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [newInvDay, setNewInvDay] = useState(30);
  const [newInvType, setNewInvType] = useState("lockdown");
  
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [baselineData, setBaselineData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [baselineMetrics, setBaselineMetrics] = useState<any>(null);
  
  const [isComparing, setIsComparing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8000/api/simulation/presets').then(res => {
      setPresets(res.data);
      if (res.data["Dengue"]) {
        setR0(res.data["Dengue"].R0);
        setGamma(res.data["Dengue"].gamma);
      }
    }).catch(console.error);
  }, []);

  const handleDiseaseChange = (d: str) => {
    setDisease(d);
    if (presets[d]) {
      setR0(presets[d].R0);
      setGamma(presets[d].gamma);
    }
  };

  const addIntervention = () => {
    setInterventions([...interventions, { day: newInvDay, type: newInvType }]);
  };

  const removeIntervention = (index: number) => {
    setInterventions(interventions.filter((_, i) => i !== index));
  };

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      // Run with interventions
      const res = await axios.post('http://localhost:8000/api/simulation/seir', {
        disease, population, R0, gamma, days, model, interventions
      });
      
      const formatData = (d: any) => {
        return d.days.map((day: number, i: number) => ({
          day,
          S: d.S[i],
          E: d.E[i],
          I: d.I[i],
          R: d.R[i]
        }));
      };

      setSimulationData(formatData(res.data));
      setMetrics({
        peak_infected: res.data.peak_infected,
        total_infected: res.data.total_infected,
        herd_immunity_threshold: res.data.herd_immunity_threshold
      });

      if (isComparing) {
        const baseRes = await axios.post('http://localhost:8000/api/simulation/seir', {
          disease, population, R0, gamma, days, model, interventions: []
        });
        setBaselineData(formatData(baseRes.data));
        setBaselineMetrics({
          peak_infected: baseRes.data.peak_infected,
          total_infected: baseRes.data.total_infected,
        });
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-helix-background p-8 pb-24 text-helix-text">
      
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl text-helix-accent">🧬</span>
        <div>
          <h1 className="text-3xl font-bold">Epidemiological <span className="text-helix-accent">Simulation</span></h1>
          <p className="text-sm text-helix-text-muted">Interactive SIR/SEIR modeling engine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT PANEL: CONTROLS */}
        <div className="bg-helix-surface border border-helix-border rounded-3xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white mb-4">Control Panel</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-helix-text-muted uppercase tracking-widest mb-2">Disease Preset</label>
              <select className="w-full bg-black/30 border border-helix-border rounded-lg p-2 text-sm focus:border-helix-accent outline-none" value={disease} onChange={e => handleDiseaseChange(e.target.value)}>
                {Object.keys(presets).map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-helix-text-muted uppercase tracking-widest mb-2">Model</label>
                <select className="w-full bg-black/30 border border-helix-border rounded-lg p-2 text-sm focus:border-helix-accent outline-none" value={model} onChange={e => setModel(e.target.value)}>
                  <option value="SIR">SIR</option>
                  <option value="SEIR">SEIR</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-helix-text-muted uppercase tracking-widest mb-2">Compare</label>
                <label className="flex items-center gap-2 mt-2">
                  <input type="checkbox" checked={isComparing} onChange={e => setIsComparing(e.target.checked)} className="rounded bg-black border-helix-border text-helix-accent" />
                  <span className="text-sm">Baseline</span>
                </label>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-bold text-helix-text-muted uppercase tracking-widest">Population (N)</label>
                <span className="text-xs text-helix-accent">{formatNumber(population)}</span>
              </div>
              <input type="range" min="1000" max="10000000" step="1000" value={population} onChange={e => setPopulation(Number(e.target.value))} className="w-full accent-helix-accent" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-bold text-helix-text-muted uppercase tracking-widest">R0 (Transmission)</label>
                <span className="text-xs text-helix-warning">{R0}</span>
              </div>
              <input type="range" min="0.5" max="15" step="0.1" value={R0} onChange={e => setR0(Number(e.target.value))} className="w-full accent-helix-warning" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-bold text-helix-text-muted uppercase tracking-widest">Days</label>
                <span className="text-xs text-white">{days}</span>
              </div>
              <input type="range" min="30" max="365" step="10" value={days} onChange={e => setDays(Number(e.target.value))} className="w-full accent-white" />
            </div>
          </div>

          <div className="pt-4 border-t border-helix-border/50">
            <h3 className="text-xs font-bold text-helix-text-muted uppercase tracking-widest mb-3">Interventions</h3>
            
            <div className="flex gap-2 mb-4">
              <input type="number" min="1" max={days} value={newInvDay} onChange={e => setNewInvDay(Number(e.target.value))} className="w-16 bg-black/30 border border-helix-border rounded-lg p-2 text-sm text-center" placeholder="Day" />
              <select value={newInvType} onChange={e => setNewInvType(e.target.value)} className="flex-1 bg-black/30 border border-helix-border rounded-lg p-2 text-sm">
                <option value="lockdown">Lockdown (-60% transmission)</option>
                <option value="mask_mandate">Mask Mandate (-30% transmission)</option>
                <option value="quarantine">Quarantine (-45% transmission)</option>
                <option value="vaccination">Mass Vaccination (20% to R)</option>
              </select>
              <button onClick={addIntervention} className="bg-helix-surface-light hover:bg-helix-border border border-helix-border px-3 rounded-lg">+</button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {interventions.map((inv, i) => (
                <div key={i} className="flex items-center gap-2 bg-helix-surface-light border border-helix-border rounded-full px-3 py-1 text-xs">
                  <span className="text-helix-accent font-bold">Day {inv.day}</span>
                  <span className="text-helix-text-muted capitalize">{inv.type.replace('_', ' ')}</span>
                  <button onClick={() => removeIntervention(i)} className="text-helix-danger ml-1 hover:text-red-400">×</button>
                </div>
              ))}
              {interventions.length === 0 && <span className="text-xs text-helix-text-muted italic">No interventions added.</span>}
            </div>

            <button 
              onClick={runSimulation}
              disabled={isLoading}
              className="w-full py-3 bg-helix-accent text-helix-background font-black uppercase tracking-widest rounded-xl hover:bg-[#00e0ff] transition-colors disabled:opacity-50"
            >
              {isLoading ? "Simulating..." : "Run Simulation"}
            </button>
          </div>
        </div>

        {/* CENTER & RIGHT: CHART & METRICS */}
        <div className="lg:col-span-3 space-y-6 flex flex-col">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-helix-surface border border-helix-border rounded-2xl p-4 flex flex-col">
              <span className="text-xs font-bold text-helix-text-muted uppercase tracking-widest mb-1">Peak Infected</span>
              <span className="text-2xl font-black text-helix-danger">
                {metrics ? formatNumber(metrics.peak_infected) : '--'}
              </span>
              {isComparing && baselineMetrics && metrics && (
                <span className="text-[10px] text-helix-success">
                  ↓ {formatNumber(baselineMetrics.peak_infected - metrics.peak_infected)} vs baseline
                </span>
              )}
            </div>
            
            <div className="bg-helix-surface border border-helix-border rounded-2xl p-4 flex flex-col">
              <span className="text-xs font-bold text-helix-text-muted uppercase tracking-widest mb-1">Total Infected</span>
              <span className="text-2xl font-black text-orange-400">
                {metrics ? formatNumber(metrics.total_infected) : '--'}
              </span>
              {isComparing && baselineMetrics && metrics && (
                <span className="text-[10px] text-helix-success">
                  ↓ {formatNumber(baselineMetrics.total_infected - metrics.total_infected)} vs baseline
                </span>
              )}
            </div>

            <div className="bg-helix-surface border border-helix-border rounded-2xl p-4 flex flex-col">
              <span className="text-xs font-bold text-helix-text-muted uppercase tracking-widest mb-1">Herd Immunity Thr.</span>
              <span className="text-2xl font-black text-helix-success">
                {metrics ? `${metrics.herd_immunity_threshold}%` : '--'}
              </span>
              <span className="text-[10px] text-helix-text-muted">Target vaccination %</span>
            </div>

            <div className="bg-helix-surface border border-helix-accent/50 rounded-2xl p-4 flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-helix-accent/5" />
              <span className="text-xs font-bold text-helix-accent uppercase tracking-widest mb-1 relative z-10">Infections Prevented</span>
              <span className="text-2xl font-black text-white relative z-10">
                {isComparing && baselineMetrics && metrics ? formatNumber(baselineMetrics.total_infected - metrics.total_infected) : 'Run Compare'}
              </span>
            </div>
          </div>

          <div className="flex-1 bg-helix-surface border border-helix-border rounded-3xl p-6 min-h-[500px]">
            {simulationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="day" type="category" allowDuplicatedCategory={false} stroke="#9CA3AF" tick={{fill: '#9CA3AF'}} tickLine={false} axisLine={false} label={{ value: 'Days', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }} />
                  <YAxis stroke="#9CA3AF" tick={{fill: '#9CA3AF'}} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0D1421', border: '1px solid #1F2937', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '14px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  
                  {isComparing && (
                    <Line data={baselineData} type="monotone" dataKey="I" name="Infected (Baseline)" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} opacity={0.5} />
                  )}

                  <Line data={simulationData} type="monotone" dataKey="S" name="Susceptible" stroke="#3B82F6" strokeWidth={3} dot={false} isAnimationActive={true} animationDuration={2000} />
                  {model === "SEIR" && (
                    <Line data={simulationData} type="monotone" dataKey="E" name="Exposed" stroke="#F59E0B" strokeWidth={3} dot={false} isAnimationActive={true} animationDuration={2000} />
                  )}
                  <Line data={simulationData} type="monotone" dataKey="I" name="Infected" stroke="#EF4444" strokeWidth={4} dot={false} isAnimationActive={true} animationDuration={2000} />
                  <Line data={simulationData} type="monotone" dataKey="R" name="Recovered" stroke="#10B981" strokeWidth={3} dot={false} isAnimationActive={true} animationDuration={2000} />

                  {interventions.map((inv, idx) => (
                    <ReferenceLine key={idx} x={inv.day} stroke="#00D4FF" strokeDasharray="3 3" label={{ position: 'top', value: inv.type, fill: '#00D4FF', fontSize: 10 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-helix-text-muted">
                <span className="text-4xl mb-4">📊</span>
                <p>Configure parameters and run the simulation to see the epidemiological curves.</p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
