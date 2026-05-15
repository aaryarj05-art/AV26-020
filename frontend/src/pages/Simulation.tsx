import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const DISEASE_PRESETS = ['Dengue', 'Malaria', 'Influenza', 'Cholera'];

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

export default function Simulation() {
  const [disease, setDisease] = useState("Dengue");
  const [model, setModel] = useState("SEIR");
  const [population, setPopulation] = useState(1000000);
  const [R0, setR0] = useState(3.5);
  const [duration, setDuration] = useState(180);
  const [interventions] = useState<any[]>([]);
  
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:8080/api/simulation/seir', {
        disease, population, R0, gamma: 0.14, days: duration, model, interventions
      });
      
      const formatted = res.data.days.map((day: number, i: number) => ({
        day,
        S: res.data.S[i],
        E: res.data.E[i],
        I: res.data.I[i],
        R: res.data.R[i]
      }));

      setSimulationData(formatted);
      setMetrics({
        peakInfected: res.data.peak_infected,
        peakDay: res.data.peak_day || 45, // Mock if not in data
        totalInfected: res.data.total_infected,
        herdImmunity: res.data.herd_immunity_threshold
      });
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    runSimulation();
  }, []);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT COLUMN: Controls */}
        <div className="lg:col-span-3">
          <div className="bg-[#111827] border border-[#1E2D40] rounded-2xl p-5 space-y-6">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#8A9BB0]">SIMULATION CONTROLS</div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] text-[#8A9BB0] uppercase">Disease Preset</label>
                <div className="flex flex-wrap gap-2">
                  {DISEASE_PRESETS.map(d => (
                    <button
                      key={d}
                      onClick={() => setDisease(d)}
                      className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
                        disease === d ? 'bg-[#3B82F6] text-white' : 'bg-[#0C1220] border border-[#1E2D40] text-[#8A9BB0]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-[#8A9BB0] uppercase">Model Type</label>
                <div className="flex bg-[#0C1220] border border-[#1E2D40] rounded-lg p-1">
                  {['SIR', 'SEIR'].map(m => (
                    <button
                      key={m}
                      onClick={() => setModel(m)}
                      className={`flex-1 py-1 rounded-md text-[12px] font-medium transition-colors ${
                        model === m ? 'bg-[#1A2332] text-[#F0F4F8]' : 'text-[#8A9BB0]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-[11px] text-[#8A9BB0] uppercase">Population</label>
                  <span className="text-[12px] font-mono text-[#F0F4F8]">{population.toLocaleString()}</span>
                </div>
                <input type="range" min="100000" max="10000000" step="100000" value={population} onChange={e => setPopulation(Number(e.target.value))} className="w-full accent-[#3B82F6]" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-[11px] text-[#8A9BB0] uppercase">R0 (Transmission)</label>
                  <span className="text-[12px] font-mono text-[#F0F4F8]">{R0}</span>
                </div>
                <input type="range" min="0.5" max="10" step="0.1" value={R0} onChange={e => setR0(Number(e.target.value))} className="w-full accent-[#3B82F6]" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-[11px] text-[#8A9BB0] uppercase">Duration (Days)</label>
                  <span className="text-[12px] font-mono text-[#F0F4F8]">{duration}</span>
                </div>
                <input type="range" min="30" max="365" step="30" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full accent-[#3B82F6]" />
              </div>
            </div>

            <button 
              onClick={runSimulation}
              disabled={isLoading}
              className="w-full h-10 bg-[#3B82F6] text-white rounded-lg text-[14px] font-semibold hover:bg-[#2563EB] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Running...' : 'Run Simulation'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Results */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#111827] border border-[#1E2D40] rounded-2xl p-5">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#8A9BB0] mb-6">SPREAD SIMULATION RESULTS</div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulationData}>
                  {chartConfig.grid}
                  {chartConfig.xAxis}
                  {chartConfig.yAxis}
                  {chartConfig.tooltip}
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="S" stroke="#3B82F6" strokeWidth={2} dot={false} name="Susceptible" />
                  {model === 'SEIR' && <Line type="monotone" dataKey="E" stroke="#F59E0B" strokeWidth={2} dot={false} name="Exposed" />}
                  <Line type="monotone" dataKey="I" stroke="#EF4444" strokeWidth={3} dot={false} name="Infected" />
                  <Line type="monotone" dataKey="R" stroke="#10B981" strokeWidth={2} dot={false} name="Recovered" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Stats Row */}
            <div className="mt-8 pt-6 border-t border-[#1E2D40] grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Peak Infected', value: metrics?.peakInfected?.toLocaleString() || '--' },
                { label: 'Peak Day', value: `Day ${metrics?.peakDay || '--'}` },
                { label: 'Total Infected', value: metrics?.totalInfected?.toLocaleString() || '--' },
                { label: 'Herd Immunity', value: `${metrics?.herdImmunity || '--'}%` },
              ].map((stat, i) => (
                <div key={i} className="text-center border-r border-[#1E2D40] last:border-0">
                  <div className="text-[10px] text-[#8A9BB0] uppercase tracking-wider mb-1">{stat.label}</div>
                  <div className="text-[18px] font-mono font-bold text-[#F0F4F8]">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
