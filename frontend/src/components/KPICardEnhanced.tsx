import { useState } from 'react';

interface KPIData {
  id: string;
  title: string;
  value: number;
  previous_value: number;
  delta_percent: number;
  trend: 'up' | 'down';
  icon: string;
  color: 'danger' | 'warning' | 'success';
  sparkline: number[];
  breakdown: Record<string, number>;
  subtitle: string;
}

const colorMap = {
  danger: {
    text: 'text-helix-danger',
    bg: 'bg-helix-danger/10',
    border: 'border-helix-danger/20',
    bar: '#EF4444',
  },
  warning: {
    text: 'text-helix-warning',
    bg: 'bg-helix-warning/10',
    border: 'border-helix-warning/20',
    bar: '#F59E0B',
  },
  success: {
    text: 'text-helix-success',
    bg: 'bg-helix-success/10',
    border: 'border-helix-success/20',
    bar: '#10B981',
  },
};

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 120;
  const height = 32;
  const step = width / (data.length - 1);

  const points = data
    .map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
    .join(' ');

  const areaPath = `M0,${height} L${points
    .split(' ')
    .map((p) => p)
    .join(' L')} L${width},${height} Z`;

  const linePath = `M${points.split(' ').join(' L')}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={`spark-grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-grad-${color})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="2.5"
        fill={color}
      >
        <animate
          attributeName="r"
          values="2.5;4;2.5"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="1;0.5;1"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

function TrendArrow({ trend, delta }: { trend: string; delta: number }) {
  const isUp = trend === 'up';
  const isPositive = (isUp && delta > 0) || (!isUp && delta < 0);
  // For most metrics, "up" is bad (more cases), but for accuracy, "up" is good
  return (
    <div className={`flex items-center gap-1 text-xs font-bold ${
      isPositive ? 'text-helix-success' : 'text-helix-danger'
    }`}>
      <svg
        className={`w-3 h-3 ${isUp ? '' : 'rotate-180'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
      <span>{Math.abs(delta).toFixed(1)}%</span>
    </div>
  );
}

export default function KPICardEnhanced({ kpi }: { kpi: KPIData }) {
  const [expanded, setExpanded] = useState(false);
  const colors = colorMap[kpi.color] || colorMap.success;

  const formattedValue =
    kpi.value >= 1000
      ? kpi.value.toLocaleString()
      : kpi.id === 'prediction_accuracy' || kpi.id === 'response_coverage'
      ? `${kpi.value}%`
      : kpi.id === 'outbreak_velocity'
      ? `${kpi.value}x`
      : kpi.value.toString();

  // Determine if delta is "good" or "bad"
  const goodDelta =
    kpi.id === 'prediction_accuracy' || kpi.id === 'response_coverage'
      ? kpi.delta_percent > 0
      : kpi.id === 'outbreak_velocity'
      ? kpi.delta_percent < 0
      : kpi.delta_percent < 0; // For cases/alerts, decrease is good

  return (
    <div
      className={`bg-helix-surface border border-helix-border rounded-2xl p-5 transition-all duration-300 hover:border-helix-accent/30 group cursor-pointer relative overflow-hidden ${
        expanded ? 'row-span-2' : ''
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: colors.bar, opacity: 0.05 }}
      />

      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
            {kpi.icon}
          </div>
          <div>
            <h3 className="text-xs font-bold text-helix-text-muted uppercase tracking-widest">
              {kpi.title}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendArrow
            trend={kpi.trend}
            delta={goodDelta ? Math.abs(kpi.delta_percent) : -Math.abs(kpi.delta_percent)}
          />
        </div>
      </div>

      {/* Value + Sparkline */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="text-3xl font-black text-helix-text tracking-tight leading-none">
            {formattedValue}
          </div>
          <p className="text-[10px] text-helix-text-muted mt-1 italic">
            {kpi.subtitle}
          </p>
        </div>
        <div className="opacity-60 group-hover:opacity-100 transition-opacity">
          <MiniSparkline data={kpi.sparkline} color={colors.bar} />
        </div>
      </div>

      {/* Expandable Breakdown */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          expanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pt-4 border-t border-helix-border space-y-2.5">
          <p className="text-[9px] font-bold text-helix-text-muted uppercase tracking-[0.15em] mb-3">
            Breakdown
          </p>
          {Object.entries(kpi.breakdown).map(([key, val]) => {
            const maxVal = Math.max(...Object.values(kpi.breakdown));
            const pct = (val / maxVal) * 100;
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-helix-text-muted font-medium">{key}</span>
                  <span className="text-helix-text font-bold font-mono text-[11px]">
                    {typeof val === 'number' && val >= 1000
                      ? val.toLocaleString()
                      : typeof val === 'number' && val < 100
                      ? `${val}%`
                      : val}
                  </span>
                </div>
                <div className="h-1 bg-helix-bg rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: colors.bar,
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expand indicator */}
      <div className="flex justify-center mt-3">
        <svg
          className={`w-4 h-4 text-helix-text-muted transition-transform duration-300 ${
            expanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
