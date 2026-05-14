import React, { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  humidity: number;
  rainfall: number;
  aqi: number;
}

interface CorrelationData {
  [variable: string]: {
    [lag: string]: number;
  };
}

interface EnvironmentalPanelProps {
  disease: string;
  region: string;
}

export default function EnvironmentalPanel({ disease, region }: EnvironmentalPanelProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [correlations, setCorrelations] = useState<CorrelationData | null>(null);
  const [riskMultiplier, setRiskMultiplier] = useState<number>(1.0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnvData = async () => {
      setLoading(true);
      try {
        const [wRes, cRes, rRes] = await Promise.all([
          fetch(`http://localhost:8000/api/environment/weather?region=${region}`),
          fetch(`http://localhost:8000/api/environment/correlations?disease=${disease}&region=${region}`),
          fetch(`http://localhost:8000/api/environment/risk-multiplier?disease=${disease}&region=${region}`)
        ]);

        if (wRes.ok) setWeather(await wRes.json());
        if (cRes.ok) setCorrelations(await cRes.json());
        if (rRes.ok) setRiskMultiplier(await rRes.json());
      } catch (err) {
        console.error("Failed to fetch environmental data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnvData();
  }, [disease, region]);

  if (loading) return <div className="text-helix-text-muted text-xs p-4">Syncing environmental layers...</div>;

  const weatherVars = ['temperature', 'humidity', 'rainfall', 'aqi'];
  const lags = ['lag_0', 'lag_1', 'lag_2', 'lag_3', 'lag_4'];

  const getHeatmapColor = (val: number) => {
    const abs = Math.abs(val);
    if (abs < 0.2) return 'bg-white/5';
    if (abs < 0.4) return val > 0 ? 'bg-helix-success/20' : 'bg-helix-danger/20';
    if (abs < 0.6) return val > 0 ? 'bg-helix-success/40' : 'bg-helix-danger/40';
    return val > 0 ? 'bg-helix-success/60' : 'bg-helix-danger/60';
  };

  return (
    <div className="bg-helix-surface border border-helix-border rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-helix-text">Environmental Drivers</h3>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
          riskMultiplier > 1.2 ? 'bg-helix-danger/10 text-helix-danger border border-helix-danger/20' : 
          riskMultiplier > 1.0 ? 'bg-helix-warning/10 text-helix-warning border border-helix-warning/20' : 
          'bg-helix-success/10 text-helix-success border border-helix-success/20'
        }`}>
          Risk Multiplier: {riskMultiplier}x
        </div>
      </div>

      {/* Weather Widget */}
      {weather && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-helix-bg p-3 rounded-xl border border-helix-border flex items-center justify-between">
            <div className="text-xs text-helix-text-muted uppercase">Temp</div>
            <div className="text-sm font-bold text-helix-text">{weather.temp}°C</div>
          </div>
          <div className="bg-helix-bg p-3 rounded-xl border border-helix-border flex items-center justify-between">
            <div className="text-xs text-helix-text-muted uppercase">Rain</div>
            <div className="text-sm font-bold text-helix-text">{weather.rainfall}mm</div>
          </div>
          <div className="bg-helix-bg p-3 rounded-xl border border-helix-border flex items-center justify-between">
            <div className="text-xs text-helix-text-muted uppercase">Humidity</div>
            <div className="text-sm font-bold text-helix-text">{weather.humidity}%</div>
          </div>
          <div className="bg-helix-bg p-3 rounded-xl border border-helix-border flex items-center justify-between">
            <div className="text-xs text-helix-text-muted uppercase">AQI</div>
            <div className="text-sm font-bold text-helix-text">{weather.aqi}</div>
          </div>
        </div>
      )}

      {/* Correlation Heatmap */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] font-bold text-helix-text-muted uppercase tracking-widest">
            Cross-Correlation Matrix (Lags 0-4w)
          </h4>
        </div>
        
        <div className="space-y-1">
          {weatherVars.map(v => (
            <div key={v} className="flex gap-1 items-center">
              <div className="w-20 text-[9px] text-helix-text-muted uppercase truncate">{v}</div>
              <div className="flex-1 flex gap-1">
                {lags.map(l => {
                  const val = correlations?.[v]?.[l] || 0;
                  return (
                    <div 
                      key={l}
                      className={`flex-1 h-6 rounded-sm ${getHeatmapColor(val)} flex items-center justify-center group relative`}
                    >
                      <span className="text-[8px] text-white/40 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        {val}
                      </span>
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-1 hidden group-hover:block bg-helix-surface border border-helix-border px-2 py-1 rounded text-[8px] z-50 whitespace-nowrap">
                        {v} @ {l}: {val}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-1 mt-2 pl-20">
          {lags.map(l => (
            <div key={l} className="flex-1 text-center text-[8px] text-helix-text-muted uppercase">{l.replace('lag_', 'w')}</div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-helix-text-muted italic border-t border-helix-border/50 pt-4">
        *Correlations indicate the strength of weather variables as leading indicators for {disease} outbreaks.
      </p>
    </div>
  );
}
