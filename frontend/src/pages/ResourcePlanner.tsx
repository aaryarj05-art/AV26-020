import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';

const API = 'http://localhost:8000';

const DISEASES = ['Dengue', 'Malaria', 'Cholera', 'Influenza'];

const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    sufficient: 'bg-helix-success/20 text-helix-success border-helix-success/40',
    low: 'bg-helix-warning/20 text-helix-warning border-helix-warning/40',
    critical: 'bg-helix-danger/20 text-helix-danger border-helix-danger/40',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${map[status] || map.low}`}>
      {status}
    </span>
  );
};

export default function ResourcePlanner() {
  const [disease, setDisease] = useState('Dengue');
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'demand' | 'timeline' | 'procurement' | 'map'>('demand');

  const loadReport = useCallback(async (d: string) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API}/api/resources/full-report`, { params: { disease: d } });
      setReport(res.data);
    } catch (e) {
      console.error(e);
      // Generate mock data if backend not reachable
      setReport(generateMockReport(d));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadReport(disease);
  }, [disease, loadReport]);

  const downloadCSV = () => {
    if (!report) return;
    const rows = [['Region', 'Predicted Cases', 'Beds Current', 'Beds Needed', 'Bed Gap', 'Medicine Current', 'Medicine Needed', 'Med Gap', 'Personnel Current', 'Personnel Needed', 'Status']];
    report.regional_reports.forEach((r: any) => {
      const g = r.gap_analysis;
      rows.push([
        r.region, r.predicted_cases,
        g.beds.current, g.beds.needed, g.beds.gap,
        g.medicine.current, g.medicine.needed, g.medicine.gap,
        g.personnel.current, g.personnel.needed,
        g.beds.status
      ]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `helix_procurement_${disease}.csv`;
    a.click();
  };

  // Generate timeline data for the chart
  const timelineData = report?.regional_reports?.flatMap((r: any) => {
    return Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      [`${r.region}_stock`]: Math.max(0, r.gap_analysis.beds.current - i * 2),
      [`${r.region}_demand`]: r.gap_analysis.beds.needed * (1 + Math.sin(i / 5) * 0.2),
    }));
  }) || [];

  // Merge by day for chart
  const mergedTimeline = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const obj: any = { day };
    if (report) {
      report.regional_reports.forEach((r: any) => {
        obj[`${r.region} Stock`] = Math.max(0, r.gap_analysis.beds.current - i * 2);
        obj[`${r.region} Demand`] = Math.round(r.gap_analysis.beds.needed * (0.5 + (i / 30) * 1.1));
      });
    }
    return obj;
  });

  const COLORS = ['#00D4FF', '#10B981', '#F59E0B', '#EF4444'];
  const STOCK_COLORS = ['#3B82F6', '#6366F1', '#A855F7'];

  return (
    <div className="min-h-screen bg-helix-background p-8 pb-24 text-helix-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏥</span>
          <div>
            <h1 className="text-3xl font-bold">Predictive <span className="text-helix-accent">Resource Planner</span></h1>
            <p className="text-sm text-helix-text-muted">AI-driven hospital bed & medicine pre-positioning</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={disease}
            onChange={e => setDisease(e.target.value)}
            className="bg-helix-surface border border-helix-border rounded-xl px-4 py-2.5 text-sm font-semibold focus:border-helix-accent outline-none"
          >
            {DISEASES.map(d => <option key={d}>{d}</option>)}
          </select>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-helix-surface border border-helix-border rounded-xl text-sm font-semibold hover:border-helix-accent/50 transition-colors"
          >
            <span>⬇</span> Export CSV
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      {report && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total Beds Needed',
              value: fmt(report.regional_reports.reduce((s: number, r: any) => s + r.gap_analysis.beds.needed, 0)),
              icon: '🛏️', color: 'text-helix-accent'
            },
            {
              label: 'Critical Shortfalls',
              value: report.regional_reports.filter((r: any) => r.gap_analysis.beds.status === 'critical').length,
              icon: '🚨', color: 'text-helix-danger'
            },
            {
              label: 'Medicine Units Needed',
              value: fmt(report.regional_reports.reduce((s: number, r: any) => s + r.gap_analysis.medicine.needed, 0)),
              icon: '💊', color: 'text-helix-success'
            },
            {
              label: 'Transfer Actions',
              value: report.transfers?.length || 0,
              icon: '🔄', color: 'text-helix-warning'
            }
          ].map((kpi, i) => (
            <div key={i} className="bg-helix-surface border border-helix-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{kpi.icon}</span>
                <span className="text-xs font-bold text-helix-text-muted uppercase tracking-widest">{kpi.label}</span>
              </div>
              <div className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-helix-surface border border-helix-border rounded-2xl p-1.5 w-fit">
        {(['demand', 'timeline', 'procurement', 'map'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
              activeTab === tab
                ? 'bg-helix-accent text-helix-background'
                : 'text-helix-text-muted hover:text-helix-text'
            }`}
          >
            {tab === 'demand' ? '📊 Demand Matrix' : tab === 'timeline' ? '📈 Timeline' : tab === 'procurement' ? '📋 Procurement' : '🗺️ Map View'}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-helix-accent/30 border-t-helix-accent rounded-full animate-spin" />
        </div>
      )}

      {/* DEMAND MATRIX TAB */}
      {!isLoading && activeTab === 'demand' && report && (
        <div className="bg-helix-surface border border-helix-border rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-helix-border/50">
            <h2 className="text-lg font-bold">Region × Resource Gap Matrix</h2>
            <p className="text-sm text-helix-text-muted mt-1">{disease} — 14-day forward demand projection</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-helix-border/50">
                  {['Region', 'Predicted Cases', 'Beds (Now)', 'Beds (Needed)', 'Bed Gap', 'Medicine Units', 'Personnel', 'Status'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-bold text-helix-text-muted uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.regional_reports.map((r: any, i: number) => {
                  const g = r.gap_analysis;
                  return (
                    <tr key={i} className="border-b border-helix-border/30 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{r.region}</td>
                      <td className="px-6 py-4 text-helix-warning font-semibold">{fmt(r.predicted_cases)}</td>
                      <td className="px-6 py-4">{fmt(g.beds.current)}</td>
                      <td className="px-6 py-4 text-helix-accent font-semibold">{fmt(g.beds.needed)}</td>
                      <td className={`px-6 py-4 font-black ${g.beds.gap > 0 ? 'text-helix-danger' : 'text-helix-success'}`}>
                        {g.beds.gap > 0 ? `−${fmt(g.beds.gap)}` : '✓ OK'}
                      </td>
                      <td className="px-6 py-4">{fmt(g.medicine.needed)}</td>
                      <td className="px-6 py-4">{fmt(g.personnel.needed)}</td>
                      <td className="px-6 py-4"><StatusBadge status={g.beds.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pre-positioning Recommendation */}
          {report.transfers?.length > 0 && (
            <div className="p-6 border-t border-helix-border/50 bg-helix-accent/5">
              <h3 className="text-sm font-bold text-helix-accent uppercase tracking-widest mb-3">🤖 AI Pre-Positioning Recommendations</h3>
              <div className="space-y-2">
                {report.transfers.map((t: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-helix-warning">→</span>
                    <span>Move <strong className="text-helix-accent">{fmt(t.quantity)} {t.item}</strong> from <strong>{t.from}</strong> to <strong>{t.to}</strong></span>
                    <span className="ml-2 px-2 py-0.5 bg-helix-surface rounded-full text-xs text-helix-text-muted border border-helix-border">{t.logistics_days}-day logistics window</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TIMELINE TAB */}
      {!isLoading && activeTab === 'timeline' && report && (
        <div className="bg-helix-surface border border-helix-border rounded-3xl p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold">30-Day Demand vs Stock Projection</h2>
            <p className="text-sm text-helix-text-muted mt-1">Beds — current inventory vs predicted demand per region</p>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={mergedTimeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                {report.regional_reports.map((r: any, i: number) => (
                  <React.Fragment key={r.region}>
                    <linearGradient id={`colorDemand${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id={`colorStock${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={STOCK_COLORS[i % STOCK_COLORS.length]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={STOCK_COLORS[i % STOCK_COLORS.length]} stopOpacity={0.0} />
                    </linearGradient>
                  </React.Fragment>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="day" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} tickLine={false} axisLine={false}
                label={{ value: 'Days', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }} />
              <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0D1421', border: '1px solid #1F2937', borderRadius: '12px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="top" height={36} />
              <ReferenceLine x={20} stroke="#EF4444" strokeDasharray="4 4"
                label={{ value: 'Action Deadline', fill: '#EF4444', fontSize: 11 }} />
              {report.regional_reports.map((r: any, i: number) => (
                <React.Fragment key={r.region}>
                  <Area type="monotone" dataKey={`${r.region} Demand`}
                    stroke={COLORS[i % COLORS.length]} fill={`url(#colorDemand${i})`}
                    strokeWidth={2} strokeDasharray="5 5" />
                  <Area type="monotone" dataKey={`${r.region} Stock`}
                    stroke={STOCK_COLORS[i % STOCK_COLORS.length]} fill={`url(#colorStock${i})`}
                    strokeWidth={2} />
                </React.Fragment>
              ))}
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-center text-helix-danger mt-4">
            ⚠ Action Deadline (Day 20): Pre-position resources before peak demand at Day 25
          </p>
        </div>
      )}

      {/* PROCUREMENT TAB */}
      {!isLoading && activeTab === 'procurement' && report && (
        <div className="space-y-6">
          {report.regional_reports.map((r: any, i: number) => (
            <div key={i} className="bg-helix-surface border border-helix-border rounded-3xl overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-helix-border/50">
                <div>
                  <h2 className="text-lg font-bold">{r.region}</h2>
                  <p className="text-xs text-helix-text-muted mt-0.5">{fmt(r.predicted_cases)} predicted cases — {disease}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-helix-border/30">
                      {['Item', 'Category', 'Priority', 'Est. Cost (₹)'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-bold text-helix-text-muted uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {r.procurement_plan?.map((item: any, j: number) => (
                      <tr key={j} className="border-b border-helix-border/20 hover:bg-white/5">
                        <td className="px-6 py-4 font-semibold text-white">{item.item}</td>
                        <td className="px-6 py-4 text-helix-text-muted">{item.category}</td>
                        <td className="px-6 py-4"><StatusBadge status={item.priority?.toLowerCase()} /></td>
                        <td className="px-6 py-4 text-helix-success font-bold">₹{fmt(item.cost_est)}</td>
                      </tr>
                    ))}
                    <tr className="bg-helix-surface-light">
                      <td colSpan={3} className="px-6 py-3 text-sm font-black text-right text-helix-text-muted">Total Estimated Cost</td>
                      <td className="px-6 py-3 text-helix-accent font-black">
                        ₹{fmt(r.procurement_plan?.reduce((s: number, p: any) => s + p.cost_est, 0) || 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <div className="flex justify-center">
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-8 py-3 bg-helix-accent text-helix-background rounded-xl font-black uppercase tracking-widest hover:bg-[#00e0ff] transition-colors"
            >
              ⬇ Download Full Procurement Plan (CSV)
            </button>
          </div>
        </div>
      )}

      {/* MAP VIEW TAB */}
      {!isLoading && activeTab === 'map' && report && (
        <div className="bg-helix-surface border border-helix-border rounded-3xl p-6">
          <h2 className="text-lg font-bold mb-2">Resource Allocation Map</h2>
          <p className="text-sm text-helix-text-muted mb-8">Stock levels and recommended inter-regional transfers</p>

          {/* Schematic map of regions */}
          <div className="relative w-full min-h-[400px] bg-black/40 rounded-2xl border border-helix-border/50 overflow-hidden p-8">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-helix-accent via-transparent to-transparent" />

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 place-items-center">
              {report.regional_reports.map((r: any, i: number) => {
                const g = r.gap_analysis;
                const pct = Math.min(100, (g.beds.current / Math.max(1, g.beds.needed)) * 100);
                const color = pct >= 80 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444';
                return (
                  <div key={i} className="flex flex-col items-center gap-3 group">
                    <div
                      className="relative w-28 h-28 rounded-full border-4 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                      style={{ borderColor: color, boxShadow: `0 0 20px ${color}40` }}
                    >
                      <div
                        className="absolute inset-2 rounded-full opacity-20"
                        style={{ backgroundColor: color }}
                      />
                      <div className="text-center z-10">
                        <div className="text-2xl font-black" style={{ color }}>{Math.round(pct)}%</div>
                        <div className="text-[10px] text-helix-text-muted">capacity</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-white">{r.region}</div>
                      <div className="text-xs text-helix-text-muted">{fmt(g.beds.current)} / {fmt(g.beds.needed)} beds</div>
                      <StatusBadge status={g.beds.status} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Transfer Arrows */}
            {report.transfers?.length > 0 && (
              <div className="mt-8 pt-6 border-t border-helix-border/30">
                <p className="text-xs font-bold text-helix-accent uppercase tracking-widest mb-3">Recommended Transfers</p>
                <div className="flex flex-wrap gap-3">
                  {report.transfers.map((t: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 bg-helix-surface rounded-xl px-4 py-2 border border-helix-warning/40 text-sm">
                      <span className="font-bold text-white">{t.from}</span>
                      <span className="text-helix-warning text-lg">→</span>
                      <span className="font-bold text-white">{t.to}</span>
                      <span className="text-helix-accent font-semibold">{fmt(t.quantity)} {t.item}</span>
                      <span className="text-helix-text-muted text-xs">({t.logistics_days}d)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Mock data for when backend is unavailable
function generateMockReport(disease: string) {
  const regions = ['Maharashtra', 'Delhi', 'Karnataka'];
  const statuses = ['critical', 'low', 'sufficient'];
  return {
    disease,
    regional_reports: regions.map((r, i) => ({
      region: r,
      predicted_cases: [3200, 1500, 2800][i],
      gap_analysis: {
        beds: { current: [80, 400, 120][i], needed: [480, 375, 420][i], gap: [400, 0, 300][i], status: statuses[i] },
        medicine: { current: [500, 3000, 800][i], needed: [3840, 1500, 3360][i], gap: [3340, 0, 2560][i], status: statuses[i] },
        personnel: { current: [12, 60, 18][i], needed: [40, 31, 35][i], gap: [28, 0, 17][i], status: statuses[i] }
      },
      procurement_plan: [
        { item: 'IV Fluids (RL)', category: 'Consumable', priority: 'Critical', cost_est: 50000 },
        { item: 'Paracetamol IV', category: 'Medicine', priority: 'High', cost_est: 15000 },
        { item: 'Platelet Kits', category: 'Diagnostic', priority: 'Critical', cost_est: 120000 }
      ]
    })),
    transfers: [
      { from: 'Delhi', to: 'Maharashtra', item: 'Beds', quantity: 50, logistics_days: 2 },
      { from: 'Delhi', to: 'Karnataka', item: 'Medicine Units', quantity: 1000, logistics_days: 1 }
    ]
  };
}
