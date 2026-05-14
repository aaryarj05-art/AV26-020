import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function HospitalSignals() {
  const [region, setRegion] = useState("Maharashtra");
  const [occupancy, setOccupancy] = useState<any>(null);
  const [erVolume, setErVolume] = useState<any[]>([]);
  const [network, setNetwork] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [region]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [occRes, erRes, netRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/hospital/occupancy?region=${region}`),
        axios.get(`http://localhost:8000/api/hospital/er-volume?region=${region}`),
        axios.get(`http://localhost:8000/api/hospital/network?city=Mumbai`)
      ]);
      setOccupancy(occRes.data);
      setErVolume(erRes.data);
      setNetwork(netRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getOccupancyColor = (pct: number) => {
    if (pct > 90) return '#EF4444';
    if (pct > 80) return '#F59E0B';
    return '#10B981';
  };

  return (
    <div className="min-h-screen bg-helix-background p-8 pb-32 text-helix-text animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <span className="text-4xl">🏥</span>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Hospital <span className="text-helix-accent">Signals</span></h1>
            <p className="text-sm text-helix-text-muted">Real-time clinical capacity and surge intelligence</p>
          </div>
        </div>
        
        <select 
          className="bg-helix-surface border border-helix-border rounded-xl px-6 py-3 outline-none focus:border-helix-accent text-sm font-bold"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          {["Maharashtra", "Kerala", "Delhi", "Karnataka", "Tamil Nadu"].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {occupancy?.surge_alert && (
        <div className="bg-helix-danger/20 border-2 border-helix-danger text-white p-6 rounded-3xl mb-8 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-black uppercase tracking-widest text-sm">Critical Surge Detected</p>
              <p className="text-xs opacity-80">{region} hospital capacity has exceeded 90%. Activate inter-regional transfer protocols.</p>
            </div>
          </div>
          <button className="bg-white text-helix-danger px-6 py-2 rounded-xl text-xs font-black uppercase">Action Plan</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Occupancy Gauges */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-helix-surface border border-helix-border rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-8">Capacity Metrics</h2>
            
            <div className="space-y-10">
              {occupancy && (
                <>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-helix-text-muted uppercase tracking-widest">General Bed Occupancy</p>
                        <p className="text-3xl font-black">{occupancy.general_beds.occupancy_pct}%</p>
                      </div>
                      <p className="text-[10px] font-mono opacity-50">{occupancy.general_beds.occupied}/{occupancy.general_beds.total}</p>
                    </div>
                    <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ 
                          width: `${occupancy.general_beds.occupancy_pct}%`,
                          backgroundColor: getOccupancyColor(occupancy.general_beds.occupancy_pct)
                        }} 
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-helix-text-muted uppercase tracking-widest">ICU Bed Occupancy</p>
                        <p className="text-3xl font-black">{occupancy.icu_beds.occupancy_pct}%</p>
                      </div>
                      <p className="text-[10px] font-mono opacity-50">{occupancy.icu_beds.occupied}/{occupancy.icu_beds.total}</p>
                    </div>
                    <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ 
                          width: `${occupancy.icu_beds.occupancy_pct}%`,
                          backgroundColor: getOccupancyColor(occupancy.icu_beds.occupancy_pct)
                        }} 
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-helix-border">
              <h4 className="text-[10px] font-black text-helix-text-muted uppercase mb-4">Facility Status</h4>
              <div className="space-y-4">
                {network.map((h, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="font-medium">{h.name}</span>
                    <span className={`font-mono ${h.occupancy > 90 ? 'text-helix-danger' : 'text-helix-success'}`}>{h.occupancy}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ER Volume Trends */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-helix-surface border border-helix-border rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-10">ER Intake Analytics</h2>
            <div className="h-64 mb-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={erVolume}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#0A0F1E', border: '1px solid #1F2937', borderRadius: '12px'}}
                    itemStyle={{color: '#fff'}}
                  />
                  <Area type="monotone" dataKey="total_visits" stroke="#00D4FF" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-black/40 border border-white/5 rounded-3xl text-center">
                <p className="text-[10px] font-black text-helix-text-muted uppercase mb-2">Fever Intake</p>
                <p className="text-2xl font-black text-helix-warning">High</p>
                <p className="text-[10px] text-helix-text-muted mt-1">Leading Indicator (+3d)</p>
              </div>
              <div className="p-6 bg-black/40 border border-white/5 rounded-3xl text-center">
                <p className="text-[10px] font-black text-helix-text-muted uppercase mb-2">ER Volume Spike</p>
                <p className="text-2xl font-black text-helix-danger">+28%</p>
                <p className="text-[10px] text-helix-text-muted mt-1">Vs. Baseline</p>
              </div>
              <div className="p-6 bg-black/40 border border-white/5 rounded-3xl text-center">
                <p className="text-[10px] font-black text-helix-text-muted uppercase mb-2">Prediction Correlation</p>
                <p className="text-2xl font-black text-helix-success">0.94</p>
                <p className="text-[10px] text-helix-text-muted mt-1">High Confidence</p>
              </div>
            </div>
          </div>

          <div className="bg-helix-surface border border-helix-border rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-8">Chief Complaint Distribution</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={erVolume.slice(-7)}>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 8}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#0A0F1E', border: '1px solid #1F2937', borderRadius: '12px'}}
                    itemStyle={{color: '#fff'}}
                  />
                  <Bar dataKey="complaints.fever" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="complaints.respiratory" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="complaints.injury" stackId="a" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-helix-warning" />
                <span className="text-[10px] font-bold text-helix-text-muted uppercase">Fever</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-helix-danger" />
                <span className="text-[10px] font-bold text-helix-text-muted uppercase">Respiratory</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                <span className="text-[10px] font-bold text-helix-text-muted uppercase">Other</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
