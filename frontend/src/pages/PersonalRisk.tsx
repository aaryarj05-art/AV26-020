import React, { useState } from 'react';
import WhyThisPrediction from '../components/WhyThisPrediction';

const RiskGauge = ({ value, label, category, condition, userData }: { value: number; label: string; category: string; condition: string; userData: any }) => {
  const percentage = value * 100;
  
  const getColor = (cat: string) => {
    if (cat === 'High') return '#EF4444';
    if (cat === 'Moderate') return '#F59E0B';
    return '#10B981';
  };

  return (
    <div className="flex flex-col items-center p-6 bg-helix-surface border border-helix-border rounded-2xl">
      <div className="relative w-32 h-20 overflow-hidden">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#1F2937"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={getColor(category)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="125.6"
            strokeDashoffset={125.6 * (1 - percentage / 100)}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-xl font-bold text-helix-text">{percentage.toFixed(0)}%</span>
        </div>
      </div>
      <p className="mt-2 text-[10px] font-bold text-helix-text-muted uppercase tracking-widest">{label}</p>
      <span className={`text-[9px] font-black uppercase mt-1 ${category === 'High' ? 'text-helix-danger' : category === 'Moderate' ? 'text-helix-warning' : 'text-helix-success'}`}>
        {category} Risk
      </span>
      
      <div className="w-full mt-4">
        <WhyThisPrediction 
          type="personal" 
          condition={condition} 
          userData={userData} 
        />
      </div>
    </div>
  );
};

