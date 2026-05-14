import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'

export default function Header() {
  const location = useLocation()
  
  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/dashboard': return 'Dashboard'
      case '/outbreak-map': return 'Outbreak Map'
      case '/predictions': return 'Predictions'
      case '/alerts': return 'Alerts'
      case '/symptom-reports': return 'Symptom Reports'
      case '/simulation': return 'Simulation'
      case '/reports': return 'Reports'
      default: return 'Helix Intelligence'
    }
  }

  return (
    <header className="h-[56px] bg-[#0C1220] border-b border-[#1E2D40] flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center">
        <h1 className="text-[24px] font-semibold text-[#F0F4F8]">
          {getPageTitle(location.pathname)}
        </h1>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Alert Bell */}
        <div className="relative cursor-pointer group">
          <Bell size={20} className="text-[#8A9BB0] group-hover:text-[#F0F4F8] transition-colors" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#0C1220]">
            3
          </span>
        </div>

        {/* Live Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#1E2D40] bg-[#111827]">
          <div className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span className="text-[12px] font-medium text-[#10B981]">Live</span>
        </div>
      </div>
    </header>
  )
}
