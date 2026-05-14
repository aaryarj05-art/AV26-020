import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-helix-bg flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-helix-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-helix-accent/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-helix-accent/3 rounded-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 animate-fade-in">
        {/* DNA Helix Icon */}
        <div className="mb-8 relative">
          <div className="w-20 h-20 rounded-2xl bg-helix-accent/10 border border-helix-accent/20 flex items-center justify-center animate-pulse-glow">
            <span className="text-4xl">🧬</span>
          </div>
        </div>

        {/* Logo text */}
        <h1 className="text-7xl sm:text-8xl font-black tracking-tighter mb-4">
          <span className="text-helix-text">Hel</span>
          <span className="text-gradient">ix</span>
        </h1>

        {/* Tagline */}
        <p className="text-lg sm:text-xl text-helix-text-muted max-w-lg leading-relaxed mb-2">
          Predictive Biomedical &amp; Public Health Intelligence
        </p>
        <p className="text-sm text-helix-text-muted/60 mb-12">
          AI-powered disease surveillance • Outbreak forecasting • Personal health analytics
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="group relative px-8 py-4 rounded-2xl bg-helix-accent text-helix-bg font-semibold text-base tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,212,255,0.3)] active:scale-95 cursor-pointer"
        >
          <span className="relative z-10 flex items-center gap-2">
            Launch Dashboard
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>

        {/* Version badge */}
        <div className="mt-16 flex items-center gap-2 px-4 py-2 rounded-full border border-helix-border bg-helix-surface/50 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-helix-accent animate-pulse" />
          <span className="text-xs text-helix-text-muted">v0.1.0 — Phase 1</span>
        </div>
      </div>
    </div>
  )
}
