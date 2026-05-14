import { useState, useEffect } from 'react';

interface ResourceRegion {
  name: string;
  total: number;
  used: number;
  pct: number;
}

interface Resource {
  id: string;
  name: string;
  icon: string;
  total: number;
  utilized: number;
  utilization_pct: number;
  status: 'normal' | 'warning' | 'critical';
  trend: number[];
  regions: ResourceRegion[];
}

interface ResourceSummary {
  total_budget_allocated: number;
  budget_utilized: number;
  budget_utilization_pct: number;
  personnel_deployed: number;
  supply_chain_status: string;
  last_resupply: string;
  next_resupply_eta: string;
}

const statusConfig = {
  normal: {
    color: '#10B981',
    bg: 'bg-helix-success/10',
    border: 'border-helix-success/20',
    text: 'text-helix-success',
    label: 'Normal',
  },
  warning: {
    color: '#F59E0B',
    bg: 'bg-helix-warning/10',
    border: 'border-helix-warning/20',
    text: 'text-helix-warning',
    label: 'Elevated',
  },
  critical: {
    color: '#EF4444',
    bg: 'bg-helix-danger/10',
    border: 'border-helix-danger/20',
    text: 'text-helix-danger',
    label: 'Critical',
  },
};

function ResourceMiniBar({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return (
    <div className="flex items-end gap-[2px] h-6">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all duration-300"
          style={{
            height: `${((v - min) / range) * 100}%`,
            minHeight: '2px',
            backgroundColor: color,
            opacity: 0.3 + (i / data.length) * 0.7,
          }}
        />
      ))}
    </div>
  );
}

