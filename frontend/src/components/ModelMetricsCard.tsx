import React from 'react';

interface MetricInfo {
  rmse: number;
  mae: number;
  lastTrained: string;
}

interface ModelMetricsCardProps {
  metrics: {
    arima: MetricInfo;
    prophet: MetricInfo;
    lstm: MetricInfo;
  };
}

const MetricColumn = ({ title, metrics }: { title: string, metrics: MetricInfo }) => {
  const getStatusColor = (rmse: number) => {
    if (rmse < 50) return 'text-helix-success';
    if (rmse < 100) return 'text-helix-warning';
    return 'text-helix-danger';
  };

  const getBadgeColor = (rmse: number) => {
    if (rmse < 50) return 'bg-helix-success/10 border-helix-success/20 text-helix-success';
    if (rmse < 100) return 'bg-helix-warning/10 border-helix-warning/20 text-helix-warning';
    return 'bg-helix-danger/10 border-helix-danger/20 text-helix-danger';
  };

  return (
    <div className="flex-1 px-4 first:pl-0 last:pr-0 border-r last:border-r-0 border-helix-border">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-helix-text uppercase tracking-widest">{title}</h4>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getBadgeColor(metrics.rmse)}`}>
          {metrics.rmse < 50 ? 'Optimal' : metrics.rmse < 100 ? 'Stable' : 'Needs Tuning'}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-[10px] text-helix-text-muted">RMSE</span>
          <span className={`text-lg font-mono font-bold ${getStatusColor(metrics.rmse)}`}>
            {metrics.rmse.toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-[10px] text-helix-text-muted">MAE</span>
          <span className="text-sm font-mono text-helix-text">
            {metrics.mae.toFixed(1)}
          </span>
        </div>
        <div className="pt-2 flex justify-between items-center">
          <span className="text-[9px] text-helix-text-muted uppercase">Last Sync</span>
          <span className="text-[9px] text-helix-text font-medium">{metrics.lastTrained}</span>
        </div>
      </div>
    </div>
  );
};

export default function ModelMetricsCard({ metrics }: ModelMetricsCardProps) {
  return (
    <div className="bg-helix-surface border border-helix-border rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-helix-text">Ensemble Model Performance</h3>
        <p className="text-xs text-helix-text-muted">Validation metrics for local forecasting engines</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 md:gap-0">
        <MetricColumn title="ARIMA" metrics={metrics.arima} />
        <MetricColumn title="Prophet" metrics={metrics.prophet} />
        <MetricColumn title="LSTM" metrics={metrics.lstm} />
      </div>
      
      <div className="mt-6 pt-4 border-t border-helix-border flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-helix-success" />
           <span className="text-[10px] text-helix-text-muted italic">Weighted Ensemble Active: 30/30/40 Split</span>
        </div>
        <button className="text-[10px] text-helix-accent font-bold uppercase tracking-widest hover:underline cursor-pointer">
          Rerun Cross-Validation
        </button>
      </div>
    </div>
  );
}