export default function PersonalRisk() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [formData, setFormData] = useState({
    age: 35,
    sex: 'male',
    weight: 75,
    height: 175,
    glucose: 100,
    bp_systolic: 120,
    cholesterol: 180,
    smoking: 0,
    active: 1,
    family_diabetes: 0,
    family_heart: 0,
    family_stroke: 0
  });

  const bmi = (formData.weight / ((formData.height / 100) ** 2)).toFixed(1);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/personal/risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, bmi: parseFloat(bmi) })
      });
      const data = await res.json();
      setResults(data);
      localStorage.setItem('helix_assessment_complete', 'true');
      setStep(5);
    } catch (err) {
      console.error("Risk assessment failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-helix-text tracking-tight">
          Individual <span className="text-helix-accent">Health Analysis</span>
        </h1>
        <p className="text-helix-text-muted">Predictive risk assessment for chronic conditions</p>
      </div>

      <div className="bg-helix-surface border border-helix-border rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex h-1 bg-helix-bg">
          <div 
            className="bg-helix-accent transition-all duration-500" 
            style={{ width: `${(step / 5) * 100}%` }} 
          />
        </div>

        <div className="p-8 sm:p-12">
          {step === 1 && (
            <div className="space-y-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-helix-text">Basic Profile</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-helix-text-muted uppercase tracking-widest">Age</label>
                  <input 
                    type="number" value={formData.age}
                    onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                    className="w-full bg-helix-bg border border-helix-border rounded-xl p-4 text-helix-text outline-none focus:border-helix-accent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-helix-text-muted uppercase tracking-widest">Sex</label>
                  <div className="flex gap-4">
                    {['male', 'female'].map(s => (
                      <button
                        key={s}
                        onClick={() => setFormData({...formData, sex: s})}
                        className={`flex-1 p-4 rounded-xl border text-sm font-bold uppercase tracking-widest transition-all ${
                          formData.sex === s ? 'border-helix-accent bg-helix-accent/10 text-helix-accent' : 'border-helix-border bg-helix-bg text-helix-text-muted'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-helix-text-muted uppercase tracking-widest">Weight (kg)</label>
                  <input 
                    type="number" value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value)})}
                    className="w-full bg-helix-bg border border-helix-border rounded-xl p-4 text-helix-text outline-none focus:border-helix-accent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-helix-text-muted uppercase tracking-widest">Height (cm)</label>
                  <input 
                    type="number" value={formData.height}
                    onChange={(e) => setFormData({...formData, height: parseInt(e.target.value)})}
                    className="w-full bg-helix-bg border border-helix-border rounded-xl p-4 text-helix-text outline-none focus:border-helix-accent"
                  />
                </div>
              </div>
              <div className="p-4 bg-helix-bg rounded-xl border border-helix-border flex items-center justify-between">
                <span className="text-sm font-medium text-helix-text-muted">Calculated BMI</span>
                <span className={`text-xl font-bold ${parseFloat(bmi) > 25 ? 'text-helix-warning' : 'text-helix-success'}`}>{bmi}</span>
              </div>
              <div className="flex justify-end">
                <button onClick={handleNext} className="bg-helix-accent text-helix-bg px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-helix-accent/20">Continue</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-helix-text">Vitals & Markers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-helix-text-muted uppercase tracking-widest">Systolic Blood Pressure</label>
                  <input 
                    type="number" value={formData.bp_systolic}
                    onChange={(e) => setFormData({...formData, bp_systolic: parseInt(e.target.value)})}
                    className="w-full bg-helix-bg border border-helix-border rounded-xl p-4 text-helix-text outline-none focus:border-helix-accent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-helix-text-muted uppercase tracking-widest">Fasting Glucose (mg/dL)</label>
                  <input 
                    type="number" value={formData.glucose}
                    onChange={(e) => setFormData({...formData, glucose: parseInt(e.target.value)})}
                    className="w-full bg-helix-bg border border-helix-border rounded-xl p-4 text-helix-text outline-none focus:border-helix-accent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-helix-text-muted uppercase tracking-widest">Total Cholesterol</label>
                  <input 
                    type="number" value={formData.cholesterol}
                    onChange={(e) => setFormData({...formData, cholesterol: parseInt(e.target.value)})}
                    className="w-full bg-helix-bg border border-helix-border rounded-xl p-4 text-helix-text outline-none focus:border-helix-accent"
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <button onClick={handleBack} className="text-helix-text-muted text-xs font-bold uppercase tracking-widest">Back</button>
                <button onClick={handleNext} className="bg-helix-accent text-helix-bg px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all">Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-helix-text">Lifestyle Factors</h2>
              <div className="space-y-6">
                <div className="space-y-4">
                  <p className="text-sm font-medium text-helix-text">Do you smoke currently?</p>
                  <div className="flex gap-4">
                    {[0, 1].map(v => (
                      <button
                        key={v}
                        onClick={() => setFormData({...formData, smoking: v})}
                        className={`flex-1 p-4 rounded-xl border text-sm font-bold uppercase transition-all ${
                          formData.smoking === v ? 'border-helix-accent bg-helix-accent/10 text-helix-accent' : 'border-helix-border bg-helix-bg text-helix-text-muted'
                        }`}
                      >
                        {v === 1 ? 'Yes' : 'No'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-sm font-medium text-helix-text">Physical Activity Level</p>
                  <div className="flex gap-4">
                    {[0, 1].map(v => (
                      <button
                        key={v}
                        onClick={() => setFormData({...formData, active: v})}
                        className={`flex-1 p-4 rounded-xl border text-sm font-bold uppercase transition-all ${
                          formData.active === v ? 'border-helix-accent bg-helix-accent/10 text-helix-accent' : 'border-helix-border bg-helix-bg text-helix-text-muted'
                        }`}
                      >
                        {v === 1 ? 'Active' : 'Sedentary'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <button onClick={handleBack} className="text-helix-text-muted text-xs font-bold uppercase tracking-widest">Back</button>
                <button onClick={handleNext} className="bg-helix-accent text-helix-bg px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all">Continue</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-helix-text">Family History</h2>
              <div className="space-y-4">
                {[
                  { id: 'family_diabetes', label: 'Diabetes in immediate family' },
                  { id: 'family_heart', label: 'Heart Disease in immediate family' },
                  { id: 'family_stroke', label: 'Stroke in immediate family' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setFormData(prev => ({...prev, [item.id]: prev[item.id as keyof typeof prev] ? 0 : 1}))}
                    className={`w-full p-6 rounded-2xl border text-left flex justify-between items-center transition-all ${
                      formData[item.id as keyof typeof formData] ? 'border-helix-accent bg-helix-accent/10' : 'border-helix-border bg-helix-bg'
                    }`}
                  >
                    <span className={`text-sm font-medium ${formData[item.id as keyof typeof formData] ? 'text-helix-accent' : 'text-helix-text'}`}>{item.label}</span>
                    <div className={`w-6 h-6 rounded-md border flex items-center justify-center ${formData[item.id as keyof typeof formData] ? 'border-helix-accent bg-helix-accent text-helix-bg' : 'border-helix-border'}`}>
                      {formData[item.id as keyof typeof formData] ? '✓' : ''}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <button onClick={handleBack} className="text-helix-text-muted text-xs font-bold uppercase tracking-widest">Back</button>
                <button onClick={handleSubmit} disabled={loading} className="bg-helix-accent text-helix-bg px-12 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-helix-accent/20">
                  {loading ? 'Synthesizing...' : 'Generate Health Twin'}
                </button>
              </div>
            </div>
          )}

          {step === 5 && results && (
            <div className="space-y-10 animate-scale-in">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-helix-text">Assessment <span className="text-helix-accent">Complete</span></h2>
                <p className="text-helix-text-muted mt-2">Personal risk vectors identified and categorized</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <RiskGauge 
                  value={results.diabetes.risk_probability} 
                  label="Diabetes" 
                  category={results.diabetes.risk_category}
                  condition="diabetes"
                  userData={formData}
                />
                <RiskGauge 
                  value={results.heart.risk_probability} 
                  label="Heart Disease" 
                  category={results.heart.risk_category}
                  condition="heart"
                  userData={formData}
                />
                <RiskGauge 
                  value={results.stroke.risk_probability} 
                  label="Stroke" 
                  category={results.stroke.risk_category}
                  condition="stroke"
                  userData={formData}
                />
              </div>

              <div className="bg-helix-bg/50 border border-helix-border rounded-3xl p-8 space-y-6">
                <h3 className="text-sm font-bold text-helix-text uppercase tracking-widest">Critical Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.heart.top_risk_factors?.length > 0 ? (
                    <div className="p-5 rounded-2xl bg-helix-surface border border-helix-border">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xl">🫀</span>
                        <h4 className="font-bold text-helix-text">Targeted Mitigation</h4>
                      </div>
                      <p className="text-xs text-helix-text-muted leading-relaxed">
                        Top risk drivers identified: <span className="text-helix-accent font-bold">{results.heart.top_risk_factors.join(", ")}</span>. 
                        Recommend focus on BP management and LDL reduction.
                      </p>
                    </div>
                  ) : null}
                  <div className="p-5 rounded-2xl bg-helix-surface border border-helix-border">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xl">🏃</span>
                      <h4 className="font-bold text-helix-text">Lifestyle Optimization</h4>
                    </div>
                    <p className="text-xs text-helix-text-muted leading-relaxed">
                      {parseFloat(bmi) > 25 ? 'Weight management is priority. Target 5-10% reduction to lower overall risk across all conditions.' : 'Continue current activity levels. Focus on dietary fiber and glucose stability.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 p-4 rounded-xl border border-helix-border text-xs font-bold uppercase tracking-widest text-helix-text hover:bg-helix-surface-light"
                >
                  Retake Assessment
                </button>
                <button className="flex-1 bg-helix-accent text-helix-bg p-4 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-helix-accent/20">
                  Export PDF Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
