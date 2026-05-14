import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

import KPICardEnhanced from '../components/KPICardEnhanced';
import PredictionChart from '../components/PredictionChart';
import EnvironmentalPanel from '../components/EnvironmentalPanel';
import SymptomTrends from '../components/SymptomTrends';
import WearableWidget from '../components/WearableWidget';
import ModelIntelligenceWidget from '../components/ModelIntelligenceWidget';

const fetchDashboardSummary = async () => {
  const { data } = await axios.get('http://localhost:8000/api/dashboard/summary');
  return data;
};

const fetchEnhancedKPIs = async () => {
  const { data } = await axios.get('http://localhost:8000/api/kpi/enhanced');
  return data;
};

const exportDashboard = async () => {
  const response = await axios.get('http://localhost:8000/api/dashboard/export', {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `helix_dashboard_export_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Cases');
  
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: fetchDashboardSummary,
    refetchInterval: 30000,
  });

  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ['enhancedKPIs'],
    queryFn: fetchEnhancedKPIs,
    refetchInterval: 30000,
  });

  const isLoading = summaryLoading || kpiLoading;

  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-44 bg-helix-surface rounded-2xl border border-helix-border" />)}
      </div>
      <div className="h-96 bg-helix-surface rounded-2xl" />
    </div>
  );

  const trendData = [
    { name: 'Week 1', Dengue: 400, Malaria: 240, Influenza: 500, Covid: 300 },
    { name: 'Week 2', Dengue: 300, Malaria: 139, Influenza: 480, Covid: 450 },
    { name: 'Week 3', Dengue: 200, Malaria: 980, Influenza: 390, Covid: 410 },
    { name: 'Week 4', Dengue: 278, Malaria: 390, Influenza: 430, Covid: 380 },
  ];

  const resourceDemand = [
    { region: 'Maharashtra', beds: '+120 beds', meds: '5,000 ORS', personnel: '15 nurses', action: 'Pre-position' },
    { region: 'Delhi', beds: '+85 beds', meds: '3,200 vaccines', personnel: '10 nurses', action: 'Monitor' },
    { region: 'Karnataka', beds: '+40 beds', meds: '2,000 kits', personnel: '5 medics', action: 'Standby' },
  ];

  const probabilities = [
    { disease: 'Dengue', score: 78, level: 'HIGH PROBABILITY', color: '#EF4444' },
    { disease: 'Malaria', score: 52, level: 'MODERATE', color: '#F59E0B' },
    { disease: 'Cholera', score: 24, level: 'LOW', color: '#10B981' },
    { disease: 'Influenza', score: 65, level: 'HIGH', color: '#F59E0B' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-helix-text mb-1">Intelligence <span className="text-helix-accent">Core</span></h1>
          <p className="text-helix-text-muted text-sm italic">Real-time health surveillance & predictive analytics</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={exportDashboard}
            className="px-4 py-2 rounded-xl bg-helix-surface border border-helix-border text-helix-text text-sm font-semibold hover:bg-helix-surface-light transition-colors flex items-center gap-2"
          >
            <span>📥</span> Export Dashboard
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-helix-accent/5 border border-helix-accent/20">
            <div className="w-2 h-2 rounded-full bg-helix-accent animate-ping" />
            <span className="text-[10px] font-bold text-helix-accent uppercase tracking-widest">Live Sync</span>
          </div>
        </div>
      </div>

      {/* Hero KPI Row (6 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiData?.kpis.map((kpi: any) => (
          <KPICardEnhanced key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-helix-surface border border-helix-border rounded-3xl overflow-hidden">
            <div className="flex border-b border-helix-border">
              {['Cases', 'Predictions', 'Environmental', 'Symptoms'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-bold tracking-widest uppercase transition-all ${
                    activeTab === tab 
                      ? 'text-helix-accent border-b-2 border-helix-accent bg-helix-accent/5' 
                      : 'text-helix-text-muted hover:text-helix-text'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="p-6 h-96">
              <ResponsiveContainer width="100%" height="100%">
                {activeTab === 'Cases' ? (
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0D1421', border: '1px solid #1F2937', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="Dengue" stroke="#00D4FF" fillOpacity={1} fill="url(#colorValue)" />
                    <Area type="monotone" dataKey="Malaria" stroke="#EF4444" fill="transparent" strokeDasharray="5 5" />
                  </AreaChart>
                ) : activeTab === 'Predictions' ? (
                  <PredictionChart disease="Dengue" region="Maharashtra" />
                ) : activeTab === 'Environmental' ? (
                  <EnvironmentalPanel disease="Dengue" region="Maharashtra" />
                ) : (
                  <SymptomTrends />
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resource Planning Table */}
          <div className="bg-helix-surface border border-helix-border rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-helix-text">Predicted Resource Demand <span className="text-helix-accent">— Next 2 Weeks</span></h3>
              <button className="text-xs font-bold text-helix-accent uppercase tracking-widest hover:underline">Export as CSV</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-helix-text-muted uppercase tracking-widest border-b border-helix-border">
                    <th className="pb-4">Region</th>
                    <th className="pb-4">Beds Needed</th>
                    <th className="pb-4">Medicine Units</th>
                    <th className="pb-4">Personnel</th>
                    <th className="pb-4">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {resourceDemand.map((row, i) => (
                    <tr key={i} className="border-b border-helix-border/50 hover:bg-helix-surface-light/30 transition-colors">
                      <td className="py-4 font-bold text-helix-text">{row.region}</td>
                      <td className="py-4 text-helix-danger font-mono font-bold">{row.beds}</td>
                      <td className="py-4 text-helix-warning font-mono">{row.meds}</td>
                      <td className="py-4 text-helix-accent font-mono">{row.personnel}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                          row.action === 'Pre-position' ? 'bg-helix-danger/10 text-helix-danger' : 'bg-helix-warning/10 text-helix-warning'
                        }`}>
                          {row.action}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Probability & Vitals */}
        <div className="space-y-8">
          {/* Outbreak Probability Scores */}
          <div className="bg-helix-surface border border-helix-border rounded-3xl p-6">
            <h3 className="text-sm font-bold text-helix-text-muted uppercase tracking-widest mb-6">Outbreak Probability <span className="text-helix-text">— 30 Day Window</span></h3>
            <div className="space-y-6">
              {probabilities.map((p) => (
                <div key={p.disease} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-helix-text">{p.disease}</span>
                    <span className="text-[10px] font-black text-helix-text-muted tracking-tighter uppercase">
                      <span style={{ color: p.color }}>{p.level}</span> — {p.score}%
                    </span>
                  </div>
                  <div className="h-3 bg-helix-bg rounded-full overflow-hidden flex gap-0.5 p-0.5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div 
                        key={i}
                        className="flex-1 rounded-sm transition-all duration-1000"
                        style={{ 
                          backgroundColor: i < p.score / 10 ? p.color : '#1F2937',
                          opacity: i < p.score / 10 ? 0.4 + (i * 0.06) : 0.2
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <WearableWidget />
          <ModelIntelligenceWidget />
          
          <div className="bg-helix-accent/5 border border-helix-accent/20 rounded-3xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 text-3xl opacity-20">🧬</div>
             <h4 className="text-xs font-bold text-helix-accent uppercase tracking-widest mb-2">Platform Confidence</h4>
             <div className="text-4xl font-black text-helix-text mb-1">94.2%</div>
             <p className="text-[10px] text-helix-text-muted leading-relaxed">
               Based on convergence of 3 models and active environmental telemetry from 4 regions.
             </p>
          </div>

          {/* Impact Summary Widget */}
          <div className="bg-helix-surface border border-helix-border rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-4xl opacity-10 group-hover:opacity-20 transition-opacity">🌟</div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-helix-text uppercase tracking-widest">Impact Summary</h3>
              <Link to="/impact" className="text-xs font-bold text-helix-accent hover:underline flex items-center gap-1">
                Full Report <span>→</span>
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-helix-border/50 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">🛡️</span>
                  <span className="text-sm text-helix-text-muted">Lives Protected</span>
                </div>
                <span className="text-lg font-black text-white">1,847</span>
              </div>
              <div className="flex justify-between items-end border-b border-helix-border/50 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">📉</span>
                  <span className="text-sm text-helix-text-muted">Outbreak-Days Cut</span>
                </div>
                <span className="text-lg font-black text-white">340</span>
              </div>
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">💰</span>
                  <span className="text-sm text-helix-text-muted">Costs Saved</span>
                </div>
                <span className="text-lg font-black text-white">₹2.4 Cr</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
