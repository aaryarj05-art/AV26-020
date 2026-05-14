import { useState, useEffect } from 'react';

interface SystemService {
  status: string;
  latency_ms: number;
  uptime_pct: number;
}

interface Mission {
  id: string;
  name: string;
  severity: string;
  region: string;
  teams_deployed: number;
  cases_managed: number;
  started: string;
  status: string;
  progress: number;
}

interface ActivityItem {
  time: string;
  event: string;
  type: string;
}

interface RegionSitrep {
  region: string;
  threat_level: string;
  active_cases: number;
  trend: string;
  response_score: number;
}

interface OperationsData {
  system_health: Record<string, SystemService>;
  active_missions: Mission[];
  response_metrics: {
    avg_response_time_mins: number;
    cases_resolved_today: number;
    new_cases_today: number;
    resolution_rate: number;
    field_teams_active: number;
    field_teams_total: number;
    supply_deliveries_today: number;
    regions_under_watch: number;
  };
  activity_feed: ActivityItem[];
  region_sitrep: RegionSitrep[];
  last_updated: string;
}

const severityConfig: Record<string, { color: string; bg: string; border: string; glow: string }> = {
  critical: { color: 'text-helix-danger', bg: 'bg-helix-danger/10', border: 'border-helix-danger/30', glow: 'shadow-[0_0_12px_rgba(239,68,68,0.3)]' },
  high: { color: 'text-helix-warning', bg: 'bg-helix-warning/10', border: 'border-helix-warning/30', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]' },
  medium: { color: 'text-helix-accent', bg: 'bg-helix-accent/10', border: 'border-helix-accent/30', glow: '' },
  low: { color: 'text-helix-success', bg: 'bg-helix-success/10', border: 'border-helix-success/30', glow: '' },
};

const activityTypeConfig: Record<string, { color: string; icon: string }> = {
  critical: { color: 'text-helix-danger', icon: '🔴' },
  warning: { color: 'text-helix-warning', icon: '🟡' },
  success: { color: 'text-helix-success', icon: '🟢' },
  info: { color: 'text-helix-accent', icon: '🔵' },
};

const trendIcons: Record<string, { icon: string; color: string }> = {
  rising: { icon: '↑', color: 'text-helix-danger' },
  stable: { icon: '→', color: 'text-helix-warning' },
  declining: { icon: '↓', color: 'text-helix-success' },
};

