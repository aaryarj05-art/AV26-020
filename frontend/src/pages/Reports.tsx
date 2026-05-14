import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface RecentReport {
  id: string;
  type: string;
  region: string;
  disease: string;
  generated_at: string;
  size_kb: number;
}

export default function Reports() {
  const [region, setRegion] = useState('Maharashtra');
  const [disease, setDisease] = useState('Dengue');
  const [reportType, setReportType] = useState('Regional Brief');
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [autoBrief, setAutoBrief] = useState(false);

  const regions = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Kerala"];
  const diseases = ["Dengue", "Malaria", "Influenza", "Cholera"];

  useEffect(() => {
    fetchRecentReports();
  }, []);

  const fetchRecentReports = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/reports/list');
      setRecentReports(response.data);
    } catch (error) {
      console.error('Failed to fetch recent reports:', error);
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    setPreviewUrl(null);
    try {
      let url = '';
      if (reportType === 'Regional Brief') {
        url = `http://localhost:8000/api/reports/regional?region=${region}&disease=${disease}`;
      } else if (reportType === 'National Summary') {
        url = `http://localhost:8000/api/reports/national`;
      } else {
        url = `http://localhost:8000/api/reports/alert/ALT-882`; // Mock alert ID
      }

      const response = await axios.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      setPreviewUrl(blobUrl);
      fetchRecentReports();
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyUrl = () => {
    if (previewUrl) {
      navigator.clipboard.writeText(previewUrl);
      alert('Report preview URL copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-helix-background p-8 pb-24 text-helix-text animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">📄</span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Authority <span className="text-helix-accent">Briefing System</span></h1>
          <p className="text-sm text-helix-text-muted">Auto-generated PDF intelligence for health officials</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Generator Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-helix-surface border border-helix-border rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-helix-accent animate-pulse" />
              Report Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-helix-text-muted uppercase tracking-widest mb-2">Report Type</label>
                <select 
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-black/30 border border-helix-border rounded-xl p-3 text-sm focus:border-helix-accent outline-none transition-all"
                >
                  <option>Regional Brief</option>
                  <option>National Summary</option>
                  <option>Alert Brief</option>
                </select>
              </div>

              {reportType === 'Regional Brief' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-helix-text-muted uppercase tracking-widest mb-2">Target Region</label>
                    <select 
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full bg-black/30 border border-helix-border rounded-xl p-3 text-sm focus:border-helix-accent outline-none"
                    >
                      {regions.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-helix-text-muted uppercase tracking-widest mb-2">Pathogen Focal Point</label>
                    <select 
                      value={disease}
                      onChange={(e) => setDisease(e.target.value)}
                      className="w-full bg-black/30 border border-helix-border rounded-xl p-3 text-sm focus:border-helix-accent outline-none"
                    >
                      {diseases.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div className="pt-4">
                <button 
                  onClick={generateReport}
                  disabled={isGenerating}
                  className="w-full py-4 bg-helix-accent text-helix-background font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(0,212,255,0.3)]"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-helix-background/30 border-t-helix-background rounded-full animate-spin" />
                      Generating...
                    </span>
                  ) : 'Generate Intelligence Brief'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-helix-surface border border-helix-border rounded-3xl p-6">
            <h2 className="text-sm font-bold text-helix-text-muted uppercase tracking-widest mb-4">Automation Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-helix-border/50">
                <div className="text-sm font-semibold">Daily 08:00 AM Briefing</div>
                <button 
                  onClick={() => setAutoBrief(!autoBrief)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${autoBrief ? 'bg-helix-success' : 'bg-helix-border'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${autoBrief ? 'translate-x-6' : ''}`} />
                </button>
              </div>
              <div>
                <label className="block text-xs font-bold text-helix-text-muted uppercase tracking-widest mb-2">Recipient Authority Email</label>
                <input 
                  type="email" 
                  placeholder="health-ministry@gov.in"
                  className="w-full bg-black/30 border border-helix-border rounded-xl p-3 text-sm focus:border-helix-accent outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preview & History */}
        <div className="lg:col-span-8 space-y-6">
          {/* Report Preview */}
          <div className="bg-helix-surface border border-helix-border rounded-3xl overflow-hidden shadow-2xl min-h-[500px] flex flex-col">
            <div className="p-4 border-b border-helix-border/50 flex justify-between items-center bg-black/20">
              <h3 className="font-bold flex items-center gap-2">
                <span className="text-helix-accent">👁</span> Intelligence Preview
              </h3>
              {previewUrl && (
                <div className="flex gap-2">
                  <button onClick={copyUrl} className="px-3 py-1.5 bg-helix-surface border border-helix-border rounded-lg text-xs font-bold hover:border-helix-accent transition-all">Copy Link</button>
                  <a href={previewUrl} download={`Helix_Report_${reportType.replace(' ','_')}.pdf`} className="px-3 py-1.5 bg-helix-accent text-helix-background rounded-lg text-xs font-bold hover:bg-[#00e0ff] transition-all">Download PDF</a>
                </div>
              )}
            </div>
            
            <div className="flex-1 relative bg-black/40">
              {previewUrl ? (
                <iframe 
                  src={previewUrl} 
                  className="w-full h-full min-h-[600px] border-none"
                  title="PDF Report Preview"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-helix-text-muted">
                  <span className="text-5xl mb-4 opacity-20">📊</span>
                  <p className="text-sm italic">No report currently in preview.</p>
                  <p className="text-xs mt-2">Configure settings and click generate to build intelligence.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Reports Table */}
          <div className="bg-helix-surface border border-helix-border rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-helix-border/50">
              <h3 className="font-bold flex items-center gap-2">
                <span className="text-helix-warning">🕒</span> Dispatch History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-helix-border/30 text-xs font-bold text-helix-text-muted uppercase tracking-widest bg-black/10">
                    <th className="px-6 py-4">Report ID</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Region</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-helix-border/30">
                  {recentReports.map((rpt, i) => (
                    <tr key={rpt.id} className="hover:bg-white/5 transition-colors text-sm">
                      <td className="px-6 py-4 font-mono text-helix-accent">{rpt.id}</td>
                      <td className="px-6 py-4 font-semibold">{rpt.type}</td>
                      <td className="px-6 py-4 text-helix-text-muted">{rpt.region}</td>
                      <td className="px-6 py-4 text-xs font-mono">{rpt.generated_at}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-helix-accent hover:underline font-bold">⬇ PDF</button>
                      </td>
                    </tr>
                  ))}
                  {recentReports.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-helix-text-muted italic">No recent reports found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
