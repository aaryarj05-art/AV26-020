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
  Area,
  ComposedChart
} from 'recharts';
import WhyThisPrediction from './WhyThisPrediction';

interface PredictionChartProps {
  disease: string;
  region: string;
}

export default function PredictionChart({ disease, region }: PredictionChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState('ensemble');
  const [metrics, setMetrics] = useState<any>(null);
  const [currentVal, setCurrentVal] = useState(0);

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        const histRes = await fetch(`http://localhost:8000/api/data/outbreaks?disease=${disease}&region=${region}`);
        const histData = await histRes.json();
        
        const predRes = await fetch(`http://localhost:8000/api/predictions/outbreak?disease=${disease}&region=${region}&model=${model}&steps=12`);
        const predData = await predRes.json();
        
        const recentHist = histData.slice(-12).map((d: any) => ({
          date: new Date(d.date).toLocaleDateString(),
          actual: d.cases,
          type: 'historical'
        }));
        
        const lastDate = new Date(histData[histData.length - 1].date);
        const forecast = predData.forecast.map((val: number, i: number) => {
          const d = new Date(lastDate);
          d.setDate(d.getDate() + (i + 1) * 7);
          return {
            date: d.toLocaleDateString(),
            forecast: Math.round(val),
            lower: Math.round(predData.lower_bound[i]),
            upper: Math.round(predData.upper_bound[i]),
            type: 'forecast'
          };
        });
        
        setData([...recentHist, ...forecast]);
        setMetrics(predData.arima_metrics || predData.metrics);
        setCurrentVal(predData.forecast[0]);
      } catch (err) {
        console.error("Failed to load predictions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [disease, region, model]);

  if (loading) return <div className="h-64 flex items-center justify-center text-helix-text-muted">Calculating forecasts...</div>;

  return (
    <div className="bg-helix-surface border border-helix-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-helix-text">Outbreak Forecast</h3>
          <p className="text-xs text-helix-text-muted">12-week predictive trajectory</p>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={model} 
            onChange={(e) => setModel(e.target.value)}
            className="bg-helix-bg border border-helix-border text-xs text-helix-text rounded-lg px-2 py-1 outline-none focus:border-helix-accent"
          >
            <option value="ensemble">Ensemble Model</option>
            <option value="arima">ARIMA</option>
            <option value="prophet">Prophet</option>
          </select>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              stroke="#9CA3AF" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => val.toLocaleString()}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '8px' }}
              itemStyle={{ fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
            
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="#00D4FF"
              fillOpacity={0.1}
              legendType="none"
              tooltipType="none"
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="#0A0F1E"
              fillOpacity={1}
              legendType="none"
              tooltipType="none"
            />
            
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#FFFFFF" 
              strokeWidth={2} 
              dot={false}
              name="Historical"
            />
            
            <Line 
              type="monotone" 
              dataKey="forecast" 
              stroke="#00D4FF" 
              strokeWidth={2} 
              strokeDasharray="5 5" 
              dot={{ r: 3, fill: '#00D4FF' }}
              name="Forecast"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <WhyThisPrediction 
        type="outbreak" 
        disease={disease} 
        region={region} 
        predictionValue={currentVal}
      />

      {metrics && (
        <div className="mt-4 flex items-center gap-4">
          <div className="px-3 py-1 rounded-full bg-helix-accent/10 border border-helix-accent/20">
            <span className="text-[10px] text-helix-accent font-medium uppercase tracking-widest">
              RMSE: {metrics.rmse.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] text-helix-text-muted italic">
            Models trained on Phase 2 synthetic historical data.
          </p>
        </div>
      )}
    </div>
  );
}
