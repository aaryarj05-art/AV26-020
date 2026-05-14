import { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

const SEVERITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];

export default function Alerts() {
  const [filter, setFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Mock alerts data
  const [alerts, setAlerts] = useState([
    { 
      id: 1, 
      severity: 'Critical', 
      region: 'Mumbai', 
      disease: 'Dengue', 
      timestamp: '2h ago', 
      action: 'Emergency vector control deployment required in North Mumbai.',
      reason: 'Symptom report volume exceeded threshold by 40%.'
    },
    { 
      id: 2, 
      severity: 'High', 
      region: 'Delhi', 
      disease: 'Influenza', 
      timestamp: '5h ago', 
      action: 'Increase hospital bed readiness in central districts.',
      reason: 'Model forecasting 25% increase in cases over 7 days.'
    },
    { 
      id: 3, 
      severity: 'Medium', 
      region: 'Bangalore', 
      disease: 'Malaria', 
      timestamp: '12h ago', 
      action: 'Dispatch public health advisors to community centers.',
      reason: 'Rainfall correlation indicates high breeding potential.'
    },
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return '#DC2626';
      case 'High': return '#EF4444';
      case 'Medium': return '#F59E0B';
      default: return '#10B981';
    }
  };

  const filteredAlerts = alerts.filter(a => filter === 'All' || a.severity === filter);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const resolveAlert = (id: number) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      {/* FILTER TABS */}
      <div className="flex gap-2 bg-[#111827] border border-[#1E2D40] rounded-2xl p-1 w-fit">
        {SEVERITIES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-xl text-[12px] font-medium transition-colors ${
              filter === s 
                ? 'bg-[#3B82F6] text-white' 
                : 'text-[#8A9BB0] hover:text-[#F0F4F8]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ALERT LIST */}
      <div className="bg-[#111827] border border-[#1E2D40] rounded-2xl overflow-hidden">
        {filteredAlerts.length > 0 ? (
          <div className="divide-y divide-[#1E2D40]">
            {filteredAlerts.map(alert => (
              <div key={alert.id} className="relative transition-colors hover:bg-[#1A2332]/40">
                {/* Severity Indicator Border */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-[4px]" 
                  style={{ backgroundColor: getSeverityColor(alert.severity) }} 
                />
                
                <div 
                  className="px-6 py-4 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(alert.id)}
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: getSeverityColor(alert.severity) }}>
                        {alert.severity}
                      </span>
                      <span className="text-[14px] font-bold text-[#F0F4F8]">{alert.region}</span>
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-[14px] text-[#F0F4F8]">{alert.disease}</span>
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-[12px] text-[#8A9BB0]">{alert.timestamp}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); resolveAlert(alert.id); }}
                      className="text-[12px] font-medium text-[#3B82F6] hover:text-[#2563EB] px-3 py-1"
                    >
                      Resolve
                    </button>
                    {expandedId === alert.id ? <ChevronUp size={16} className="text-[#4A5568]" /> : <ChevronDown size={16} className="text-[#4A5568]" />}
                  </div>
                </div>

                {/* EXPANDED CONTENT */}
                {expandedId === alert.id && (
                  <div className="px-6 pb-6 pt-2 ml-[4px] bg-[#1A2332]/20 border-t border-[#1E2D40]/50 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <div className="text-[11px] font-semibold text-[#8A9BB0] uppercase tracking-widest">Recommended Action</div>
                        <p className="text-[14px] text-[#F0F4F8] leading-relaxed">{alert.action}</p>
                        <button 
                          onClick={() => resolveAlert(alert.id)}
                          className="text-[13px] font-medium text-[#3B82F6] flex items-center gap-2 hover:underline"
                        >
                          Mark as Resolved
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div className="text-[11px] font-semibold text-[#8A9BB0] uppercase tracking-widest">Trigger Reason</div>
                        <p className="text-[13px] text-[#8A9BB0] leading-relaxed">{alert.reason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center px-6">
            <CheckCircle2 size={48} className="text-[#10B981] mb-4 opacity-20" />
            <h3 className="text-[18px] font-semibold text-[#F0F4F8]">No active alerts</h3>
            <p className="text-[14px] text-[#8A9BB0] mt-1">System is monitoring all regions</p>
          </div>
        )}
      </div>
    </div>
  );
}
