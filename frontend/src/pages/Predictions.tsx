import { useState } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar
} from 'recharts';

const REGIONS = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Kerala'];
const DISEASES = ['Dengue', 'Malaria', 'Cholera', 'Influenza'];
const MODELS = ['Ensemble (Best)', 'ARIMA', 'Prophet', 'LSTM'];

// Recharts Global Defaults
const chartConfig = {
  grid: <CartesianGrid strokeDasharray="3 3" stroke="#1E2D40" vertical={false} />,
  xAxis: <XAxis tick={{ fill: '#8A9BB0', fontSize: 11 }} axisLine={false} tickLine={false} />,
  yAxis: <YAxis tick={{ fill: '#8A9BB0', fontSize: 11 }} axisLine={false} tickLine={false} />,
  tooltip: (
    <Tooltip
      contentStyle={{
        backgroundColor: '#111827',
        border: '1px solid #1E2D40',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#F0F4F8'
      }}
      cursor={{ stroke: '#1E2D40' }}
    />
  )
};

export default function Predictions() {
  const [region, setRegion] = useState('Maharashtra');
  const [disease, setDisease] = useState('Dengue');
  const [model, setModel] = useState('Ensemble (Best)');

  // Mock data for forecast
  const forecastData = [
    { date: '04/15', historical: 400 },
    { date: '04/20', historical: 450 },
    { date: '04/25', historical: 380 },
    { date: '04/30', historical: 520 },
    { date: '05/05', historical: 480 },
    { date: '05/10', historical: 600 },
    { date: '05/15', historical: 580, forecast: 580, confidenceUpper: 580, confidenceLower: 580 },
    { date: '05/20', forecast: 620, confidenceUpper: 680, confidenceLower: 560 },
    { date: '05/25', forecast: 700, confidenceUpper: 790, confidenceLower: 610 },
    { date: '05/30', forecast: 650, confidenceUpper: 760, confidenceLower: 540 },
    { date: '06/05', forecast: 580, confidenceUpper: 720, confidenceLower: 440 },
  ];

  const featureImportance = [
    { name: 'Humidity', value: 85 },
    { name: 'Symptom Spikes', value: 72 },
    { name: 'Rainfall', value: 64 },
    { name: 'Temperature', value: 45 },
    { name: 'Mobility', value: 30 },
  ];

  const modelPerformance = [
    { name: 'Ensemble', rmse: 12.4, status: '#10B981', active: true },
    { name: 'LSTM', rmse: 14.8, status: '#10B981', active: false },
    { name: 'Prophet', rmse: 21.2, status: '#F59E0B', active: false },
    { name: 'ARIMA', rmse: 28.5, status: '#EF4444', active: false },
  ];

  const seasonalData = [
    { month: 'Jan', risk: 20 }, { month: 'Feb', risk: 15 }, { month: 'Mar', risk: 10 },
    { month: 'Apr', risk: 30 }, { month: 'May', risk: 60 }, { month: 'Jun', risk: 85 },
    { month: 'Jul', risk: 95 }, { month: 'Aug', risk: 80 }, { month: 'Sep', risk: 50 },
    { month: 'Oct', risk: 30 }, { month: 'Nov', risk: 20 }, { month: 'Dec', risk: 15 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* TOP CONTROLS */}
      <div className="flex flex-wrap gap-4 bg-[#111827] border border-[#1E2D40] rounded-2xl p-4">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-[#8A9BB0] uppercase tracking-wider">Region</label>
          <select 
            value={region} 
            onChange={(e) => setRegion(e.target.value)}
            className="w-48 bg-[#0C1220] border border-[#1E2D40] rounded-lg text-[13px] text-[#F0F4F8] h-9 px-2 focus:border-[#3B82F6] outline-none"
          >
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-[#8A9BB0] uppercase tracking-wider">Disease</label>
          <select 
            value={disease} 
            onChange={(e) => setDisease(e.target.value)}
            className="w-48 bg-[#0C1220] border border-[#1E2D40] rounded-lg text-[13px] text-[#F0F4F8] h-9 px-2 focus:border-[#3B82F6] outline-none"
          >
            {DISEASES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-[#8A9BB0] uppercase tracking-wider">Model</label>
          <select 
            value={model} 
            onChange={(e) => setModel(e.target.value)}
            className="w-48 bg-[#0C1220] border border-[#1E2D40] rounded-lg text-[13px] text-[#F0F4F8] h-9 px-2 focus:border-[#3B82F6] outline-none"
          >
            {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#111827] border border-[#1E2D40] rounded-2xl p-5">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#8A9BB0] mb-6">OUTBREAK FORECAST</div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={forecastData}>
                  {chartConfig.grid}
                  {chartConfig.xAxis}
                  {chartConfig.yAxis}
                  {chartConfig.tooltip}
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="confidenceUpper" 
                    stroke="none" 
                    fill="#3B82F6" 
                    fillOpacity={0.1} 
                    name="Confidence Interval"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="confidenceLower" 
                    stroke="none" 
                    fill="#3B82F6" 
                    fillOpacity={0.1} 
                    name="Confidence Interval"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="historical" 
                    stroke="#F0F4F8" 
                    strokeWidth={2} 
                    dot={{ r: 3 }} 
                    name="Historical"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="#3B82F6" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    dot={{ r: 3, fill: '#3B82F6' }} 
                    name="Forecast"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1E2D40] rounded-2xl p-5">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#8A9BB0] mb-6">PREDICTION EXPLANATION</div>
            <div className="space-y-4">
              {featureImportance.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-32 text-[12px] text-[#8A9BB0] truncate">{item.name}</div>
                  <div className="flex-1 h-2 bg-[#1E2D40] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#3B82F6]" 
                      style={{ width: `${item.value}%` }} 
                    />
                  </div>
                  <div className="w-10 text-[12px] font-mono text-[#F0F4F8] text-right">{item.value}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#111827] border border-[#1E2D40] rounded-2xl p-5">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#8A9BB0] mb-6">MODEL PERFORMANCE</div>
            <div className="space-y-2">
              {modelPerformance.map((m, i) => (
                <div 
                  key={i} 
                  className={`flex items-center justify-between p-3 rounded-lg border border-transparent ${
                    m.active ? 'border-[#3B82F6] bg-[#3B82F6]/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.status }} />
                    <span className="text-[14px] font-medium text-[#F0F4F8]">{m.name}</span>
                  </div>
                  <div className="text-[13px] font-mono text-[#8A9BB0]">RMSE: <span className="text-[#F0F4F8]">{m.rmse}</span></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1E2D40] rounded-2xl p-5">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#8A9BB0] mb-6">SEASONAL RISK PATTERN</div>
            <div className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={seasonalData}>
                  <Bar dataKey="risk" fill="#3B82F6/40" radius={[2, 2, 0, 0]} />
                  <XAxis dataKey="month" hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E2D40', fontSize: '10px' }}
                    cursor={{ fill: 'transparent' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-2 px-1">
              <span className="text-[9px] text-[#4A5568]">JAN</span>
              <span className="text-[9px] text-[#4A5568]">JUN</span>
              <span className="text-[9px] text-[#4A5568]">DEC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
