import React from 'react';
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
} from 'recharts';

import PredictionChart from '../components/PredictionChart';
import ModelMetricsCard from '../components/ModelMetricsCard';
import EnvironmentalPanel from '../components/EnvironmentalPanel';
import SymptomTrends from '../components/SymptomTrends';
import RiskSummaryCard from '../components/RiskSummaryCard';
import WearableWidget from '../components/WearableWidget';

const fetchDashboardSummary = async () => {
  const { data } = await axios.get('http://localhost:8000/api/dashboard/summary');
  return data;
};

const KPICard = ({ title, value, icon, subtext, color }: any) => (
  <div className="bg-helix-surface border border-helix-border rounded-2xl p-6 transition-all hover:border-helix-accent/30 group">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-10 h-10 rounded-xl bg-helix-bg flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${color}`}>Live</span>
    </div>
    <h3 className="text-sm text-helix-text-muted mb-1">{title}</h3>
    <div className="text-3xl font-bold text-helix-text mb-1 tracking-tight">{value}</div>
    <p className="text-[10px] text-helix-text-muted italic">{subtext}</p>
  </div>
);

export default function Dashboard() {
  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: fetchDashboardSummary,
    refetchInterval: 30000,
  });

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-helix-surface rounded-2xl border border-helix-border" />)}
      <div className="md:col-span-2 h-96 bg-helix-surface rounded-2xl" />
      <div className="md:col-span-2 h-96 bg-helix-surface rounded-2xl" />
    </div>
  );

  if (isError) return <div className="text-helix-danger p-8 bg-helix-danger/10 rounded-2xl border border-helix-danger/20">Critical: Failed to sync with central intelligence.</div>;

  const riskRegions = summary.high_risk_regions.join(", ");
  
  const trendData = [
    { name: 'Week 1', Dengue: 400, Malaria: 240, Influenza: 500 },
    { name: 'Week 2', Dengue: 300, Malaria: 139, Influenza: 480 },
    { name: 'Week 3', Dengue: 200, Malaria: 980, Influenza: 390 },
    { name: 'Week 4', Dengue: 278, Malaria: 390, Influenza: 430 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-helix-text mb-1">Intelligence <span className="text-helix-accent">Core</span></h1>
          <p className="text-helix-text-muted text-sm italic">Last synchronized: {new Date(summary.last_updated).toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-helix-accent/5 border border-helix-accent/20">
          <div className="w-2 h-2 rounded-full bg-helix-accent animate-ping" />
          <span className="text-[10px] font-bold text-helix-accent uppercase tracking-widest">30s Auto-Sync Active</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Active Cases" 
          value={summary.total_active_cases.toLocaleString()} 
          icon="🦠" 
          subtext="Aggregate count across all tracked pathogens"
          color="text-helix-danger"
        />
        <KPICard 
          title="High Risk Zones" 
          value={summary.high_risk_regions.length} 
          icon="🚩" 
          subtext={riskRegions}
          color="text-helix-warning"
        />
        <KPICard 
          title="Active Alerts" 
          value={summary.alerts_today} 
          icon="🔔" 
          subtext="Symptom spikes detected in the last 24h"
          color="text-helix-danger"
        />
        <KPICard 
          title="Prediction Accuracy" 
          value={`${summary.prediction_accuracy}%`} 
          icon="🎯" 
          subtext="Mean accuracy across ARIMA/Prophet/LSTM"
          color="text-helix-success"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-helix-surface border border-helix-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-helix-text mb-6">Aggregate Pathogen Trends</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorDengue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0D1421', border: '1px solid #1F2937', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="Dengue" stroke="#00D4FF" fillOpacity={1} fill="url(#colorDengue)" />
                  <Area type="monotone" dataKey="Malaria" stroke="#EF4444" fill="transparent" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SymptomTrends />
            <ModelMetricsCard metrics={{
               arima: { rmse: 42.5, mae: 31.2, lastTrained: '2026-05-14' },
               prophet: { rmse: 38.2, mae: 28.5, lastTrained: '2026-05-14' },
               lstm: { rmse: 35.1, mae: 25.8, lastTrained: '2026-05-14' }
            }} />
          </div>

          <PredictionChart disease="Dengue" region="Maharashtra" />
        </div>

        <div className="space-y-8">
          <RiskSummaryCard />
          <WearableWidget />
          
          <div className="bg-helix-surface border border-helix-border rounded-2xl p-6">
            <h3 className="text-sm font-bold text-helix-text-muted uppercase tracking-widest mb-6">Regional Risk Matrix</h3>
            <div className="space-y-4">
              {Object.entries(summary.region_risk_matrix).map(([region, risks]: any) => (
                <div key={region} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-helix-text uppercase tracking-widest">
                    <span>{region}</span>
                    <span className="text-helix-accent">Avg: {Math.floor(Object.values(risks).reduce((a:any,b:any)=>a+b,0)/5)}%</span>
                  </div>
                  <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-helix-bg">
                    {Object.entries(risks).map(([disease, score]: any) => (
                      <div 
                        key={disease}
                        className="flex-1 transition-all hover:brightness-125 cursor-help"
                        title={`${disease}: ${score}%`}
                        style={{ 
                          backgroundColor: score > 70 ? '#EF4444' : score > 40 ? '#F59E0B' : '#10B981',
                          opacity: score/100 + 0.2
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <EnvironmentalPanel disease="Dengue" region="Maharashtra" />

          <div className="bg-helix-surface border border-helix-border rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-helix-accent/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500" />
            <h3 className="text-sm font-bold text-helix-text mb-2 uppercase tracking-widest">Helix Protocol</h3>
            <p className="text-xs text-helix-text-muted leading-relaxed mb-4">
               Autonomous surveillance active. Multi-modal synthesis identifying 2 potential anomalies in the Mumbai-Pune corridor.
            </p>
            <button className="text-[10px] font-bold text-helix-accent uppercase tracking-widest border-b border-helix-accent">Execute Risk Mitigation</button>
          </div>
        </div>
      </div>
    </div>
  );
}