function UtilizationRing({
  pct,
  color,
  size = 48,
}: {
  pct: number;
  color: string;
  size?: number;
}) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#1F2937"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
        style={{
          filter: `drop-shadow(0 0 4px ${color}40)`,
        }}
      />
    </svg>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  const [showRegions, setShowRegions] = useState(false);
  const cfg = statusConfig[resource.status];

  const formatNumber = (n: number) =>
    n >= 1000000
      ? `${(n / 1000000).toFixed(1)}M`
      : n >= 1000
      ? `${(n / 1000).toFixed(1)}K`
      : n.toString();

  return (
    <div
      className="bg-helix-bg border border-helix-border rounded-2xl p-5 transition-all duration-300 hover:border-helix-accent/20 cursor-pointer group"
      onClick={() => setShowRegions(!showRegions)}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{resource.icon}</span>
          <div>
            <h4 className="text-sm font-bold text-helix-text">{resource.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  resource.status === 'critical' ? 'animate-pulse' : ''
                }`}
                style={{ backgroundColor: cfg.color }}
              />
              <span className={`text-[9px] font-bold uppercase tracking-widest ${cfg.text}`}>
                {cfg.label}
              </span>
            </div>
          </div>
        </div>

        {/* Utilization Ring */}
        <div className="relative">
          <UtilizationRing pct={resource.utilization_pct} color={cfg.color} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black text-helix-text">
              {resource.utilization_pct}%
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <p className="text-[9px] text-helix-text-muted uppercase font-bold tracking-widest">
            Total
          </p>
          <p className="text-sm font-bold text-helix-text font-mono">
            {formatNumber(resource.total)}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-helix-text-muted uppercase font-bold tracking-widest">
            In Use
          </p>
          <p className="text-sm font-bold text-helix-text font-mono">
            {formatNumber(resource.utilized)}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-helix-text-muted uppercase font-bold tracking-widest">
            Available
          </p>
          <p className="text-sm font-bold text-helix-accent font-mono">
            {formatNumber(resource.total - resource.utilized)}
          </p>
        </div>
      </div>

      {/* Mini Trend */}
      <div className="opacity-40 group-hover:opacity-80 transition-opacity">
        <ResourceMiniBar data={resource.trend} color={cfg.color} />
      </div>

      {/* Expandable Region Breakdown */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          showRegions ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pt-3 border-t border-helix-border space-y-2.5">
          <p className="text-[9px] font-bold text-helix-text-muted uppercase tracking-[0.15em]">
            Regional Distribution
          </p>
          {resource.regions.map((r) => (
            <div key={r.name} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-helix-text-muted">{r.name}</span>
                <span className="text-[10px] text-helix-text font-mono font-bold">
                  {r.pct}%
                </span>
              </div>
              <div className="h-1 bg-helix-surface-light rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${r.pct}%`,
                    backgroundColor:
                      r.pct >= 90 ? '#EF4444' : r.pct >= 75 ? '#F59E0B' : '#10B981',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ResourcePanel() {
  const [data, setData] = useState<{
    resources: Resource[];
    summary: ResourceSummary;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/kpi/resources');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
    const interval = setInterval(fetchResources, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-helix-surface border border-helix-border rounded-3xl p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-helix-surface-light rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-helix-bg rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const formatBudget = (n: number) =>
    n >= 10000000
      ? `₹${(n / 10000000).toFixed(1)} Cr`
      : n >= 100000
      ? `₹${(n / 100000).toFixed(1)} L`
      : `₹${n.toLocaleString()}`;

  const criticalCount = data.resources.filter((r) => r.status === 'critical').length;
  const warningCount = data.resources.filter((r) => r.status === 'warning').length;

  return (
    <div className="bg-helix-surface border border-helix-border rounded-3xl p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl font-bold text-helix-text flex items-center gap-2">
            Resource <span className="text-helix-accent">Allocation</span>
            {criticalCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-helix-danger/10 border border-helix-danger/20 ml-2">
                <div className="w-1.5 h-1.5 rounded-full bg-helix-danger animate-pulse" />
                <span className="text-[9px] font-black text-helix-danger uppercase">
                  {criticalCount} Critical
                </span>
              </span>
            )}
            {warningCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-helix-warning/10 border border-helix-warning/20">
                <span className="text-[9px] font-black text-helix-warning uppercase">
                  {warningCount} Elevated
                </span>
              </span>
            )}
          </h2>
          <p className="text-xs text-helix-text-muted mt-1">
            Public health infrastructure capacity & utilization monitoring
          </p>
        </div>

        {/* Budget Summary */}
        <div className="flex items-center gap-4 bg-helix-bg border border-helix-border p-4 rounded-2xl">
          <div>
            <p className="text-[10px] text-helix-text-muted uppercase font-bold tracking-widest text-right">
              Budget Utilized
            </p>
            <div className="text-2xl font-black text-helix-accent text-right">
              {data.summary.budget_utilization_pct}%
            </div>
            <p className="text-[9px] text-helix-text-muted text-right font-mono">
              {formatBudget(data.summary.budget_utilized)} /{' '}
              {formatBudget(data.summary.total_budget_allocated)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-helix-accent/10 flex items-center justify-center border border-helix-accent/20">
            <span className="text-xl">💰</span>
          </div>
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>

      {/* Supply Chain Footer */}
      <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-helix-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-helix-success shadow-[0_0_8px_#10B981]" />
          <span className="text-[10px] font-bold text-helix-text-muted uppercase tracking-widest">
            Supply Chain: {data.summary.supply_chain_status}
          </span>
        </div>
        <div className="text-[10px] text-helix-text-muted font-mono">
          Last Resupply:{' '}
          <span className="text-helix-text">
            {new Date(data.summary.last_resupply).toLocaleTimeString()}
          </span>
        </div>
        <div className="text-[10px] text-helix-text-muted font-mono">
          Next ETA:{' '}
          <span className="text-helix-accent">
            {new Date(data.summary.next_resupply_eta).toLocaleTimeString()}
          </span>
        </div>
        <div className="text-[10px] text-helix-text-muted font-mono">
          Personnel Deployed:{' '}
          <span className="text-helix-text font-bold">
            {data.summary.personnel_deployed.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
