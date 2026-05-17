import { useState } from 'react';
import { Check, Lock, Sparkles } from 'lucide-react';

export default function Upgrade() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-[32px] font-bold text-[#F0F4F8]">Upgrade Helix Intelligence</h1>
        <p className="text-[15px] text-[#8A9BB0] max-w-2xl mx-auto">
          Unlock predictive forecasting, real-time outbreak mapping, and SEIR intervention modeling.
          Choose the plan that fits your public health response needs.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={`text-[13px] font-medium transition-colors ${!isAnnual ? 'text-[#F0F4F8]' : 'text-[#8A9BB0]'}`}>Monthly</span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 rounded-full bg-[#1E2D40] relative transition-colors hover:bg-[#2A3B52]"
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-[#3B82F6] transition-all ${isAnnual ? 'left-7' : 'left-1'}`} />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-[13px] font-medium transition-colors ${isAnnual ? 'text-[#F0F4F8]' : 'text-[#8A9BB0]'}`}>Annually</span>
            <span className="px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] text-[10px] font-bold uppercase tracking-wider rounded-full border border-[#10B981]/20">Save 20%</span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Observer (Free) */}
        <div className="bg-[#111827] border border-[#1E2D40] rounded-2xl p-6 relative flex flex-col">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1E2D40] text-[#8A9BB0] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#2A3B52]">
            Current Plan
          </div>
          <div className="mb-6">
            <h2 className="text-[20px] font-semibold text-[#F0F4F8]">Observer</h2>
            <p className="text-[13px] text-[#8A9BB0] mt-1">Basic intelligence overview.</p>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-[36px] font-bold text-[#F0F4F8]">$0</span>
              <span className="text-[13px] text-[#8A9BB0] mb-2">/month</span>
            </div>
          </div>
          <button className="w-full py-2.5 rounded-lg border border-[#3B82F6] text-[#3B82F6] text-[13px] font-medium hover:bg-[#3B82F6]/10 transition-colors mb-8">
            Current Plan
          </button>
          <div className="space-y-3 flex-1">
            <FeatureItem text="Dashboard basic KPIs" />
            <FeatureItem text="Outbreak Map (static, 24hr delay)" />
            <FeatureItem text="WHO Disease Feed (top 5 diseases)" />
            <FeatureItem text="Alerts (severity 3+ only)" />
            <FeatureItem text="Chatbot (5 messages/day)" />
            <FeatureItem text="Predictions" locked />
            <FeatureItem text="Simulation" locked />
            <FeatureItem text="PDF Reports" locked />
            <FeatureItem text="Realtime data" locked />
            <FeatureItem text="All disease types" locked />
          </div>
        </div>

        {/* Analyst (Pro) */}
        <div className="bg-[#0C1220] border-2 border-[#3B82F6] rounded-2xl p-6 relative flex flex-col transform md:-translate-y-4 shadow-2xl shadow-[#3B82F6]/10">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3B82F6] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles size={12} /> Most Popular
          </div>
          <div className="mb-6">
            <h2 className="text-[20px] font-semibold text-[#F0F4F8]">Analyst</h2>
            <p className="text-[13px] text-[#8A9BB0] mt-1">Predictive capabilities & realtime data.</p>
            <div className="mt-4 flex items-end gap-1">
              {isAnnual && <span className="text-[18px] text-[#4A5568] line-through mb-1 mr-1">$29</span>}
              <span className="text-[36px] font-bold text-[#F0F4F8]">{isAnnual ? '$23' : '$29'}</span>
              <span className="text-[13px] text-[#8A9BB0] mb-2">/month</span>
            </div>
            {isAnnual && <div className="text-[11px] text-[#10B981] mt-1">Billed $276 yearly</div>}
          </div>
          <button className="w-full py-2.5 rounded-lg bg-[#3B82F6] text-white text-[13px] font-medium hover:bg-[#2563EB] transition-colors mb-8 shadow-lg shadow-[#3B82F6]/20">
            Start 14-day Free Trial
          </button>
          <div className="space-y-3 flex-1">
            <FeatureItem text="Everything in Observer" />
            <FeatureItem text="Realtime Dashboard + Map" />
            <FeatureItem text="All WHO disease types + dropdown" />
            <FeatureItem text="30-day Predictions w/ confidence" />
            <FeatureItem text="All Alerts (all severity levels)" />
            <FeatureItem text="Symptom Cluster AI Analysis" />
            <FeatureItem text="Unlimited Chatbot" />
            <FeatureItem text="PDF Reports (5/month)" />
            <FeatureItem text="Simulation" locked />
            <FeatureItem text="Custom disease watchlists" locked />
            <FeatureItem text="API Access" locked />
          </div>
        </div>

        {/* Sentinel (Enterprise) */}
        <div className="bg-[#111827] border border-[#1E2D40] rounded-2xl p-6 relative flex flex-col">
          <div className="mb-6">
            <h2 className="text-[20px] font-semibold text-[#F0F4F8]">Sentinel</h2>
            <p className="text-[13px] text-[#8A9BB0] mt-1">Full API access & scenario simulation.</p>
            <div className="mt-4 flex items-end gap-1">
              {isAnnual && <span className="text-[18px] text-[#4A5568] line-through mb-1 mr-1">$99</span>}
              <span className="text-[36px] font-bold text-[#F0F4F8]">{isAnnual ? '$79' : '$99'}</span>
              <span className="text-[13px] text-[#8A9BB0] mb-2">/month</span>
            </div>
            {isAnnual && <div className="text-[11px] text-[#10B981] mt-1">Billed $948 yearly</div>}
          </div>
          <button className="w-full py-2.5 rounded-lg border border-[#F0F4F8] text-[#F0F4F8] text-[13px] font-medium hover:bg-[#F0F4F8] hover:text-[#0C1220] transition-colors mb-8">
            Contact Sales
          </button>
          <div className="space-y-3 flex-1">
            <FeatureItem text="Everything in Analyst" />
            <FeatureItem text="SEIR Simulation (full custom)" />
            <FeatureItem text="Custom disease watchlists" />
            <FeatureItem text="Unlimited PDF Reports" />
            <FeatureItem text="API Access (100k calls/month)" />
            <FeatureItem text="Priority Chatbot" />
            <FeatureItem text="Multi-region dashboard" />
            <FeatureItem text="Export to CSV/JSON" />
            <FeatureItem text="Early access to new features" />
            <FeatureItem text="Dedicated support" />
          </div>
        </div>

      </div>
    </div>
  );
}

function FeatureItem({ text, locked = false }: { text: string; locked?: boolean }) {
  return (
    <div className={`flex items-start gap-3 ${locked ? 'opacity-50' : ''}`}>
      {locked ? (
        <Lock size={16} className="text-[#8A9BB0] shrink-0 mt-0.5" />
      ) : (
        <Check size={16} className="text-[#3B82F6] shrink-0 mt-0.5" />
      )}
      <span className={`text-[13px] leading-tight ${locked ? 'text-[#8A9BB0]' : 'text-[#F0F4F8]'}`}>
        {text}
      </span>
    </div>
  );
}
