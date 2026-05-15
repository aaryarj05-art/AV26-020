import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Map, 
  TrendingUp, 
  Bell, 
  ClipboardList, 
  Activity, 
  FileText,
  Menu,
  ChevronLeft,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/outbreak-map', label: 'Outbreak Map', icon: Map },
  { to: '/predictions', label: 'Predictions', icon: TrendingUp },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/symptom-reports', label: 'Symptom Reports', icon: ClipboardList },
  { to: '/simulation', label: 'Simulation', icon: Activity },
  { to: '/reports', label: 'Reports', icon: FileText },
]

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  return (
    <aside className={`fixed left-0 top-0 h-screen transition-all duration-300 bg-[#0C1220] border-r border-[#1E2D40] flex flex-col z-40 ${isCollapsed ? 'w-[64px]' : 'w-[220px]'}`}>
      {/* Top section */}
      <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-[#3B82F6] text-[10px] font-bold uppercase tracking-widest">HEALTH INTELLIGENCE</span>
            <h1 className="text-[18px] font-bold text-[#F0F4F8]">Helix</h1>
          </div>
        )}
        <button 
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-[#1A2332] text-[#8A9BB0] transition-colors"
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <div className="px-4 mb-4">
        <div className="h-px bg-[#1E2D40] w-full" />
      </div>

      {/* Navigation items */}
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={isCollapsed ? item.label : ''}
            className={({ isActive }) =>
              `h-[44px] flex items-center rounded-lg transition-all duration-200 group ${
                isCollapsed ? 'justify-center mx-1' : 'px-4 mx-2'
              } ${
                isActive
                  ? 'bg-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/20'
                  : 'text-[#8A9BB0] hover:bg-[#1A2332] hover:text-[#F0F4F8]'
              }`
            }
          >
            <item.icon size={18} className={isCollapsed ? '' : 'mr-3'} />
            {!isCollapsed && <span className="text-[14px] font-medium truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className={`p-4 border-t border-[#1E2D40] ${isCollapsed ? 'items-center' : ''}`}>
        {!isCollapsed ? (
          <div className="text-[#4A5568] text-[11px] font-mono">
            Helix v1.0
            <div className="mt-1">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          </div>
        ) : (
          <div className="text-[#4A5568] text-[10px] font-bold">V1</div>
        )}
      </div>
    </aside>
  )
}
