import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { CheckCircle2 } from 'lucide-react';

const SYMPTOMS = [
  'Fever', 'Cough', 'Sore Throat', 'Runny Nose', 'Fatigue', 
  'Joint Pain', 'Rash', 'Nausea', 'Chills', 'Sweating', 
  'Headache', 'Diarrhea', 'Vomiting', 'Abdominal Cramps', 
  'Shortness of Breath', 'Loss of Taste', 'Loss of Smell', 
  'Body Ache', 'Dizziness', 'Loss of Appetite'
];

const REGIONS = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kochi'];

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

export default function SymptomReports() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [region, setRegion] = useState('Mumbai');
  const [severity, setSeverity] = useState(3);
  const [ageGroup, setAgeGroup] = useState('Adult');
  const [submitted, setSubmitted] = useState(false);

  const trendData = [
    { date: '05/01', Fever: 400, Cough: 240, GI: 100, Other: 150 },
    { date: '05/05', Fever: 300, Cough: 139, GI: 120, Other: 180 },
    { date: '05/10', Fever: 200, Cough: 980, GI: 150, Other: 200 },
    { date: '05/15', Fever: 278, Cough: 390, GI: 180, Other: 250 },
    { date: '05/20', Fever: 189, Cough: 480, GI: 200, Other: 300 },
    { date: '05/25', Fever: 239, Cough: 380, GI: 220, Other: 280 },
    { date: '05/30', Fever: 349, Cough: 430, GI: 240, Other: 260 },
  ];

  const regionalSummary = [
    { region: 'Mumbai', reports: 1240, top: 'Fever', spike: true },
    { region: 'Delhi', reports: 850, top: 'Cough', spike: true },
    { region: 'Bangalore', reports: 420, top: 'Fatigue', spike: false },
    { region: 'Chennai', reports: 310, top: 'Joint Pain', spike: false },
    { region: 'Kochi', reports: 150, top: 'Nausea', spike: false },
  ];

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedSymptoms([]);
    }, 3000);
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT COLUMN: Submit Report */}
        <div className="lg:col-span-4">
          <div className="bg-[#111827] border border-[#1E2D40] rounded-2xl p-5">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#8A9BB0] mb-6">SUBMIT SYMPTOM REPORT</div>
            
            {submitted ? (
              <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in">
                <CheckCircle2 size={48} className="text-[#10B981] mb-4" />
                <h3 className="text-[18px] font-semibold text-[#F0F4F8]">Report Submitted</h3>
                <p className="text-[14px] text-[#8A9BB0] mt-1">Data has been added to the regional cluster analysis.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#8A9BB0] uppercase tracking-wider">Region</label>
                  <select 
                    value={region} 
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-[#0C1220] border border-[#1E2D40] rounded-lg text-[13px] text-[#F0F4F8] h-9 px-2 outline-none focus:border-[#3B82F6]"
                  >
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-[#8A9BB0] uppercase tracking-wider">Symptoms</label>
                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {SYMPTOMS.map(s => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedSymptoms.includes(s)}
                          onChange={() => toggleSymptom(s)}
                          className="w-4 h-4 rounded border-[#1E2D40] bg-[#0C1220] checked:bg-[#3B82F6] outline-none"
                        />
                        <span className="text-[13px] text-[#8A9BB0] group-hover:text-[#F0F4F8] transition-colors">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-semibold text-[#8A9BB0] uppercase tracking-wider">Severity</label>
                    <span className="text-[12px] text-[#3B82F6] font-bold">{severity === 1 ? 'Mild' : severity === 5 ? 'Severe' : 'Moderate'}</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" 
                    value={severity}
                    onChange={(e) => setSeverity(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#1E2D40] rounded-full appearance-none cursor-pointer accent-[#3B82F6]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#8A9BB0] uppercase tracking-wider">Age Group</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Child', 'Adult', 'Senior'].map(age => (
                      <button
                        key={age}
                        type="button"
                        onClick={() => setAgeGroup(age)}
                        className={`h-9 rounded-lg text-[12px] font-medium transition-colors ${
                          ageGroup === age 
                            ? 'bg-[#3B82F6] text-white' 
                            : 'bg-[#0C1220] border border-[#1E2D40] text-[#8A9BB0] hover:text-[#F0F4F8]'
                        }`}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={selectedSymptoms.length === 0}
                  className="w-full h-10 bg-[#3B82F6] text-white rounded-lg text-[14px] font-semibold hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  Submit Report
                </button>
              </form>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Data */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#111827] border border-[#1E2D40] rounded-2xl p-5">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#8A9BB0] mb-6">SYMPTOM TRENDS — LAST 30 DAYS</div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  {chartConfig.grid}
                  {chartConfig.xAxis}
                  {chartConfig.yAxis}
                  {chartConfig.tooltip}
                  <Line type="monotone" dataKey="Fever" stroke="#EF4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Cough" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="GI" stroke="#F59E0B" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Other" stroke="#8A9BB0" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1E2D40] rounded-2xl p-5">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#8A9BB0] mb-6">REPORTS BY REGION — LAST 7 DAYS</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] text-[#4A5568] uppercase tracking-widest border-b border-[#1E2D40]">
                    <th className="pb-3 font-semibold">Region</th>
                    <th className="pb-3 font-semibold">Reports</th>
                    <th className="pb-3 font-semibold">Top Symptom</th>
                    <th className="pb-3 font-semibold text-right">Spike Alert</th>
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  {regionalSummary.map((row, i) => (
                    <tr key={i} className="border-b border-[#1E2D40] last:border-0 group hover:bg-[#1A2332]/40 transition-colors">
                      <td className="py-4 font-medium text-[#F0F4F8]">{row.region}</td>
                      <td className="py-4 font-mono text-[#F0F4F8]">{row.reports.toLocaleString()}</td>
                      <td className="py-4 text-[#8A9BB0]">{row.top}</td>
                      <td className="py-4 text-right">
                        {row.spike ? (
                          <span className="text-[#EF4444] font-bold">● SPIKE</span>
                        ) : (
                          <span className="text-[#10B981]">Stable</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
