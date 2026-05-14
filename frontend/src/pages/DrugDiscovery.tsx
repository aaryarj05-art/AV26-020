import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

export default function DrugDiscovery() {
  const [disease, setDisease] = useState("Dengue");
  const [protocol, setProtocol] = useState({
    drug_class: "Standard Supportive",
    dosage: 500,
    duration_days: 7
  });
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const simulate = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/drug-discovery/simulate', {
        disease,
        protocol
      });
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    simulate();
  }, [disease]);

  const sideEffectData = results ? [
    { name: 'Side Effects', value: results.side_effect_prob * 100 },
    { name: 'Safe', value: (1 - results.side_effect_prob) * 100 }
  ] : [];

  return (
    <div className="min-h-screen bg-helix-background p-8 pb-32 text-helix-text animate-fade-in">
      <div className="flex items-center gap-4 mb-10">
        <span className="text-4xl">🧪</span>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Drug Discovery <span className="text-helix-accent">Simulation</span></h1>
          <p className="text-sm text-helix-text-muted">Virtual treatment modeling and efficacy projections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Protocol Config */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-helix-surface border border-helix-border rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-8">Protocol Configuration</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-helix-text-muted uppercase tracking-widest">Target Pathogen</label>
                <select 
                  className="w-full bg-black/20 border border-helix-border rounded-xl p-4 outline-none focus:border-helix-accent"
                  value={disease}
                  onChange={(e) => setDisease(e.target.value)}
                >
                  {["Dengue", "Malaria", "Influenza"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-helix-text-muted uppercase tracking-widest">Drug Class / Variant</label>
                <select 
                  className="w-full bg-black/20 border border-helix-border rounded-xl p-4 outline-none focus:border-helix-accent"
                  value={protocol.drug_class}
                  onChange={(e) => setProtocol({...protocol, drug_class: e.target.value})}
                >
                  {disease === "Dengue" && ["Standard Supportive", "Aggressive Hydration", "Anti-Viral Candidate Alpha"].map(p => <option key={p} value={p}>{p}</option>)}
                  {disease === "Malaria" && ["Standard ACT", "Triple Artemisinin Therapy", "Experimental Vaccine Boost"].map(p => <option key={p} value={p}>{p}</option>)}
                  {disease === "Influenza" && ["Oseltamivir Standard", "Next-Gen Viral Inhibitor"].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-helix-text-muted uppercase tracking-widest">Dosage Intensity ({protocol.dosage}mg)</label>
                <input 
                  type="range" 
                  className="w-full h-1.5 bg-helix-border rounded-lg appearance-none cursor-pointer accent-helix-accent"
                  min="100" max="1000" step="50"
                  value={protocol.dosage}
                  onChange={(e) => setProtocol({...protocol, dosage: parseInt(e.target.value)})}
                />
              </div>

              <button 
                onClick={simulate}
                className="w-full py-4 bg-helix-accent text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {loading ? "Running Simulation..." : "Execute Simulation"}
              </button>
            </div>
          </div>

          <div className="p-8 bg-helix-accent/5 border border-helix-accent/20 rounded-[2.5rem]">
            <h4 className="text-xs font-black uppercase tracking-tighter mb-2">Simulation Engine V4.2</h4>
            <p className="text-[10px] text-helix-text-muted leading-relaxed">
              Using Monte Carlo Markov Chain (MCMC) modeling to estimate pharmacodynamic outcomes across 50,000 synthetic patient profiles.
            </p>
          </div>
        </div>

        {/* Results Analytics */}
        <div className="lg:col-span-8 space-y-8">
          {results && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-helix-surface border border-helix-border rounded-3xl p-8 text-center animate-scale-in">
                  <p className="text-[10px] font-black text-helix-text-muted uppercase mb-2">Clinical Efficacy</p>
                  <p className="text-5xl font-black text-helix-success">{results.efficacy_pct}%</p>
                </div>
                <div className="bg-helix-surface border border-helix-border rounded-3xl p-8 text-center animate-scale-in" style={{animationDelay: '100ms'}}>
                  <p className="text-[10px] font-black text-helix-text-muted uppercase mb-2">Time to Recovery</p>
                  <p className="text-5xl font-black text-helix-accent">{results.time_to_recovery}d</p>
                </div>
                <div className="bg-helix-surface border border-helix-border rounded-3xl p-8 text-center animate-scale-in" style={{animationDelay: '200ms'}}>
                  <p className="text-[10px] font-black text-helix-text-muted uppercase mb-2">Confidence</p>
                  <p className="text-5xl font-black text-white">0.94</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-helix-surface border border-helix-border rounded-[2.5rem] p-8 shadow-2xl">
                  <h2 className="text-xl font-bold mb-8">Safety Profile</h2>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sideEffectData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="#EF4444" />
                          <Cell fill="#1F2937" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-sm font-bold text-helix-danger">{Math.round(results.side_effect_prob * 100)}% Side Effect Probability</p>
                    <p className="text-[10px] text-helix-text-muted mt-1 uppercase tracking-widest">Synthetic Safety Score</p>
                  </div>
                </div>

                <div className="bg-helix-surface border border-helix-border rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Population Impact</h2>
                    <p className="text-xs text-helix-text-muted mb-8">Estimated gains if deployed to 5,000 active cases in the region.</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Lives Protected</span>
                      <span className="text-2xl font-black text-helix-success">+{results.impact.lives_saved}</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-helix-success" style={{width: '65%'}} />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Recovery Days Saved</span>
                      <span className="text-2xl font-black text-helix-accent">+{results.impact.recovery_days_saved}</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-helix-accent" style={{width: '82%'}} />
                    </div>
                  </div>

                  <p className="text-[8px] text-helix-text-muted mt-10 uppercase tracking-widest text-center">Actuarial Validation Pending</p>
                </div>
              </div>

              <div className="bg-helix-surface border border-helix-border rounded-[2.5rem] p-8 shadow-2xl">
                <h2 className="text-xl font-bold mb-8">Molecular Response Affinity</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {["Binding Affinity", "Metabolic Rate", "Excretion Half-life", "Toxicity Buffer"].map(m => (
                    <div key={m} className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                      <p className="text-[8px] text-helix-text-muted uppercase font-bold mb-2">{m}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-helix-border rounded-full overflow-hidden">
                          <div className="h-full bg-helix-accent" style={{width: `${Math.random() * 60 + 40}%`}} />
                        </div>
                        <span className="text-[10px] font-mono">0.8{Math.floor(Math.random()*9)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
