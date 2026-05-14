export default function Dashboard() {
  const cards = [
    { title: 'Active Outbreaks', value: '—', icon: '🦠', color: 'text-helix-danger' },
    { title: 'Risk Score', value: '—', icon: '🛡️', color: 'text-helix-accent' },
    { title: 'Regions Monitored', value: '—', icon: '🌍', color: 'text-helix-success' },
    { title: 'Alerts Today', value: '—', icon: '🔔', color: 'text-helix-warning' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-helix-text mb-1">Dashboard</h1>
        <p className="text-helix-text-muted">Real-time public health overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-helix-surface border border-helix-border rounded-2xl p-6 hover:border-helix-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-helix-accent/5"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{card.icon}</span>
              <span className={`text-xs font-medium ${card.color} uppercase tracking-wider`}>Live</span>
            </div>
            <p className="text-3xl font-bold text-helix-text mb-1">{card.value}</p>
            <p className="text-sm text-helix-text-muted">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-helix-surface border border-helix-border rounded-2xl p-6 h-64 flex items-center justify-center">
          <p className="text-helix-text-muted text-sm">📈 Outbreak Trend Chart — Coming in Phase 2</p>
        </div>
        <div className="bg-helix-surface border border-helix-border rounded-2xl p-6 h-64 flex items-center justify-center">
          <p className="text-helix-text-muted text-sm">🗺️ Geographic Heatmap — Coming in Phase 3</p>
        </div>
      </div>
    </div>
  )
}
