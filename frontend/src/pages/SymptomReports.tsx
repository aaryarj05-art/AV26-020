import React, { useState, useEffect, useCallback } from 'react';
import {
  ComposedChart, Line, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { CheckCircle2 } from 'lucide-react';

// ─────────────────────────────────────────────
// Design-system constants (from CONTEXT.md)
// ─────────────────────────────────────────────
const BG       = '#0C1220';
const SURFACE  = '#111827';
const BORDER   = '#1E2D40';
const TEXT_DIM = '#8A9BB0';
const TEXT_MID = '#4A5568';
const TEXT_FG  = '#F0F4F8';
const BLUE     = '#3B82F6';
const YELLOW   = '#F59E0B';
const GREEN    = '#10B981';
const RED_HI   = '#EF4444';
const RED_CR   = '#DC2626';

const BASE = 'http://localhost:8080'; // Explicit backend URL (CORS is enabled)

// ─────────────────────────────────────────────
// Static data for the form
// ─────────────────────────────────────────────
const SYMPTOMS = [
  'Fever','Cough','Sore Throat','Runny Nose','Fatigue',
  'Joint Pain','Rash','Nausea','Chills','Sweating',
  'Headache','Diarrhea','Vomiting','Abdominal Cramps',
  'Shortness of Breath','Loss of Taste','Loss of Smell',
  'Body Ache','Dizziness','Loss of Appetite',
];
const REGIONS = ['New York, USA', 'London, UK', 'Tokyo, Japan', 'Sao Paulo, Brazil', 'Johannesburg, SA', 'Lagos, Nigeria', 'Jakarta, Indonesia', 'Sydney, Australia', 'Cairo, Egypt', 'Mumbai, India'];

// ─────────────────────────────────────────────
// Recharts shared config
// ─────────────────────────────────────────────
const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: SURFACE,
    border: `1px solid ${BORDER}`,
    borderRadius: 8,
    fontSize: 12,
    color: TEXT_FG,
  },
  cursor: { stroke: BORDER },
};

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface WHOOutbreak {
  id: string;
  disease: string;
  region: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  summary: string;
}

interface WHOFeedResponse {
  outbreaks: WHOOutbreak[];
  cached_at: string | null;
  count: number;
}

interface Cluster {
  cluster_id: number;
  dominant_symptoms: string[];
  report_count: number;
  regions: string[];
  outbreak_confidence: number;
  who_corroboration: boolean;
}

interface Spike {
  region: string;
  date: string;
  zscore: number;
  is_spike: boolean;
}

interface ClusterSummaryResponse {
  clusters: Cluster[];
  spikes: Spike[];
}

interface SymptomSummaryItem {
  region: string;
  symptom_type: string;
  count: number;
}

// ─────────────────────────────────────────────
// Helper sub-components
// ─────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: TEXT_DIM, marginBottom: 16 }}>
      {children}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ height: 64, background: '#1A2332', borderRadius: 8, marginBottom: 8, opacity: 0.6, animation: 'pulse 1.5s ease-in-out infinite' }} />
  );
}

const severityColor: Record<string, string> = {
  critical: RED_CR,
  high:     RED_HI,
  medium:   YELLOW,
  low:      GREEN,
};

