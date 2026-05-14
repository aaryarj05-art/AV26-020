import { useOutbreakData } from '../hooks/useOutbreakData';

export default function DataStatus() {
  const { status, loading, error } = useOutbreakData();

  if (loading && !status) return <p className="text-[10px] text-helix-text-muted">Loading data status...</p>;
  if (error) return <p className="text-[10px] text-helix-danger">Data sync error</p>;
  if (!status) return null;

  const lastUpdated = new Date(status.last_updated).toLocaleDateString();

  return (
    <div className="mt-3 pt-3 border-t border-helix-border/50">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-medium text-helix-text-muted uppercase tracking-wider">
          System Status
        </p>
        <p className="text-[11px] text-helix-text flex justify-between">
          <span>Records Loaded:</span>
          <span className="text-helix-accent font-mono">{status.record_count.toLocaleString()}</span>
        </p>
        <p className="text-[11px] text-helix-text flex justify-between">
          <span>Last Updated:</span>
          <span className="text-helix-text-muted">{lastUpdated}</span>
        </p>
      </div>
    </div>
  );
}
