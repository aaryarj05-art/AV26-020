import { useState } from 'react';
import { FileText, FileDown } from 'lucide-react';

const REGIONS = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Kerala'];
const DISEASES = ['Dengue', 'Malaria', 'Influenza', 'Cholera'];
const REPORT_TYPES = ['Regional Brief', 'National Summary', 'Alert Impact Analysis'];

export default function Reports() {
  const [region, setRegion] = useState('Maharashtra');
  const [disease, setDisease] = useState('Dengue');
  const [reportType, setReportType] = useState('Regional Brief');
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock recent reports
  const recentReports = [
    { name: 'Maharashtra_Dengue_Brief', date: '2026-05-15 08:00', type: 'Regional' },
    { name: 'Delhi_Influenza_Brief', date: '2026-05-14 14:30', type: 'Regional' },
    { name: 'National_Outbreak_Summary', date: '2026-05-14 09:00', type: 'National' },
    { name: 'Mumbai_Spike_Analysis', date: '2026-05-13 18:20', type: 'Alert' },
  ];

  // Mock resource planning data
  const resourceData = [
    { region: 'Mumbai', beds: 450, meds: '5k Units', status: 'Critical' },
    { region: 'Pune', beds: 120, meds: '2k Units', status: 'Warning' },
    { region: 'Nagpur', beds: 80, meds: '1k Units', status: 'Stable' },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT COLUMN: Generator */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#111827] border border-[#1E2D40] rounded-2xl p-5">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#8A9BB0] mb-6">GENERATE REPORT</div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] text-[#8A9BB0] uppercase">Region</label>
                <select 
                  value={region} 
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-[#0C1220] border border-[#1E2D40] rounded-lg text-[13px] text-[#F0F4F8] h-9 px-2 outline-none focus:border-[#3B82F6]"
                >
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-[#8A9BB0] uppercase">Disease Focal Point</label>
                <select 
                  value={disease} 
                  onChange={(e) => setDisease(e.target.value)}
                  className="w-full bg-[#0C1220] border border-[#1E2D40] rounded-lg text-[13px] text-[#F0F4F8] h-9 px-2 outline-none focus:border-[#3B82F6]"
                >
                  {DISEASES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-[#8A9BB0] uppercase">Report Type</label>
                <div className="space-y-2">
                  {REPORT_TYPES.map(type => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="reportType" 
                        value={type} 
                        checked={reportType === type}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-4 h-4 border-[#1E2D40] bg-[#0C1220] checked:bg-[#3B82F6] outline-none"
                      />
                      <span className={`text-[13px] transition-colors ${reportType === type ? 'text-[#F0F4F8]' : 'text-[#8A9BB0] group-hover:text-[#F0F4F8]'}`}>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full h-10 bg-[#3B82F6] text-white rounded-lg text-[14px] font-semibold hover:bg-[#2563EB] transition-colors disabled:opacity-50 mt-4"
              >
                {isGenerating ? 'Generating PDF...' : 'Generate Report'}
              </button>
            </div>
          </div>

          {/* Resource Planning Summary */}
          <div className="bg-[#111827] border border-[#1E2D40] rounded-2xl p-5">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#8A9BB0] mb-4">RESOURCE PLANNING SUMMARY</div>
            <div className="space-y-3">
              {resourceData.map((row, i) => (
                <div key={i} className="flex items-center justify-between text-[12px] border-b border-[#1E2D40] pb-2 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#F0F4F8]">{row.region}</span>
                    <span className="text-[#8A9BB0]">{row.beds} Beds | {row.meds}</span>
                  </div>
                  <span className={row.status === 'Critical' ? 'text-[#EF4444]' : row.status === 'Warning' ? 'text-[#F59E0B]' : 'text-[#10B981]'}>
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Reports */}
        <div className="lg:col-span-6">
          <div className="bg-[#111827] border border-[#1E2D40] rounded-2xl p-5">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#8A9BB0] mb-6">RECENT REPORTS</div>
            
            <div className="divide-y divide-[#1E2D40]">
              {recentReports.map((report, i) => (
                <div key={i} className="py-4 flex items-center justify-between group hover:bg-[#1A2332]/40 transition-colors px-2 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#1A2332] flex items-center justify-center text-[#3B82F6]">
                      <FileText size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-[#F0F4F8]">{report.name}</span>
                      <span className="text-[12px] text-[#4A5568]">{report.date} • {report.type}</span>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-1.5 border border-[#1E2D40] rounded-lg text-[12px] font-medium text-[#8A9BB0] hover:text-[#F0F4F8] hover:border-[#3B82F6] transition-all">
                    <FileDown size={14} />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
