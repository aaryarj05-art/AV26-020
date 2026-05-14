import React, { useState, useEffect } from 'react';
import PredictionChart from '../components/PredictionChart';
import ModelMetricsCard from '../components/ModelMetricsCard';
import { useOutbreakData } from '../hooks/useOutbreakData';

export default function Dashboard() {
  const [selectedDisease, setSelectedDisease] = useState('Dengue');
  const [selectedRegion, setSelectedRegion] = useState('Maharashtra');
  const [riskData, setRiskData] = useState<any>(null);
  
  const { data: outbreakData, loading: dataLoading } = useOutbreakData({ 
    disease: selectedDisease, 
    region: selectedRegion 
  });

  const [diseases, setDiseases] = useState<string[]>(['Dengue', 'Malaria', 'Cholera', 'Influenza', 'COVID-19']);
  const [regions, setRegions] = useState<string[]>(['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Kerala']);

  // Mock metrics for Phase 4 (would be fetched from /api/models/metrics)
  const [metrics, setMetrics] = useState({
    arima: { rmse: 42.5, mae: 31.2, lastTrained: '2026-05-14' },
    prophet: { rmse: 38.2, mae: 28.5, lastTrained: '2026-05-14' },
    lstm: { rmse: 35.1, mae: 25.8, lastTrained: '2026-05-14' }
  });

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/predictions/risk-score?disease=${selectedDisease}&region=${selectedRegion}`);
        const json = await res.json();
        setRiskData(json);
      } catch (err) {
        console.error("Failed to fetch risk score:", err);
      }
    };
    fetchRisk();
  }, [selectedDisease, selectedRegion]);

  const cards = [
    { 
      title: 'Active Outbreaks', 
      value: outbreakData.length > 0 ? outbreakData.slice(-1)[0].cases.toLocaleString() : '0', 
      icon: '🦠', 
      color: 'text-helix-danger' 
    },
    { 
      title: 'Risk Score', 
      value: riskData ? `${riskData.risk_score}%` : '—', 
      icon: '🛡️', 
      color: riskData?.risk_score > 70 ? 'text-helix-danger' : 'text-helix-accent' 
    },
    { 
      title: 'Trend', 
      value: riskData ? riskData.trend.toUpperCase() : '—', 
      icon: '📈', 
      color: riskData?.trend === 'rising' ? 'text-helix-danger' : 'text-helix-success' 
    },
    { 
      title: 'Alerts Today', 
      value: '2', 
      icon: '🔔', 
      color: 'text-helix-warning' 
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-helix-text mb-1">Dashboard</h1>
          <p className="text-helix-text-muted">Predictive public health intelligence</p>
        </div>
        
        <div className="flex items-center gap-3 bg-helix-surface p-1.5 rounded-2xl border border-helix-border">
          <select 
            value={selectedDisease}
            onChange={(e) => setSelectedDisease(e.target.value)}
            className="bg-transparent text-sm text-helix-text px-3 py-1.5 outline-none cursor-pointer"
          >
            {diseases.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="w-px h-4 bg-helix-border" />
          <select 
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-transparent text-sm text-helix-text px-3 py-1.5 outline-none cursor-pointer"
          >
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-helix-surface border border-helix-border rounded-2xl p-6 hover:border-helix-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-helix-accent/5"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{card.icon}</span>
              <span className={`text-[10px] font-bold ${card.color} uppercase tracking-widest`}>Live</span>
            </div>
            <p className="text-3xl font-bold text-helix-text mb-1">{card.value}</p>
            <p className="text-sm text-helix-text-muted">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Main Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PredictionChart disease={selectedDisease} region={selectedRegion} />
          <ModelMetricsCard metrics={metrics} />
        </div>
        
        <div className="space-y-6">
          <div className="bg-helix-surface border border-helix-border rounded-2xl p-6 flex flex-col items-center justify-center text-center h-80">
            <div className="w-16 h-16 rounded-full bg-helix-accent/10 flex items-center justify-center mb-4">
               <span className="text-3xl">🗺️</span>
            </div>
            <h3 className="text-lg font-semibold text-helix-text mb-2">Geographic Heatmap</h3>
            <p className="text-sm text-helix-text-muted max-w-[200px]">
              Spatial risk distribution and migration pattern analysis.
            </p>
            <div className="mt-6 px-4 py-1.5 rounded-full border border-helix-border bg-helix-bg text-[10px] text-helix-text-muted uppercase tracking-widest">
              Coming in Phase 5
            </div>
          </div>
          
          <div className="bg-helix-surface border border-helix-border rounded-2xl p-6">
            <h4 className="text-sm font-bold text-helix-text mb-4 uppercase tracking-widest">Recent Alerts</h4>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-helix-danger/5 border border-helix-danger/10">
                 <p className="text-xs font-bold text-helix-danger">Dengue Spike Detected</p>
                 <p className="text-[10px] text-helix-text-muted">Maharashtra • Projected +15% cases</p>
              </div>
              <div className="p-3 rounded-xl bg-helix-warning/5 border border-helix-warning/10">
                 <p className="text-xs font-bold text-helix-warning">Monsoon Season Warning</p>
                 <p className="text-[10px] text-helix-text-muted">Kerala • Rising humidity levels</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
