import { useState, useEffect } from 'react';
import { FileText, FileDown } from 'lucide-react';

const REGIONS = ['New York, USA', 'London, UK', 'Tokyo, Japan', 'Sao Paulo, Brazil', 'Johannesburg, SA', 'Lagos, Nigeria', 'Jakarta, Indonesia', 'Sydney, Australia', 'Cairo, Egypt', 'Mumbai, India'];
const DISEASES = ['Dengue', 'Malaria', 'Influenza', 'Cholera'];
const REPORT_TYPES = ['Regional Brief', 'National Summary', 'Alert Impact Analysis'];

const BASE = 'http://localhost:8080';

export default function Reports() {
  const [region, setRegion] = useState(REGIONS[0]);
  const [disease, setDisease] = useState('Dengue');
  const [reportType, setReportType] = useState('Regional Brief');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentReports, setRecentReports] = useState<any[]>([]);

  // Mock resource planning data (can be integrated later)
  const resourceData = [
    { region: 'Mumbai', beds: 450, meds: '5k Units', status: 'Critical' },
    { region: 'New York', beds: 120, meds: '2k Units', status: 'Warning' },
    { region: 'Tokyo', beds: 80, meds: '1k Units', status: 'Stable' },
  ];

  useEffect(() => {
    fetch(`${BASE}/api/reports/list`)
      .then(res => res.json())
      .then(data => setRecentReports(data))
      .catch(err => console.error(err));
  }, []);

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download report.');
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    let url = '';
    let filename = '';

    if (reportType === 'Regional Brief') {
      url = `${BASE}/api/reports/regional?region=${encodeURIComponent(region)}&disease=${encodeURIComponent(disease)}`;
      filename = `Helix_Briefing_${region.replace(/[^a-zA-Z0-9]/g, '')}_${disease}.pdf`;
    } else if (reportType === 'National Summary') {
      url = `${BASE}/api/reports/national`;
      filename = `Helix_Global_Summary.pdf`;
    } else {
      url = `${BASE}/api/reports/alert/TEST-ALERT`;
      filename = `Helix_Alert_Brief_TEST-ALERT.pdf`;
    }

    await downloadFile(url, filename);
    setIsGenerating(false);
  };

  const handleDownloadRecent = (report: any) => {
    let url = '';
    if (report.type === 'National Summary') url = `${BASE}/api/reports/national`;
    else if (report.type === 'Alert Brief') url = `${BASE}/api/reports/alert/${report.id}`;
    else url = `${BASE}/api/reports/regional?region=${encodeURIComponent(report.region)}&disease=${encodeURIComponent(report.disease)}`;
    
    downloadFile(url, `${report.id}_${report.type.replace(/\s+/g, '_')}.pdf`);
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
                  disabled={reportType === 'National Summary'}
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
                  disabled={reportType === 'National Summary'}
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
            
            {recentReports.length === 0 ? (
              <div className="text-center text-[#8A9BB0] py-8 text-[13px]">Loading reports...</div>
            ) : (
              <div className="divide-y divide-[#1E2D40] max-h-[600px] overflow-y-auto custom-scrollbar">
                {recentReports.map((report, i) => (
                  <div key={i} className="py-4 flex items-center justify-between group hover:bg-[#1A2332]/40 transition-colors px-2 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#1A2332] flex items-center justify-center text-[#3B82F6]">
                        <FileText size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-[#F0F4F8]">{report.id} - {report.type}</span>
                        <span className="text-[12px] text-[#4A5568]">
                          {report.generated_at} • {report.type === 'National Summary' ? 'Global' : report.region}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownloadRecent(report)}
                      className="flex items-center gap-2 px-3 py-1.5 border border-[#1E2D40] rounded-lg text-[12px] font-medium text-[#8A9BB0] hover:text-[#F0F4F8] hover:border-[#3B82F6] transition-all"
                    >
                      <FileDown size={14} />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

