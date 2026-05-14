import { useEffect, useState } from 'react';
import DualLayerDemo from '../components/DualLayerDemo';

export default function About() {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-helix-background p-8 pb-24 overflow-x-hidden">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto mt-12 text-center animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
          <span className="text-xl">💡</span>
          <span className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Innovation Narrative</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-helix-text tracking-tight mb-6 leading-tight">
          One Platform.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-helix-accent via-indigo-400 to-helix-warning">
            Two Scales of Intelligence.
          </span>
        </h1>
        <p className="text-xl text-helix-text-muted max-w-3xl mx-auto leading-relaxed">
          Helix is the world's first platform combining <strong className="text-indigo-400 font-semibold">Digital Health Twin</strong> technology with <strong className="text-helix-danger font-semibold">Epidemiological AI</strong> — predicting both individual health trajectories and population-level outbreaks in one unified system.
        </p>
      </section>

      {/* Dual-Layer Animated Diagram */}
      <section className="max-w-4xl mx-auto my-24 relative animate-fade-in">
        <div className="absolute inset-0 bg-helix-accent/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          
          {/* Individual Side */}
          <div className="flex-1 bg-helix-surface/80 border border-helix-border rounded-3xl p-8 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/40 mb-6 relative">
              <span className="text-4xl">👤</span>
              {pulse && <div className="absolute inset-0 rounded-2xl border border-indigo-400 animate-ping opacity-30" />}
            </div>
            <h3 className="text-2xl font-bold text-indigo-400 mb-2">Individual Layer</h3>
            <p className="text-helix-text-muted mb-4 text-sm">Personal Digital Twin</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 text-xs rounded-full border border-indigo-500/20">Risk Scores</span>
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 text-xs rounded-full border border-indigo-500/20">Vitals</span>
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 text-xs rounded-full border border-indigo-500/20">Projections</span>
            </div>
          </div>

          {/* Center Logo / Flow */}
          <div className="shrink-0 flex flex-col items-center justify-center relative">
            <div className="w-24 h-24 rounded-full bg-helix-surface border border-helix-accent flex items-center justify-center shadow-[0_0_30px_rgba(0,212,255,0.2)] z-10 relative">
              <span className="text-3xl font-bold text-helix-accent">H</span>
              {pulse && <div className="absolute inset-0 rounded-full border border-helix-accent animate-ping opacity-40" />}
            </div>
            {/* Horizontal connection line behind logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-1 bg-helix-border -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-1 flex justify-between px-8 -z-10">
              <div className={`h-full w-8 bg-indigo-400/50 blur-sm transition-transform duration-1000 ${pulse ? 'translate-x-[400%]' : 'translate-x-0'}`} />
              <div className={`h-full w-8 bg-helix-danger/50 blur-sm transition-transform duration-1000 ${pulse ? '-translate-x-[400%]' : 'translate-x-0'}`} />
            </div>
          </div>

          {/* Population Side */}
          <div className="flex-1 bg-helix-surface/80 border border-helix-border rounded-3xl p-8 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-bl from-helix-danger/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-20 h-20 mx-auto rounded-2xl bg-helix-danger/20 flex items-center justify-center border border-helix-danger/40 mb-6 relative">
              <span className="text-4xl">🗺️</span>
              {pulse && <div className="absolute inset-0 rounded-2xl border border-helix-danger animate-ping opacity-30" />}
            </div>
            <h3 className="text-2xl font-bold text-helix-danger mb-2">Population Layer</h3>
            <p className="text-helix-text-muted mb-4 text-sm">Epidemiological AI</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-helix-danger/10 text-red-300 text-xs rounded-full border border-helix-danger/20">Outbreak Alerts</span>
              <span className="px-3 py-1 bg-helix-danger/10 text-red-300 text-xs rounded-full border border-helix-danger/20">Heatmaps</span>
              <span className="px-3 py-1 bg-helix-danger/10 text-red-300 text-xs rounded-full border border-helix-danger/20">Forecasting</span>
            </div>
          </div>

        </div>
        
        <div className="flex justify-between max-w-2xl mx-auto mt-8 text-xs font-mono text-helix-text-muted px-12">
          <span className="text-indigo-400">← Symptom reports feed population models</span>
          <span className="text-helix-danger text-right">Population risk affects personal recommendations →</span>
        </div>
      </section>

      {/* Dual Layer Demo Component */}
      <section className="mb-32">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-helix-text mb-4">See It In Action</h2>
          <p className="text-helix-text-muted">Observe how regional data immediately contextualizes personal health risk.</p>
        </div>
        <DualLayerDemo />
      </section>

      {/* Comparison Section */}
      <section className="max-w-6xl mx-auto my-24 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-helix-text text-center mb-12">How It's Different</h2>
        <div className="overflow-hidden rounded-2xl border border-helix-border bg-helix-surface shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-helix-surface-light border-b border-helix-border">
                <th className="p-6 font-semibold text-helix-text-muted w-1/4">Feature</th>
                <th className="p-6 font-semibold text-helix-text w-1/4 border-x border-helix-border/50">Traditional EHR</th>
                <th className="p-6 font-semibold text-helix-text w-1/4 border-r border-helix-border/50">Public Health System</th>
                <th className="p-6 font-bold text-helix-accent w-1/4 text-lg">Helix Platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-helix-border/50 text-sm">
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-6 font-medium text-helix-text">Core Focus</td>
                <td className="p-6 text-helix-text-muted border-x border-helix-border/50">Individual treatment</td>
                <td className="p-6 text-helix-text-muted border-r border-helix-border/50">Population surveillance</td>
                <td className="p-6 font-bold text-helix-text bg-helix-accent/5"><span className="text-indigo-400">BOTH</span> (Unified Intelligence)</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-6 font-medium text-helix-text">Approach</td>
                <td className="p-6 text-helix-text-muted border-x border-helix-border/50">Reactive (Post-diagnosis)</td>
                <td className="p-6 text-helix-text-muted border-r border-helix-border/50">Reactive (Post-outbreak)</td>
                <td className="p-6 font-bold text-helix-success bg-helix-accent/5">Predictive & Proactive</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-6 font-medium text-helix-text">Data Architecture</td>
                <td className="p-6 text-helix-text-muted border-x border-helix-border/50">Siloed databases</td>
                <td className="p-6 text-helix-text-muted border-r border-helix-border/50">Siloed reports</td>
                <td className="p-6 font-bold text-helix-text bg-helix-accent/5">Real-time Unified Fusion</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-6 font-medium text-helix-text">Intelligence Layer</td>
                <td className="p-6 text-helix-text-muted border-x border-helix-border/50">No AI / Basic logic</td>
                <td className="p-6 text-helix-text-muted border-r border-helix-border/50">Basic Analytics</td>
                <td className="p-6 font-bold text-helix-text bg-helix-accent/5">Deep ML + XAI Explainability</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Tech Stack Diagram */}
      <section className="max-w-5xl mx-auto mb-24 text-center">
        <h2 className="text-3xl font-bold text-helix-text mb-4">Under the Hood</h2>
        <p className="text-helix-text-muted mb-12 max-w-2xl mx-auto">
          Helix leverages a modern, distributed architecture separating the user interface, core business logic, and heavy machine learning operations.
        </p>

        <div className="bg-helix-surface border border-helix-border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-helix-surface-light via-helix-surface to-helix-surface" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {/* Frontend */}
            <div className="flex-1 bg-black/40 border border-helix-border/50 rounded-2xl p-6 w-full shadow-lg">
              <div className="w-12 h-12 bg-[#61DAFB]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚛️</span>
              </div>
              <h4 className="font-bold text-white mb-1">Frontend</h4>
              <p className="text-xs text-helix-text-muted mb-3">React 19 + Vite + Tailwind</p>
              <div className="h-1 w-full bg-[#61DAFB]/30 rounded-full" />
            </div>

            <div className="text-helix-text-muted rotate-90 md:rotate-0">⇄</div>

            {/* Core API */}
            <div className="flex-1 bg-black/40 border border-helix-border/50 rounded-2xl p-6 w-full shadow-lg">
              <div className="w-12 h-12 bg-[#009688]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-bold text-white mb-1">Core API</h4>
              <p className="text-xs text-helix-text-muted mb-3">FastAPI + SQLAlchemy</p>
              <div className="h-1 w-full bg-[#009688]/30 rounded-full" />
            </div>

            <div className="text-helix-text-muted rotate-90 md:rotate-0">⇄</div>

            {/* ML Engine */}
            <div className="flex-1 bg-black/40 border border-helix-border/50 rounded-2xl p-6 w-full shadow-lg">
              <div className="w-12 h-12 bg-[#FF6F00]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h4 className="font-bold text-white mb-1">ML Service</h4>
              <p className="text-xs text-helix-text-muted mb-3">TensorFlow + Scikit-Learn</p>
              <div className="h-1 w-full bg-[#FF6F00]/30 rounded-full" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
