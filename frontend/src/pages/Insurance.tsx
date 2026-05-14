import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

export default function Insurance() {
  const [profile, setProfile] = useState({
    age: 35,
    bmi: 24,
    diabetes_risk: 45,
    heart_risk: 30
  });
  const [regionRisk, setRegionRisk] = useState(65);
  const [premiumData, setPremiumData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculatePremium = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/insurance/premium', {
        user_profile: profile,
        region_risk_score: regionRisk
      });
      setPremiumData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculatePremium();
  }, []);

  const exposureData = [
    { name: 'Maharashtra', exposure: 85, claims: 12.4 },
    { name: 'Kerala', exposure: 60, claims: 8.2 },
    { name: 'Tamil Nadu', exposure: 45, claims: 5.1 },
    { name: 'Delhi', exposure: 75, claims: 9.8 },
    { name: 'Karnataka', exposure: 30, claims: 3.2 },
  ];

  return (
    <div className="min-h-screen bg-helix-background p-8 pb-32 text-helix-text animate-fade-in">
      <div className="flex items-center gap-4 mb-10">
        <span className="text-4xl">🛡️</span>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Insurance <span className="text-helix-accent">Analytics</span></h1>
          <p className="text-sm text-helix-text-muted">Risk-based premium modeling and actuarial intelligence</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Personal Premium Calculator */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-helix-surface border border-helix-border rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-8">Premium Calculator</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-helix-text-muted uppercase tracking-widest">Age</label>
                  <input 
                    type="number" 
                    className="w-full bg-black/20 border border-helix-border rounded-xl p-4 outline-none focus:border-helix-accent"
                    value={profile.age}
                    onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-helix-text-muted uppercase tracking-widest">BMI</label>
                  <input 
                    type="number" 
                    className="w-full bg-black/20 border border-helix-border rounded-xl p-4 outline-none focus:border-helix-accent"
                    value={profile.bmi}
                    onChange={(e) => setProfile({...profile, bmi: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-helix-text-muted uppercase tracking-widest">Regional Outbreak Risk ({regionRisk}%)</label>
                <input 
                  type="range" 
                  className="w-full h-1.5 bg-helix-border rounded-lg appearance-none cursor-pointer accent-helix-accent"
                  min="0" max="100"
                  value={regionRisk}
                  onChange={(e) => setRegionRisk(parseInt(e.target.value))}
                />
              </div>

              <button 
                onClick={calculatePremium}
                className="w-full py-4 bg-helix-accent text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {loading ? "Calculating..." : "Update Quote"}
              </button>
            </div>

            {premiumData && (
              <div className="mt-10 p-8 bg-black/40 border border-white/5 rounded-[2rem] animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold text-helix-text-muted uppercase">Annual Premium</span>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${
                    premiumData.risk_tier === 'Standard' ? 'bg-helix-success/20 text-helix-success' : 
                    premiumData.risk_tier === 'Elevated' ? 'bg-helix-warning/20 text-helix-warning' : 
                    'bg-helix-danger/20 text-helix-danger'
                  }`}>
                    {premiumData.risk_tier} Risk
                  </span>
                </div>
                <p className="text-5xl font-black text-helix-accent mb-8">₹{premiumData.total_premium.toLocaleString()}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-helix-text-muted">Base Premium</span>
                    <span className="font-mono">₹{premiumData.base_premium}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-helix-text-muted">Risk Loadings (Age/BMI/Health)</span>
                    <span className="font-mono text-helix-danger">+₹{premiumData.age_surcharge + premiumData.bmi_surcharge + premiumData.disease_loading}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-helix-text-muted">Area Surcharge (Outbreak Risk)</span>
                    <span className="font-mono text-helix-warning">+₹{premiumData.area_surcharge}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Insurer Dashboard */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-helix-surface border border-helix-border rounded-[3rem] p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold">Actuarial Portfolio Exposure</h2>
              <div className="flex gap-2">
                <span className="bg-helix-danger/20 text-helix-danger px-3 py-1 rounded-lg text-[10px] font-bold">Catastrophe Trigger Active</span>
              </div>
            </div>

            <div className="h-64 mb-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exposureData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#0A0F1E', border: '1px solid #1F2937', borderRadius: '12px'}}
                    itemStyle={{color: '#fff'}}
                  />
                  <Bar dataKey="claims" radius={[6, 6, 0, 0]}>
                    {exposureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.claims > 10 ? '#EF4444' : '#00D4FF'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-black/40 border border-white/5 rounded-3xl">
                <h4 className="text-[10px] font-black text-helix-text-muted uppercase mb-4">Reinsurance Recommendation</h4>
                <p className="text-sm font-medium mb-4">Activate Excess of Loss (XoL) treaty for Western regions due to predicted surge.</p>
                <button className="text-[10px] font-bold text-helix-accent uppercase tracking-widest">Execute Strategy →</button>
              </div>
              <div className="p-6 bg-black/40 border border-white/5 rounded-3xl">
                <h4 className="text-[10px] font-black text-helix-text-muted uppercase mb-4">Outbreak Liability (Predicted)</h4>
                <p className="text-3xl font-black">₹4.2 Cr</p>
                <p className="text-[10px] text-helix-danger font-bold mt-1">↑ 14% vs Previous Quarter</p>
              </div>
            </div>
          </div>

          <div className="bg-helix-accent/5 border border-helix-accent/20 rounded-[2.5rem] p-8 flex items-center justify-between">
            <div className="max-w-md">
              <h3 className="text-lg font-bold mb-2">Dynamic Risk Adjustments</h3>
              <p className="text-xs text-helix-text-muted">Premiums are now dynamically adjusting every 24 hours based on live epidemiological surveillance data from the central Helix engine.</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-helix-accent">LAST SYNC</p>
              <p className="text-xl font-black">JUST NOW</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
