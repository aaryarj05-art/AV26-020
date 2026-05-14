export default function Architecture() {
  return (
    <div className="min-h-screen bg-helix-background p-8 pb-24 overflow-x-hidden">
      <section className="max-w-6xl mx-auto mt-12 mb-16 animate-fade-in-up text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-helix-accent/10 border border-helix-accent/20 mb-6">
          <span className="text-xl">⚙️</span>
          <span className="text-sm font-semibold text-helix-accent uppercase tracking-wider">System Architecture</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-helix-text tracking-tight mb-4">
          How Helix Works
        </h1>
        <p className="text-lg text-helix-text-muted max-w-2xl mx-auto">
          A high-performance, modular intelligence pipeline designed for real-time epidemiological inference and digital health twin simulations.
        </p>
      </section>

      {/* Main Architecture Diagram */}
      <section className="max-w-5xl mx-auto bg-helix-surface/50 border border-helix-border rounded-3xl p-10 relative animate-fade-in shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-helix-accent/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col gap-12 relative z-10">
          
          {/* TOP: Data Sources */}
          <div>
            <h3 className="text-xs font-bold text-helix-text-muted uppercase tracking-widest text-center mb-6">Data Ingestion Layer</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'OpenWeather', icon: '☁️', type: 'API', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
                { name: 'WHO Datasets', icon: '📊', type: 'Static/Batch', color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' },
                { name: 'Symptom Reports', icon: '🩺', type: 'User Input', color: 'text-helix-warning', bg: 'bg-helix-warning/10', border: 'border-helix-warning/20' },
                { name: 'Wearables', icon: '⌚', type: 'Telemetry', color: 'text-helix-success', bg: 'bg-helix-success/10', border: 'border-helix-success/20' },
              ].map((src, i) => (
                <div key={i} className={`flex flex-col items-center p-4 rounded-xl border ${src.border} ${src.bg} backdrop-blur-sm`}>
                  <span className="text-2xl mb-2">{src.icon}</span>
                  <span className={`text-sm font-semibold ${src.color}`}>{src.name}</span>
                  <span className="text-[10px] text-helix-text-muted mt-1 uppercase">{src.type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Flow Arrows Down */}
          <div className="flex justify-center -my-6 relative z-0">
            <svg width="200" height="40" viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 0V38M100 38L95 30M100 38L105 30" stroke="#374151" strokeWidth="2" />
              <path d="M30 0V20C30 25 35 30 40 30H95" stroke="#374151" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M170 0V20C170 25 165 30 160 30H105" stroke="#374151" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
          </div>

          {/* MIDDLE: Processing Layers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Frontend */}
            <div className="bg-[#111827] border border-[#61DAFB]/30 rounded-2xl p-6 text-center shadow-[0_0_15px_rgba(97,218,251,0.05)]">
              <div className="w-12 h-12 bg-[#61DAFB]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-[#61DAFB] text-xl font-bold">React</span>
              </div>
              <h3 className="text-white font-bold mb-1">Frontend Client</h3>
              <p className="text-xs text-helix-text-muted mb-4">Vite + Tailwind v4</p>
              <ul className="text-[11px] text-left space-y-2 text-helix-text-muted/80 bg-black/20 p-3 rounded-lg border border-white/5">
                <li>• State Management</li>
                <li>• Map Visualization</li>
                <li>• Live SSE Streams</li>
              </ul>
            </div>

            {/* Core API */}
            <div className="bg-[#111827] border border-[#009688]/30 rounded-2xl p-6 text-center shadow-[0_0_15px_rgba(0,150,136,0.05)] relative">
              <div className="absolute top-1/2 -left-3 -translate-y-1/2 text-helix-border text-2xl hidden md:block">⇄</div>
              <div className="absolute top-1/2 -right-3 -translate-y-1/2 text-helix-border text-2xl hidden md:block">⇄</div>
              
              <div className="w-12 h-12 bg-[#009688]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-[#009688] text-xl font-bold">Fast</span>
              </div>
              <h3 className="text-white font-bold mb-1">Backend API</h3>
              <p className="text-xs text-helix-text-muted mb-4">FastAPI + Python</p>
              <ul className="text-[11px] text-left space-y-2 text-helix-text-muted/80 bg-black/20 p-3 rounded-lg border border-white/5">
                <li>• Auth & Routing</li>
                <li>• SQLite Operations</li>
                <li>• SSE Alert Engine</li>
              </ul>
            </div>

            {/* ML Service */}
            <div className="bg-[#111827] border border-[#FF6F00]/30 rounded-2xl p-6 text-center shadow-[0_0_15px_rgba(255,111,0,0.05)]">
              <div className="w-12 h-12 bg-[#FF6F00]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-[#FF6F00] text-xl font-bold">ML</span>
              </div>
              <h3 className="text-white font-bold mb-1">ML Service (Port 8001)</h3>
              <p className="text-xs text-helix-text-muted mb-4">Scikit-Learn + TF</p>
              <ul className="text-[11px] text-left space-y-2 text-helix-text-muted/80 bg-black/20 p-3 rounded-lg border border-white/5">
                <li>• ARIMA/Prophet/LSTM</li>
                <li>• SHAP Explanations</li>
                <li>• CV & Speech NLP</li>
              </ul>
            </div>

          </div>

          {/* Flow Arrows Down */}
          <div className="flex justify-center -my-6 relative z-0">
            <svg width="20" height="40" viewBox="0 0 20 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0V38M10 38L5 30M10 38L15 30" stroke="#374151" strokeWidth="2" />
            </svg>
          </div>

          {/* BOTTOM: Output Layer */}
          <div>
            <h3 className="text-xs font-bold text-helix-text-muted uppercase tracking-widest text-center mb-6">Intelligence Outputs</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Predictions', icon: '📈', border: 'border-helix-text/10' },
                { name: 'Real-time Alerts', icon: '🚨', border: 'border-helix-danger/20' },
                { name: 'Risk Scores', icon: '🛡️', border: 'border-indigo-400/20' },
                { name: 'XAI Reports', icon: '🧠', border: 'border-helix-accent/20' },
              ].map((out, i) => (
                <div key={i} className={`bg-helix-surface border ${out.border} p-4 rounded-xl flex items-center justify-center gap-3 shadow-md`}>
                  <span className="text-xl">{out.icon}</span>
                  <span className="text-sm font-semibold text-helix-text">{out.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Scalability Diagram */}
      <section className="max-w-6xl mx-auto mt-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-helix-success/10 border border-helix-success/20 mb-4">
            <span className="text-xl">📈</span>
            <span className="text-sm font-semibold text-helix-success uppercase tracking-wider">Evolution & Scalability</span>
          </div>
          <h2 className="text-3xl font-bold text-helix-text mb-4">Architectural Growth Path</h2>
          <p className="text-helix-text-muted">From hackathon MVP to a highly available, globally distributed intelligence network.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Connecting line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-helix-border hidden md:block -z-10 -translate-y-1/2" />
          
          {[
            { phase: 'MVP', sub: 'Today', arch: 'Monolith (Local)', desc: 'FastAPI + React + SQLite on single machine', icon: '💻', color: 'text-helix-success', bg: 'bg-helix-success/10', border: 'border-helix-success/30' },
            { phase: 'Phase 2', sub: '6 Months', arch: 'Managed Cloud', desc: 'AWS/GCP VMs, PostgreSQL, Redis Cache', icon: '☁️', color: 'text-helix-warning', bg: 'bg-helix-warning/10', border: 'border-helix-warning/30' },
            { phase: 'Phase 3', sub: '18 Months', arch: 'Microservices', desc: 'Dockerized services, API Gateway, Message Queues', icon: '🧩', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
            { phase: 'Phase 4', sub: '36 Months', arch: 'Kubernetes', desc: 'Multi-region K8s cluster, Auto-scaling, Edge Inference', icon: '☸️', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
          ].map((stage, i) => (
            <div key={i} className={`bg-helix-surface border ${stage.border} rounded-3xl p-6 relative group hover:-translate-y-2 transition-transform shadow-lg`}>
              <div className={`w-16 h-16 ${stage.bg} rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto shadow-inner`}>
                {stage.icon}
              </div>
              <div className="text-center">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${stage.color} block mb-1`}>{stage.phase} • {stage.sub}</span>
                <h3 className="text-lg font-bold text-helix-text mb-2">{stage.arch}</h3>
                <p className="text-xs text-helix-text-muted">{stage.desc}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Cloud Logos */}
        <div className="mt-12 pt-8 border-t border-helix-border/50 flex flex-wrap justify-center items-center gap-8 opacity-50">
          <div className="text-xl font-black tracking-tighter text-white flex items-center gap-2"><span className="text-orange-500">aws</span></div>
          <div className="text-xl font-bold tracking-tighter text-white flex items-center gap-1"><span className="text-blue-500 text-2xl">G</span> Google Cloud</div>
          <div className="text-xl font-bold text-white flex items-center gap-2"><span className="text-blue-500">☸️</span> Kubernetes</div>
          <div className="text-xl font-bold text-white flex items-center gap-2"><span className="text-red-500">🔴</span> Redis</div>
        </div>
      </section>
    </div>
  );
}