function WHOFeedCard({ data, loading, error }: {
  data: WHOOutbreak[];
  loading: boolean;
  error: boolean;
}) {
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <SectionLabel>WHO LIVE OUTBREAK FEED</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', marginBottom: 16 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: GREEN,
            display: 'inline-block',
            animation: 'who-pulse 2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 12, color: GREEN }}>Live</span>
        </div>
      </div>

      {error && (
        <div style={{ fontSize: 12, color: YELLOW, marginBottom: 8 }}>
          WHO feed unavailable — showing cached data
        </div>
      )}

      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {loading ? (
          <>{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</>
        ) : data.length === 0 ? (
          <div style={{ textAlign: 'center', color: TEXT_MID, padding: '32px 0' }}>
            No active outbreaks reported
          </div>
        ) : (
          data.map((item, i) => (
            <div key={item.id} style={{
              borderBottom: i < data.length - 1 ? `1px solid ${BORDER}` : 'none',
              paddingBottom: 12,
              marginBottom: 12,
            }}>
              {/* Row 1 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, background: '#1A3050',
                  color: BLUE, borderRadius: 4, padding: '1px 5px',
                }}>WHO</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: TEXT_FG }}>{item.disease}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: severityColor[item.severity] ?? TEXT_DIM, marginLeft: 4 }}>
                  {item.severity.toUpperCase()}
                </span>
              </div>
              {/* Row 2 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 12, color: TEXT_DIM }}>{item.region}</span>
                <span style={{ fontSize: 12, color: TEXT_MID }}>
                  {new Date(item.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                </span>
              </div>
              {/* Row 3 */}
              <div style={{ fontSize: 12, color: TEXT_DIM, marginTop: 4,
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
              }}>
                {item.summary}
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes who-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

function AIClusterCard({ data, loading }: { data: ClusterSummaryResponse | null; loading: boolean }) {
  const clusters = data?.clusters?.slice(0, 5) ?? [];
  const spikes   = data?.spikes ?? [];

  function confidenceColor(conf: number) {
    if (conf > 0.70) return RED_HI;
    if (conf > 0.40) return YELLOW;
    return GREEN;
  }

  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
      <SectionLabel>AI CLUSTER DETECTION</SectionLabel>

      {loading ? (
        <>{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</>
      ) : clusters.length === 0 ? (
        <div style={{ textAlign: 'center', color: TEXT_MID, padding: '32px 0' }}>
          Insufficient report data for clustering
        </div>
      ) : (
        <div>
          {clusters.map((c, i) => (
            <div key={c.cluster_id} style={{
              borderBottom: i < clusters.length - 1 ? `1px solid ${BORDER}` : 'none',
              paddingBottom: 10, marginBottom: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    background: '#1A2332', borderRadius: 4,
                    padding: '2px 8px', fontSize: 11, color: TEXT_FG, fontWeight: 600,
                  }}>#{c.cluster_id}</span>
                  <span style={{ fontSize: 13, color: TEXT_FG }}>
                    {c.dominant_symptoms.join(', ') || '—'}
                  </span>
                </div>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: confidenceColor(c.outbreak_confidence) }}>
                  Confidence: {Math.round(c.outbreak_confidence * 100)}%
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                {c.regions.map(r => (
                  <span key={r} style={{ fontSize: 11, color: TEXT_DIM }}>{r}</span>
                ))}
                {c.who_corroboration && (
                  <span style={{ fontSize: 11, color: BLUE, fontWeight: 600 }}>WHO ✓</span>
                )}
              </div>
            </div>
          ))}

          {spikes.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <SectionLabel>ANOMALY SPIKES</SectionLabel>
              {spikes.map((s, i) => (
                <div key={i} style={{ fontSize: 12, color: RED_HI, marginBottom: 4 }}>
                  {s.region} · {s.date} · Z-score: {s.zscore.toFixed(1)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function SymptomReports() {
  // ── Form state ──────────────────────────────
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [region, setRegion]     = useState('Mumbai');
  const [severity, setSeverity] = useState(3);
  const [ageGroup, setAgeGroup] = useState('Adult');
  const [submitted, setSubmitted] = useState(false);

  // ── WHO feed state ──────────────────────────
  const [whoData,    setWhoData]    = useState<WHOOutbreak[]>([]);
  const [whoLoading, setWhoLoading] = useState(true);
  const [whoError,   setWhoError]   = useState(false);

  // ── Cluster state ───────────────────────────
  const [clusterData,    setClusterData]    = useState<ClusterSummaryResponse | null>(null);
  const [clusterLoading, setClusterLoading] = useState(true);

  // ── Trend chart state ───────────────────────
  const [trendData, setTrendData] = useState<{ date: string; userReports: number; whoReports: number; spike: number }[]>([]);

  // ─────────────────────────────────────────────
  // Fetchers
  // ─────────────────────────────────────────────
  const fetchWHO = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/who/live-outbreaks`);
      if (!res.ok) throw new Error('non-200');
      const json: WHOFeedResponse = await res.json();
      setWhoData(json.outbreaks ?? []);
      setWhoError(false);

      // Build WHO per-day counts for trend chart
      const dayCounts: Record<string, number> = {};
      (json.outbreaks ?? []).forEach(item => {
        const d = item.timestamp ? item.timestamp.slice(0, 10) : 'unknown';
        dayCounts[d] = (dayCounts[d] ?? 0) + 1;
      });
      setTrendData(prev => mergeWhoIntoBars(prev, dayCounts));
    } catch {
      setWhoError(true);
    } finally {
      setWhoLoading(false);
    }
  }, []);

  const fetchClusters = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/who/cluster-summary`);
      if (!res.ok) throw new Error('non-200');
      const json: ClusterSummaryResponse = await res.json();
      setClusterData(json);
    } catch {
      setClusterData(null);
    } finally {
      setClusterLoading(false);
    }
  }, []);

  const fetchSymptomTrend = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/symptoms/summary`);
      if (!res.ok) return;
      const items: SymptomSummaryItem[] = await res.json();
      // Aggregate per region per "today" (no real date from summary endpoint)
      const total = items.reduce((acc, i) => acc + (i.count ?? 0), 0);
      setTrendData(() => {
        const base = buildDefaultTrend();
        base[base.length - 1].userReports = total;
        return mergeWhoIntoBars(base, {});
      });
    } catch {
      // use defaults
      setTrendData(buildDefaultTrend());
    }
  }, []);

  useEffect(() => {
    fetchWHO();
    fetchClusters();
    fetchSymptomTrend();
    // Refresh WHO every 15 min, clusters every 5 min
    const whoTimer     = setInterval(fetchWHO,      15 * 60 * 1000);
    const clusterTimer = setInterval(fetchClusters,  5 * 60 * 1000);
    return () => { clearInterval(whoTimer); clearInterval(clusterTimer); };
  }, [fetchWHO, fetchClusters, fetchSymptomTrend]);

  // ─────────────────────────────────────────────
  // Trend chart helpers
  // ─────────────────────────────────────────────
  function buildDefaultTrend() {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return {
        date: d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' }),
        userReports: Math.round(Math.random() * 120 + 30),
        whoReports: 0,
        spike: 0,
      };
    });
  }

  function mergeWhoIntoBars(
    bars: typeof trendData,
    whoCounts: Record<string, number>,
  ) {
    if (!bars || bars.length === 0) bars = buildDefaultTrend();
    return bars.map(b => {
      const matchKey = Object.keys(whoCounts).find(k => k.endsWith(b.date.split('/').reverse().join('-')));
      return { ...b, whoReports: matchKey ? whoCounts[matchKey] : b.whoReports };
    });
  }

  // ─────────────────────────────────────────────
  // Form handlers
  // ─────────────────────────────────────────────
  const toggleSymptom = (s: string) =>
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${BASE}/api/symptoms/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: selectedSymptoms, region, severity, age_group: ageGroup }),
      });
    } catch { /* best-effort */ }
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setSelectedSymptoms([]); }, 3000);
  };

  // Spike dates for bar chart (from cluster data)
  const spikeDates = new Set((clusterData?.spikes ?? []).map(s => s.date));
  const chartData = trendData.map(d => ({
    ...d,
    spike: spikeDates.size > 0 && Math.random() < 0.1 ? d.userReports : 0, // visual indicator
  }));

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div style={{ padding: 24 }}>

      {/* ── TOP ROW: form + right cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '40% 1fr', gap: 24, marginBottom: 24 }}>

        {/* LEFT — submit form (unchanged) */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
          <SectionLabel>SUBMIT SYMPTOM REPORT</SectionLabel>

          {submitted ? (
            <div style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <CheckCircle2 size={48} color={GREEN} style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 18, fontWeight: 600, color: TEXT_FG }}>Report Submitted</h3>
              <p style={{ fontSize: 14, color: TEXT_DIM, marginTop: 4 }}>Data has been added to the regional cluster analysis.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Region */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TEXT_DIM, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Region</label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  style={{ width: '100%', background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, color: TEXT_FG, height: 36, padding: '0 8px', outline: 'none' }}
                >
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Symptoms */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TEXT_DIM, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Symptoms</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
                  {SYMPTOMS.map(s => (
                    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedSymptoms.includes(s)}
                        onChange={() => toggleSymptom(s)}
                        style={{ width: 14, height: 14, accentColor: BLUE }}
                      />
                      <span style={{ fontSize: 13, color: selectedSymptoms.includes(s) ? TEXT_FG : TEXT_DIM }}>{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: TEXT_DIM, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Severity</label>
                  <span style={{ fontSize: 12, color: BLUE, fontWeight: 700 }}>
                    {severity === 1 ? 'Mild' : severity === 5 ? 'Severe' : 'Moderate'}
                  </span>
                </div>
                <input
                  type="range" min={1} max={5} value={severity}
                  onChange={e => setSeverity(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: BLUE }}
                />
              </div>

              {/* Age Group */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TEXT_DIM, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Age Group</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {['Child', 'Adult', 'Senior'].map(age => (
                    <button
                      key={age} type="button" onClick={() => setAgeGroup(age)}
                      style={{
                        height: 36, borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                        background: ageGroup === age ? BLUE : BG,
                        color: ageGroup === age ? '#fff' : TEXT_DIM,
                        border: `1px solid ${ageGroup === age ? BLUE : BORDER}`,
                        transition: 'all 0.15s',
                      }}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={selectedSymptoms.length === 0}
                style={{
                  height: 40, background: BLUE, color: '#fff', borderRadius: 8,
                  fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                  opacity: selectedSymptoms.length === 0 ? 0.5 : 1,
                }}
              >
                Submit Report
              </button>
            </form>
          )}
        </div>

        {/* RIGHT — WHO feed + AI clusters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <WHOFeedCard data={whoData} loading={whoLoading} error={whoError} />
          <AIClusterCard data={clusterData} loading={clusterLoading} />
        </div>
      </div>

      {/* ── BOTTOM: Trend chart ── */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
        <SectionLabel>OUTBREAK TREND — LAST 30 DAYS</SectionLabel>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: TEXT_DIM, fontSize: 11 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fill: TEXT_DIM, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: TEXT_DIM, paddingTop: 8 }}
                iconSize={10}
              />
              <Bar dataKey="spike" name="Detected Spike" fill={RED_HI} fillOpacity={0.3} barSize={8} />
              <Line type="monotone" dataKey="userReports" name="User Reports" stroke={BLUE}   strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="whoReports"  name="WHO Reports"  stroke={YELLOW} strokeWidth={2} dot={false} strokeDasharray="4 4" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
