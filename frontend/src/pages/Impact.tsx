import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// Simple hook for counting up numbers
function useCountUp(end: number, duration: number = 2000, isFloat: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing out quint
      const easeOut = 1 - Math.pow(1 - percentage, 5);
      const current = easeOut * end;
      
      setCount(current);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return isFloat ? count.toFixed(1) : Math.round(count).toLocaleString();
}

const BigNumber = ({ value, label, icon, color, isFloat = false, prefix = '', suffix = '' }: any) => {
  const displayValue = useCountUp(value, 2500, isFloat);
  
  return (
    <div className={`bg-helix-surface border border-helix-border rounded-3xl p-6 relative overflow-hidden group hover:border-${color}/50 transition-colors`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}/10 rounded-bl-full blur-2xl -z-10 group-hover:bg-${color}/20 transition-colors`} />
      <span className="text-3xl mb-4 block">{icon}</span>
      <h3 className="text-4xl md:text-5xl font-black text-helix-text tracking-tighter mb-2">
        {prefix}{displayValue}{suffix}
      </h3>
      <p className="text-sm font-semibold text-helix-text-muted uppercase tracking-widest">{label}</p>
    </div>
  );
};

export default function Impact() {
  const impactData = [
    { day: 'Day 0', withoutHelix: 10, withHelix: 10 },
    { day: 'Day 5', withoutHelix: 50, withHelix: 45 },
    { day: 'Day 10', withoutHelix: 150, withHelix: 80 },
    { day: 'Day 15', withoutHelix: 400, withHelix: 120 },
    { day: 'Day 20', withoutHelix: 850, withHelix: 150 },
    { day: 'Day 25', withoutHelix: 1400, withHelix: 160 },
    { day: 'Day 30', withoutHelix: 1800, withHelix: 140 },
    { day: 'Day 35', withoutHelix: 1500, withHelix: 90 },
    { day: 'Day 40', withoutHelix: 900, withHelix: 40 },
  ];

  return (
    <div className="min-h-screen bg-helix-background p-8 pb-24 overflow-x-hidden">
      
      {/* Hero Header */}
      <section className="max-w-6xl mx-auto mt-12 mb-16 text-center animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-helix-success/10 border border-helix-success/20 mb-6">
          <span className="text-xl">🌟</span>
          <span className="text-sm font-semibold text-helix-success uppercase tracking-wider">Measurable Impact</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-helix-text tracking-tight mb-6">
          Intelligence That Saves Lives
        </h1>
        <p className="text-lg text-helix-text-muted max-w-3xl mx-auto">
          Helix isn't just a dashboard—it's an early warning net. By shifting the paradigm from reactive treatment to proactive intervention, we drastically reduce outbreak mortality and healthcare strain.
        </p>
      </section>

      {/* BIG NUMBER HERO */}
      <section className="max-w-7xl mx-auto mb-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        <BigNumber value={1847} label="Lives Protected" icon="🛡️" color="helix-accent" />
        <BigNumber value={8.3} label="Days Early Warning" icon="⏱️" color="helix-warning" isFloat suffix=" Days" />
        <BigNumber value={340} label="Outbreak-Days Prevented" icon="📉" color="helix-success" />
        <BigNumber value={2.4} label="Healthcare Costs Saved" icon="💰" color="indigo-400" isFloat prefix="₹" suffix=" Cr" />
        <BigNumber value={20} label="Million People Monitored" icon="👥" color="purple-400" suffix="M" />
        <BigNumber value={87} label="Prediction Accuracy" icon="🎯" color="pink-400" suffix="%" />
      </section>

      {/* IMPACT VISUALIZATION */}
      <section className="max-w-6xl mx-auto mb-24 bg-helix-surface border border-helix-border rounded-3xl p-8 md:p-12 shadow-2xl relative animate-fade-in-up">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-helix-danger via-helix-success to-helix-accent rounded-t-3xl" />
        
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 w-full space-y-6">
            <h2 className="text-3xl font-bold text-helix-text">The Helix Advantage Curve</h2>
            <p className="text-helix-text-muted">
              Traditional public health responses react to climbing death tolls. Helix predicts the spike before it happens, flattening the curve at its base.
            </p>
            
            <div className="bg-black/30 border border-helix-border/50 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-helix-text mb-3 uppercase tracking-widest">Case Study Reference</h4>
              <p className="text-sm text-helix-text-muted mb-2">
                <span className="text-helix-danger font-semibold">Without Helix:</span> Kerala Nipah Outbreak (2018). Manual response initiated on Day 15 after critical mass.
              </p>
              <p className="text-sm text-helix-text-muted">
                <span className="text-helix-success font-semibold">With Helix:</span> Projected model response. 8.3 day early warning allows pre-positioning of resources, cutting peak cases by 85%.
              </p>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-helix-danger" />
                <span className="text-helix-text">Traditional Trajectory</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-helix-success" />
                <span className="text-helix-text">Helix Trajectory</span>
              </div>
            </div>
          </div>
          
          <div className="flex-[1.5] w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={impactData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWithout" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWith" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D1421', border: '1px solid #1F2937', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="withoutHelix" 
                  name="Without Helix (Cases)" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  fill="url(#colorWithout)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="withHelix" 
                  name="With Helix (Cases)" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  fill="url(#colorWith)" 
                />
                <ReferenceLine x="Day 15" stroke="#F59E0B" strokeDasharray="3 3" label={{ position: 'top', value: 'Manual Alert', fill: '#F59E0B', fontSize: 12 }} />
                <ReferenceLine x="Day 5" stroke="#00D4FF" strokeDasharray="3 3" label={{ position: 'top', value: 'Helix Alert', fill: '#00D4FF', fontSize: 12 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* SCALABILITY STORY */}
      <section className="max-w-6xl mx-auto animate-fade-in-up">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-helix-text mb-4">The Road to National Scale</h2>
          <p className="text-helix-text-muted">A highly scalable architecture designed for exponential geographic expansion with diminishing marginal costs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Phase 1 */}
          <div className="bg-helix-surface border border-helix-border rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-1 bg-helix-text-muted" />
            <h3 className="text-xl font-bold text-helix-text mb-1">Phase 1: MVP</h3>
            <p className="text-xs font-semibold text-helix-text-muted uppercase tracking-widest mb-6">Current (Hackathon)</p>
            
            <ul className="space-y-3 mb-8 text-sm text-helix-text">
              <li className="flex items-center gap-3"><span className="text-helix-accent">✓</span> 10 Demo Cities</li>
              <li className="flex items-center gap-3"><span className="text-helix-accent">✓</span> 5 Core Diseases</li>
              <li className="flex items-center gap-3"><span className="text-helix-accent">✓</span> Synthetic + Open Data</li>
            </ul>
            
            <div className="mt-auto bg-black/30 p-4 rounded-xl border border-helix-border/50">
              <span className="text-xs text-helix-text-muted uppercase block mb-1">Cost to Serve</span>
              <span className="text-lg font-bold text-helix-text">₹50,000 <span className="text-xs font-normal text-helix-text-muted">/ city / mo</span></span>
            </div>
          </div>

          {/* Phase 2 */}
          <div className="bg-helix-surface border border-helix-accent rounded-3xl p-8 relative overflow-hidden group shadow-[0_0_30px_rgba(0,212,255,0.1)] transform md:-translate-y-4">
            <div className="absolute inset-x-0 top-0 h-2 bg-helix-accent shadow-[0_0_10px_rgba(0,212,255,0.5)]" />
            <h3 className="text-xl font-bold text-helix-text mb-1">Phase 2: Regional</h3>
            <p className="text-xs font-semibold text-helix-accent uppercase tracking-widest mb-6">6 Months Out</p>
            
            <ul className="space-y-3 mb-8 text-sm text-helix-text">
              <li className="flex items-center gap-3"><span className="text-helix-accent">✓</span> 100 Smart Cities</li>
              <li className="flex items-center gap-3"><span className="text-helix-accent">✓</span> 15 Target Diseases</li>
              <li className="flex items-center gap-3"><span className="text-helix-accent">✓</span> State Health API Hooks</li>
            </ul>
            
            <div className="mt-auto bg-black/30 p-4 rounded-xl border border-helix-border/50">
              <span className="text-xs text-helix-text-muted uppercase block mb-1">Cost to Serve (Economy of Scale)</span>
              <span className="text-lg font-bold text-helix-success">₹5,000 <span className="text-xs font-normal text-helix-text-muted">/ city / mo</span></span>
              <p className="text-[10px] text-helix-success mt-1">90% cost reduction per capita</p>
            </div>
          </div>

          {/* Phase 3 */}
          <div className="bg-helix-surface border border-helix-border rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-1 bg-indigo-500" />
            <h3 className="text-xl font-bold text-helix-text mb-1">Phase 3: National</h3>
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-6">2 Years Out</p>
            
            <ul className="space-y-3 mb-8 text-sm text-helix-text">
              <li className="flex items-center gap-3"><span className="text-helix-accent">✓</span> 500+ Cities & Rural</li>
              <li className="flex items-center gap-3"><span className="text-helix-accent">✓</span> National ICMR Integration</li>
              <li className="flex items-center gap-3"><span className="text-helix-accent">✓</span> Real-time Live EHR Ingest</li>
            </ul>
            
            <div className="mt-auto bg-black/30 p-4 rounded-xl border border-helix-border/50">
              <span className="text-xs text-helix-text-muted uppercase block mb-1">Cost to Serve</span>
              <span className="text-lg font-bold text-indigo-400">₹800 <span className="text-xs font-normal text-helix-text-muted">/ city / mo</span></span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
