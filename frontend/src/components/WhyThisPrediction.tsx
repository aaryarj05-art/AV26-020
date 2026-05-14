import React, { useState, useEffect } from 'react';

interface FeatureImpact {
  feature: string;
  impact: number;
}

interface WhyThisPredictionProps {
  disease?: string;
  region?: string;
  condition?: string;
  userData?: any;
  predictionValue?: number;
  type: 'outbreak' | 'personal';
}

export default function WhyThisPrediction({ disease, region, condition, userData, predictionValue, type }: WhyThisPredictionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [explanation, setExplanation] = useState<{ top_features?: FeatureImpact[], waterfall?: any[], narrative: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchExplanation = async () => {
    setLoading(true);
    try {
      const endpoint = type === 'outbreak' ? '/api/explain/outbreak' : '/api/explain/personal-risk';
      const body = type === 'outbreak' 
        ? { disease, region, prediction_value: predictionValue }
        : { condition, user_data: userData };

      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setExplanation(data);
    } catch (err) {
      console.error("XAI fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !explanation) {
      fetchExplanation();
    }
  }, [isOpen]);

  const features = type === 'outbreak' ? explanation?.top_features : explanation?.waterfall;

  return (
    <div className="mt-4 border border-helix-border rounded-xl overflow-hidden bg-helix-bg/30">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-helix-surface-light transition-colors"
      >
        <div className="flex items-center gap-2">
           <span className="text-xs">🧠</span>
           <span className="text-[10px] font-bold text-helix-text uppercase tracking-widest">Model Intelligence: Why this prediction?</span>
        </div>
        <span className={`text-[10px] transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-helix-border animate-fade-in">
          {loading ? (
            <div className="flex items-center gap-2 py-4">
               <div className="w-3 h-3 rounded-full border-2 border-helix-accent border-t-transparent animate-spin" />
               <span className="text-[10px] text-helix-text-muted">Synthesizing SHAP waterfall...</span>
            </div>
          ) : explanation ? (
            <div className="space-y-4">
               <div className="space-y-3">
                 {features?.map((f: any, i: number) => (
                   <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[9px] font-medium text-helix-text-muted uppercase">
                        <span>{f.feature}</span>
                        <span className={f.impact > 0 ? 'text-helix-danger' : 'text-helix-success'}>
                          {f.impact > 0 ? '+' : ''}{(f.impact * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1 bg-helix-bg rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${f.impact > 0 ? 'bg-helix-danger' : 'bg-helix-success'}`}
                          style={{ width: `${Math.min(100, Math.abs(f.impact * 200))}%` }}
                        />
                      </div>
                   </div>
                 ))}
               </div>
               <p className="text-[11px] text-helix-text leading-relaxed bg-helix-accent/5 p-3 rounded-lg border border-helix-accent/20 italic">
                 "{explanation.narrative}"
               </p>
            </div>
          ) : (
            <p className="text-[10px] text-helix-danger">Failed to generate explanation. Check ML service connectivity.</p>
          )}
        </div>
      )}
    </div>
  );
}
