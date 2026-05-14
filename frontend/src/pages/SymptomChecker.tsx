import React, { useState } from 'react';

const SYMPTOMS = [
  { id: 'Fever', icon: '🌡️' },
  { id: 'Cough', icon: '💨' },
  { id: 'Sore Throat', icon: '😫' },
  { id: 'Runny Nose', icon: '🤧' },
  { id: 'Fatigue', icon: '😴' },
  { id: 'Joint Pain', icon: '🦴' },
  { id: 'Rash', icon: '🔴' },
  { id: 'Nausea', icon: '🤢' },
  { id: 'Chills', icon: '🥶' },
  { id: 'Sweating', icon: '💦' },
  { id: 'Headache', icon: '🤕' },
  { id: 'Diarrhea', icon: '🚽' },
  { id: 'Vomiting', icon: '🤮' },
  { id: 'Abdominal Cramps', icon: '😣' },
  { id: 'Shortness of Breath', icon: '🫁' },
  { id: 'Loss of Taste', icon: '👅' },
  { id: 'Loss of Smell', icon: '👃' },
  { id: 'Body Ache', icon: '💥' },
  { id: 'Dizziness', icon: '🌀' },
  { id: 'Loss of Appetite', icon: '🍽️' },
];

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kochi', 'Kolkata', 'Hyderabad', 'Pune', 'Jaipur', 'Lucknow'];

export default function SymptomChecker() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    region: 'Mumbai',
    symptoms: [] as string[],
    severity: 3,
    age_group: 'adult'
  });
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (s: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(s) 
        ? prev.symptoms.filter(item => item !== s)
        : [...prev.symptoms, s]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/symptoms/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setResults(data);
      setStep(4);
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-helix-text tracking-tight">
          Symptom <span className="text-helix-accent">Checker</span>
        </h1>
        <p className="text-helix-text-muted">Anonymized disease screening & risk assessment</p>
      </div>

      {/* Progress Bar */}
      <div className="flex justify-between items-center px-4">
        {[1, 2, 3, 4].map((s) => (
          <div 
            key={s} 
            className={`flex items-center ${s < 4 ? 'flex-1' : ''}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
              step >= s ? 'bg-helix-accent text-helix-bg shadow-lg shadow-helix-accent/20' : 'bg-helix-surface-light text-helix-text-muted'
            }`}>
              {s}
            </div>
            {s < 4 && <div className={`h-1 flex-1 mx-2 rounded-full transition-colors duration-300 ${step > s ? 'bg-helix-accent' : 'bg-helix-surface-light'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-helix-surface border border-helix-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Step 1: Region */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-helix-text">Where are you located?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CITIES.map(city => (
                <button
                  key={city}
                  onClick={() => setFormData({...formData, region: city})}
                  className={`p-4 rounded-xl border text-sm font-medium transition-all ${
                    formData.region === city 
                      ? 'border-helix-accent bg-helix-accent/10 text-helix-accent' 
                      : 'border-helix-border bg-helix-bg text-helix-text-muted hover:border-helix-accent/50'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setStep(2)}
                className="bg-helix-accent text-helix-bg px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-helix-accent/20"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Symptoms */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-helix-text">What are your symptoms?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SYMPTOMS.map(s => (
                <button
                  key={s.id}
                  onClick={() => toggleSymptom(s.id)}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                    formData.symptoms.includes(s.id)
                      ? 'border-helix-accent bg-helix-accent/10 text-helix-accent'
                      : 'border-helix-border bg-helix-bg text-helix-text-muted hover:border-helix-accent/30'
                  }`}
                >
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-[10px] font-bold uppercase text-center">{s.id}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(1)} className="text-helix-text-muted text-xs uppercase font-bold tracking-widest">Back</button>
              <button 
                onClick={() => setStep(3)}
                disabled={formData.symptoms.length === 0}
                className="bg-helix-accent text-helix-bg px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-helix-accent/20 disabled:opacity-50 disabled:scale-100"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-helix-text">Severity of Symptoms</h2>
              <input 
                type="range" min="1" max="5" 
                value={formData.severity}
                onChange={(e) => setFormData({...formData, severity: parseInt(e.target.value)})}
                className="w-full accent-helix-accent h-2 bg-helix-bg rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-helix-text-muted uppercase font-bold">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-helix-text">Age Group</h2>
              <div className="flex gap-4">
                {['Child', 'Adult', 'Senior'].map(age => (
                  <button
                    key={age}
                    onClick={() => setFormData({...formData, age_group: age.toLowerCase()})}
                    className={`flex-1 p-4 rounded-xl border text-sm font-medium transition-all ${
                      formData.age_group === age.toLowerCase()
                        ? 'border-helix-accent bg-helix-accent/10 text-helix-accent'
                        : 'border-helix-border bg-helix-bg text-helix-text-muted'
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(2)} className="text-helix-text-muted text-xs uppercase font-bold tracking-widest">Back</button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="bg-helix-accent text-helix-bg px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-helix-accent/20"
              >
                {loading ? 'Analyzing...' : 'Generate Assessment'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && results && (
          <div className="text-center space-y-6 py-4 animate-scale-in">
            <div className={`w-24 h-24 mx-auto rounded-full border-4 flex items-center justify-center ${
              results.risk_level === 'critical' || results.risk_level === 'high' ? 'border-helix-danger text-helix-danger' : 'border-helix-success text-helix-success'
            }`}>
              <span className="text-3xl font-bold uppercase">{results.risk_level[0]}</span>
            </div>
            
            <div>
              <p className="text-helix-text-muted uppercase text-xs font-bold tracking-widest mb-2">Likely Condition</p>
              <h2 className="text-3xl font-bold text-helix-text">{results.estimated_disease}</h2>
              <p className="text-helix-accent font-mono text-sm">{(results.confidence * 100).toFixed(0)}% Prediction Confidence</p>
            </div>

            <div className="bg-helix-bg/50 border border-helix-border rounded-2xl p-6 text-sm text-helix-text-muted leading-relaxed">
              <p className="mb-4">
                Based on your symptoms in the {formData.region} region, our models indicate a {results.risk_level} risk of {results.estimated_disease}.
              </p>
              <p className="font-medium text-helix-text">
                ⚠️ This is a predictive tool for public health screening and NOT a medical diagnosis. Please consult a qualified professional.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => {setStep(1); setResults(null); setFormData({...formData, symptoms: []})}}
                className="flex-1 p-4 rounded-xl border border-helix-border text-xs font-bold uppercase tracking-widest text-helix-text hover:bg-helix-surface-light"
              >
                Restart Test
              </button>
              <button className="flex-1 bg-helix-accent text-helix-bg p-4 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-helix-accent/20">
                Find Nearest Clinic
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
