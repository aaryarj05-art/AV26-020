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
  ReferenceDot
} from 'recharts';

export default function SymptomTrends() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Synthetic trend data for Phase 6
    // In real app, fetch from /api/symptoms/summary
    const generateTrends = () => {
      const trends = [];
      const now = new Date();
      for (let i = 30; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        trends.push({
          date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          fever: Math.floor(Math.random() * 20) + 10,
          cough: Math.floor(Math.random() * 15) + 5,
          diarrhea: Math.floor(Math.random() * 10) + 2,
          isSpike: i === 5 // Mock spike 5 days ago
        });
      }
      setData(trends);
      setLoading(false);
    };
    generateTrends();
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center text-helix-text-muted">Analyzing trends...</div>;

  return (
    <div className="bg-helix-surface border border-helix-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-helix-text">Symptom Trends</h3>
          <p className="text-xs text-helix-text-muted">Real-time crowdsourced report volume</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              interval={6}
            />
            <YAxis 
              stroke="#9CA3AF" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '8px' }}
              itemStyle={{ fontSize: '11px' }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
            
            <Line 
              type="monotone" 
              dataKey="fever" 
              stroke="#EF4444" 
              strokeWidth={2} 
              dot={false}
              name="Fever"
            />
            <Line 
              type="monotone" 
              dataKey="cough" 
              stroke="#F59E0B" 
              strokeWidth={2} 
              dot={false}
              name="Cough"
            />
            <Line 
              type="monotone" 
              dataKey="diarrhea" 
              stroke="#00D4FF" 
              strokeWidth={2} 
              dot={false}
              name="Diarrhea"
            />

            {/* Spike Indicator */}
            {data.map((entry, index) => 
              entry.isSpike ? (
                <ReferenceDot 
                  key={index}
                  x={entry.date} 
                  y={entry.fever} 
                  r={5} 
                  fill="#EF4444" 
                  stroke="#FFFFFF" 
                  strokeWidth={2}
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-helix-danger animate-pulse" />
        <span className="text-[10px] text-helix-danger font-bold uppercase tracking-widest">
          Active Spike Detected: Fever (Z-Score 2.4)
        </span>
      </div>
    </div>
  );
}
