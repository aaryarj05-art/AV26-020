import React from 'react';

export default function Roadmap() {
  const phases = [
    {
      title: 'Phase 1: MVP (Today — Hackathon)',
      status: 'Current',
      color: 'helix-success',
      icon: '🟢',
      features: ['10 cities', '5 diseases', '3 ML models', '6 core modules'],
      infrastructure: 'Runs on: single laptop, no cloud required',
      stack: 'FastAPI + React + SQLite',
      team: 'Hackathon Team',
      cost: '₹0 (Local)',
      revenue: 'N/A'
    },
    {
      title: 'Phase 2 (0-6 months)',
      status: 'Next',
      color: 'helix-warning',
      icon: '🟡',
      features: ['100 cities', '15 diseases', 'State health ministry API'],
      infrastructure: 'Cloud: AWS/GCP, PostgreSQL, Redis cache',
      stack: 'FastAPI + React + Postgres + Redis',
      team: '8 engineers',
      cost: '₹15L/month infrastructure',
      revenue: 'Pilot funding'
    },
    {
      title: 'Phase 3 (6-18 months)',
      status: 'Future',
      color: 'orange-500',
      icon: '🟠',
      features: ['National scale', 'ICMR integration', 'Real EHR data'],
      infrastructure: 'Kubernetes orchestration, Microservices',
      stack: 'K8s + Event-Driven Microservices',
      team: '25+ engineers & epidemiologists',
      cost: 'Enterprise Cloud Scale',
      revenue: 'SaaS to health depts ₹2L/city/year'
    },
    {
      title: 'Phase 4 (18-36 months)',
      status: 'Vision',
      color: 'blue-500',
      icon: '🔵',
      features: ['ASEAN expansion', 'Drug discovery module', 'Global WHO partnership', 'Insurance analytics'],
      infrastructure: 'Multi-region Cloud, Federated Learning',
      stack: 'Global Scale Multi-Cloud',
      team: '100+ multi-disciplinary',
      cost: 'Global Infrastructure',
      revenue: 'B2B API & Govt Contracts'
    }
  ];

  return (
    <div className="min-h-screen bg-helix-background p-8 pb-24 overflow-x-hidden">
      <section className="max-w-6xl mx-auto mt-12 mb-16 text-center animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-helix-accent/10 border border-helix-accent/20 mb-6">
          <span className="text-xl">🚀</span>
          <span className="text-sm font-semibold text-helix-accent uppercase tracking-wider">Feasibility & Roadmap</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-helix-text tracking-tight mb-4">
          Path to Global Scale
        </h1>
        <p className="text-lg text-helix-text-muted max-w-2xl mx-auto">
          Helix is designed for exponential scaling. From a laptop-based MVP to a globally distributed Kubernetes cluster.
        </p>
      </section>

      <section className="max-w-5xl mx-auto space-y-8 relative animate-fade-in">
        {/* Vertical line connecting phases */}
        <div className="absolute top-8 bottom-8 left-12 w-1 bg-helix-border hidden md:block z-0" />

        {phases.map((phase, idx) => (
          <div key={idx} className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
            <div className="hidden md:flex flex-col items-center mt-6">
              <div className="w-24 h-24 bg-helix-surface border-4 border-helix-background rounded-full flex items-center justify-center text-4xl shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 relative">
                {phase.icon}
              </div>
            </div>
            
            <div className={`flex-1 bg-helix-surface border border-helix-border rounded-3xl p-8 hover:border-${phase.color}/50 transition-colors group relative overflow-hidden`}>
              {/* Glow effect */}
              <div className={`absolute -right-20 -top-20 w-64 h-64 bg-${phase.color}/5 rounded-full blur-3xl group-hover:bg-${phase.color}/10 transition-colors pointer-events-none`} />

              <div className="flex justify-between items-start mb-6 border-b border-helix-border/50 pb-4">
                <div>
                  <div className={`text-xs font-bold uppercase tracking-widest mb-1 text-${phase.color}`}>
                    {phase.status}
                  </div>
                  <h2 className="text-2xl font-bold text-helix-text">{phase.title}</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-bold text-helix-text-muted uppercase tracking-widest mb-3">Key Milestones</h4>
                  <ul className="space-y-2">
                    {phase.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-helix-text">
                        <span className={`text-${phase.color}`}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="bg-black/30 p-3 rounded-xl border border-helix-border/50">
                    <span className="text-[10px] text-helix-text-muted uppercase block mb-1">Infrastructure</span>
                    <span className="text-sm font-semibold text-helix-text">{phase.infrastructure}</span>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-helix-border/50">
                    <span className="text-[10px] text-helix-text-muted uppercase block mb-1">Tech Stack</span>
                    <span className="text-sm font-semibold text-helix-text">{phase.stack}</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 bg-black/30 p-3 rounded-xl border border-helix-border/50">
                      <span className="text-[10px] text-helix-text-muted uppercase block mb-1">Team</span>
                      <span className="text-sm font-semibold text-helix-text">{phase.team}</span>
                    </div>
                    <div className="flex-1 bg-black/30 p-3 rounded-xl border border-helix-border/50">
                      <span className="text-[10px] text-helix-text-muted uppercase block mb-1">Revenue/Cost</span>
                      <span className="text-sm font-semibold text-helix-success">{phase.revenue}</span>
                      <span className="text-xs text-helix-danger block mt-1">{phase.cost}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
