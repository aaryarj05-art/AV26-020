import NotificationBell from './NotificationBell'

export default function Header() {
  return (
    <header className="h-16 border-b border-helix-border bg-helix-surface/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-semibold text-helix-text-muted uppercase tracking-wider">
          Public Health Intelligence
        </h2>
      </div>
      <div className="flex items-center gap-6">
        <NotificationBell />
        <div className="w-px h-6 bg-helix-border" />
        {/* Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-helix-success/10 border border-helix-success/20">
          <div className="w-2 h-2 rounded-full bg-helix-success animate-pulse" />
          <span className="text-xs font-medium text-helix-success">Systems Online</span>
        </div>
      </div>
    </header>
  )
}