function SystemHealthGrid({ health }: { health: Record<string, SystemService> }) {
  const formatName = (key: string) =>
    key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="bg-helix-surface border border-helix-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-helix-text uppercase tracking-widest">
          System Telemetry
        </h3>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-helix-success/10 border border-helix-success/20">
          <div className="w-1 h-1 rounded-full bg-helix-success animate-pulse" />
          <span className="text-[8px] font-black text-helix-success uppercase">All Systems</span>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(health).map(([key, svc]) => {
          const isOk = svc.status === 'operational';
          return (
            <div
              key={key}
              className={`p-3 rounded-xl border transition-all ${
                isOk
                  ? 'bg-helix-bg border-helix-border hover:border-helix-success/30'
                  : 'bg-helix-warning/5 border-helix-warning/20 animate-pulse'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-helix-text-muted uppercase tracking-wider truncate">
                  {formatName(key)}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOk ? 'bg-helix-success' : 'bg-helix-warning'
                  }`}
                  style={{ boxShadow: `0 0 6px ${isOk ? '#10B981' : '#F59E0B'}` }}
                />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-helix-text font-mono">
                  {svc.latency_ms}
                </span>
                <span className="text-[9px] text-helix-text-muted">ms</span>
              </div>
              <div className="mt-1 h-1 bg-helix-surface-light rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${svc.uptime_pct}%`,
                    backgroundColor: svc.uptime_pct >= 99.5 ? '#10B981' : svc.uptime_pct >= 99 ? '#F59E0B' : '#EF4444',
                  }}
                />
              </div>
              <p className="text-[8px] text-helix-text-muted mt-1 font-mono text-right">
                {svc.uptime_pct}% uptime
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MissionCard({ mission }: { mission: Mission }) {
  const cfg = severityConfig[mission.severity] || severityConfig.low;
  const daysSince = Math.floor(
    (Date.now() - new Date(mission.started).getTime()) / 86400000
  );

  return (
    <div className={`bg-helix-bg border rounded-2xl p-5 transition-all hover:scale-[1.01] ${cfg.border} ${cfg.glow}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
              {mission.severity}
            </span>
            <span className="text-[9px] text-helix-text-muted font-mono">{mission.id}</span>
          </div>
          <h4 className="text-sm font-bold text-helix-text truncate">{mission.name}</h4>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[9px] text-helix-text-muted mb-1">
          <span>Progress</span>
          <span className="font-bold text-helix-text">{mission.progress}%</span>
        </div>
        <div className="h-1.5 bg-helix-surface-light rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${mission.progress}%`,
              background: `linear-gradient(90deg, ${
                mission.severity === 'critical' ? '#EF4444' : mission.severity === 'high' ? '#F59E0B' : '#00D4FF'
              }, ${
                mission.severity === 'critical' ? '#F59E0B' : mission.severity === 'high' ? '#10B981' : '#10B981'
              })`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[8px] text-helix-text-muted uppercase font-bold">Teams</p>
          <p className="text-sm font-bold text-helix-text">{mission.teams_deployed}</p>
        </div>
        <div>
          <p className="text-[8px] text-helix-text-muted uppercase font-bold">Cases</p>
          <p className="text-sm font-bold text-helix-text">{mission.cases_managed.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[8px] text-helix-text-muted uppercase font-bold">Day</p>
          <p className="text-sm font-bold text-helix-text">{daysSince}d</p>
        </div>
      </div>
    </div>
  );
}

function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="bg-helix-surface border border-helix-border rounded-2xl p-6">
      <h3 className="text-sm font-bold text-helix-text uppercase tracking-widest mb-5">
        Live Activity Feed
      </h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {items.map((item, i) => {
          const cfg = activityTypeConfig[item.type] || activityTypeConfig.info;
          const timeStr = new Date(item.time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          return (
            <div
              key={i}
              className="flex gap-3 p-3 rounded-xl bg-helix-bg border border-helix-border hover:border-helix-accent/20 transition-all group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm">{cfg.icon}</span>
                {i < items.length - 1 && (
                  <div className="w-px flex-1 bg-helix-border mt-1" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-helix-text leading-relaxed">{item.event}</p>
                <p className="text-[9px] text-helix-text-muted font-mono mt-1">{timeStr}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RegionSitrepTable({ regions }: { regions: RegionSitrep[] }) {
  return (
    <div className="bg-helix-surface border border-helix-border rounded-2xl p-6">
      <h3 className="text-sm font-bold text-helix-text uppercase tracking-widest mb-5">
        Regional Situation Report
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-helix-border">
              <th className="text-[9px] text-helix-text-muted uppercase tracking-widest font-bold pb-3 pr-4">Region</th>
              <th className="text-[9px] text-helix-text-muted uppercase tracking-widest font-bold pb-3 pr-4">Threat</th>
              <th className="text-[9px] text-helix-text-muted uppercase tracking-widest font-bold pb-3 pr-4">Cases</th>
              <th className="text-[9px] text-helix-text-muted uppercase tracking-widest font-bold pb-3 pr-4">Trend</th>
              <th className="text-[9px] text-helix-text-muted uppercase tracking-widest font-bold pb-3">Response</th>
            </tr>
          </thead>
          <tbody>
            {regions.map((r) => {
              const cfg = severityConfig[r.threat_level] || severityConfig.low;
              const trend = trendIcons[r.trend] || trendIcons.stable;
              return (
                <tr key={r.region} className="border-b border-helix-border/50 hover:bg-helix-bg/50 transition-colors">
                  <td className="py-3 pr-4">
                    <span className="text-xs font-bold text-helix-text">{r.region}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                      {r.threat_level}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs font-bold text-helix-text font-mono">
                      {r.active_cases.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-sm font-bold ${trend.color}`}>
                      {trend.icon} <span className="text-[9px] uppercase">{r.trend}</span>
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-helix-bg rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${r.response_score}%`,
                            backgroundColor: r.response_score >= 80 ? '#10B981' : r.response_score >= 60 ? '#F59E0B' : '#EF4444',
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-helix-text font-mono">{r.response_score}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CommandCenter() {
  const [data, setData] = useState<OperationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/operations/status');
        const json = await res.json();
        setData(json);
        setPulse(true);
        setTimeout(() => setPulse(false), 500);
      } catch (err) {
        console.error('Failed to fetch ops data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-helix-surface rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-helix-surface rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-80 bg-helix-surface rounded-2xl" />
          <div className="h-80 bg-helix-surface rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const m = data.response_metrics;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-helix-text mb-1">
            Command <span className="text-helix-accent">Center</span>
          </h1>
          <p className="text-helix-text-muted text-sm italic">
            Real-time operational intelligence & response coordination
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${
            pulse ? 'bg-helix-accent/10 border-helix-accent/40' : 'bg-helix-accent/5 border-helix-accent/20'
          }`}>
            <div className="w-2 h-2 rounded-full bg-helix-accent animate-ping" />
            <span className="text-[10px] font-bold text-helix-accent uppercase tracking-widest">
              15s Auto-Sync
            </span>
          </div>
          <div className="text-[10px] text-helix-text-muted font-mono px-3 py-2 rounded-xl bg-helix-surface border border-helix-border">
            {new Date(data.last_updated).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Avg Response', value: `${m.avg_response_time_mins}m`, icon: '⚡', color: 'text-helix-accent' },
          { label: 'Resolved Today', value: m.cases_resolved_today, icon: '✅', color: 'text-helix-success' },
          { label: 'New Cases', value: m.new_cases_today, icon: '📊', color: 'text-helix-warning' },
          { label: 'Resolution Rate', value: `${m.resolution_rate}%`, icon: '🎯', color: 'text-helix-success' },
        ].map((stat) => (
          <div key={stat.label} className="bg-helix-surface border border-helix-border rounded-2xl p-4 hover:border-helix-accent/20 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{stat.icon}</span>
              <span className="text-[9px] font-bold text-helix-text-muted uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="flex flex-wrap gap-6 px-4 py-3 bg-helix-surface border border-helix-border rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="text-sm">👨‍⚕️</span>
          <span className="text-[10px] text-helix-text-muted uppercase tracking-widest">Field Teams:</span>
          <span className="text-xs font-bold text-helix-text">
            {m.field_teams_active}/{m.field_teams_total}
          </span>
          <div className="w-12 h-1.5 bg-helix-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-helix-accent rounded-full"
              style={{ width: `${(m.field_teams_active / m.field_teams_total) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">📦</span>
          <span className="text-[10px] text-helix-text-muted uppercase tracking-widest">Supply Runs:</span>
          <span className="text-xs font-bold text-helix-accent">{m.supply_deliveries_today} today</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">👁️</span>
          <span className="text-[10px] text-helix-text-muted uppercase tracking-widest">Regions Watched:</span>
          <span className="text-xs font-bold text-helix-warning">{m.regions_under_watch}</span>
        </div>
      </div>

      {/* System Health */}
      <SystemHealthGrid health={data.system_health} />

      {/* Missions + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-bold text-helix-text uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="text-lg">🎯</span> Active Missions
            <span className="text-[9px] font-bold text-helix-accent px-2 py-0.5 rounded-full bg-helix-accent/10 border border-helix-accent/20">
              {data.active_missions.length} Active
            </span>
          </h3>
          <div className="space-y-4">
            {data.active_missions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        </div>
        <ActivityFeed items={data.activity_feed} />
      </div>

      {/* Region SITREP */}
      <RegionSitrepTable regions={data.region_sitrep} />
    </div>
  );
}
