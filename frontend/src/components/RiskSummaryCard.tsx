import React from 'react';
import { NavLink } from 'react-router-dom';

export default function RiskSummaryCard() {
  // In a real app, this would be fetched from a user session/storage
  // For demo, we'll check if a mock 'assessment_complete' exists in localStorage
  const isComplete = localStorage.getItem('helix_assessment_complete') === 'true';

  if (!isComplete) {
    return (
      <div className="bg-helix-surface border border-helix-border rounded-2xl p-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-helix-accent/10 flex items-center justify-center mb-4">
          <span className="text-xl">🧬</span>
        </div>
        <h3 className="text-sm font-bold text-helix-text mb-2 uppercase tracking-widest">Personal Risk Profile</h3>
        <p className="text-[10px] text-helix-text-muted mb-4">Complete your health twin assessment to see personalized risk vectors.</p>
        <NavLink 
          to="/personal-risk"
          className="bg-helix-accent text-helix-bg px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform"
        >
          Start Assessment
        </NavLink>
      </div>
    );
  }

  const mockRisks = [
    { label: 'Diabetes', value: 12, color: 'text-helix-success' },
    { label: 'Heart', value: 45, color: 'text-helix-warning' },
    { label: 'Stroke', value: 8, color: 'text-helix-success' }
  ];

  return (
    <div className="bg-helix-surface border border-helix-border rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-helix-text uppercase tracking-widest">Personal Risk</h3>
        <NavLink to="/personal-risk" className="text-[9px] text-helix-accent hover:underline uppercase font-bold">Update</NavLink>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {mockRisks.map(risk => (
          <div key={risk.label} className="text-center">
            <p className="text-[8px] text-helix-text-muted uppercase mb-1">{risk.label}</p>
            <p className={`text-xl font-bold ${risk.color}`}>{risk.value}%</p>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-helix-border flex items-center gap-2">
         <div className="w-1.5 h-1.5 rounded-full bg-helix-warning" />
         <span className="text-[9px] text-helix-text-muted italic">Heart risk moderate: Monitor sodium intake</span>
      </div>
    </div>
  );
}
