import { NavLink } from 'react-router-dom'
import DataStatus from './DataStatus'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/outbreak-map', label: 'Outbreak Map', icon: '🗺️' },
  { to: '/alerts', label: 'Alerts', icon: '🚨' },
  { to: '/personal-risk', label: 'Personal Risk', icon: '🛡️' },
  { to: '/health-twin', label: 'Health Twin', icon: '🧬' },
  { to: '/symptom-checker', label: 'Symptom Checker', icon: '🩺' },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-helix-surface border-r border-helix-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-helix-border">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-helix-accent/20 flex items-center justify-center group-hover:bg-helix-accent/30 transition-colors">
            <span className="text-helix-accent font-bold text-lg">H</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-helix-text">
            Hel<span className="text-helix-accent">ix</span>
          </span>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-helix-accent/15 text-helix-accent shadow-lg shadow-helix-accent/5'
                  : 'text-helix-text-muted hover:text-helix-text hover:bg-helix-surface-light'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-helix-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-helix-accent/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-helix-accent">AV</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-helix-text truncate">Team AV26-020</p>
            <p className="text-xs text-helix-text-muted">Hackathon</p>
          </div>
        </div>
        <DataStatus />
      </div>
    </aside>
  )
}
