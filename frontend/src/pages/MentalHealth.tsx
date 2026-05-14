import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Exercise {
  name: string;
  type: string;
  duration_minutes: number;
  instructions: string[];
  benefits: string;
}

const PHQ4_QUESTIONS = [
  "Feeling nervous, anxious or on edge?",
  "Not being able to stop or control worrying?",
  "Little interest or pleasure in doing things?",
  "Feeling down, depressed, or hopeless?"
];

const MOOD_EMOJIS = [
  { score: 1, emoji: '😫' },
  { score: 3, emoji: '😔' },
  { score: 5, emoji: '😐' },
  { score: 7, emoji: '🙂' },
  { score: 10, emoji: '🤩' },
];

export default function MentalHealth() {
  const [step, setStep] = useState(0); // 0: Start, 1: Assessment, 2: Results, 3: Exercises
  const [responses, setResponses] = useState<number[]>([0, 0, 0, 0]);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [moodLogs, setMoodLogs] = useState<any[]>([]);
  const [moodTrend, setMoodTrend] = useState("Stable");
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState("");

  const sessionId = "demo_user_123";

  useEffect(() => {
    fetchMoodTrend();
    fetchExercises();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const fetchMoodTrend = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/mental-health/mood-trend`, {
        params: { user_session_id: sessionId }
      });
      setMoodLogs(res.data.history);
      setMoodTrend(res.data.trend);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExercises = async (level = "Normal") => {
    try {
      const res = await axios.get(`http://localhost:8000/api/mental-health/exercises`, {
        params: { stress_level: level }
      });
      setExercises(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssess = async () => {
    try {
      const res = await axios.post(`http://localhost:8000/api/mental-health/assess`, responses, {
        params: { region_risk: 85, personal_risk: 75 } // Mock risk
      });
      setAssessmentResult(res.data);
      setStep(2);
      setExercises(res.data.recommendations);
    } catch (err) {
      console.error(err);
    }
  };

  const logMood = async () => {
    if (currentMood === null) return;
    try {
      await axios.post(`http://localhost:8000/api/mental-health/mood-log`, null, {
        params: {
          mood_score: currentMood,
          stress_score: assessmentResult?.assessment.score || 0,
          user_session_id: sessionId,
          notes: moodNote
        }
      });
      fetchMoodTrend();
      setCurrentMood(null);
      setMoodNote("");
      alert("Mood logged successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const startExercise = (ex: Exercise) => {
    setActiveExercise(ex);
    setTimer(ex.duration_minutes * 60);
    setIsTimerRunning(true);
  };

  return (
    <div className="min-h-screen bg-helix-background p-8 pb-32 text-helix-text animate-fade-in">
      <div className="flex items-center gap-4 mb-10">
        <span className="text-4xl">🧠</span>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Helix <span className="text-helix-accent">Mental Wellness</span></h1>
          <p className="text-sm text-helix-text-muted">AI-guided support for stress, anxiety, and emotional resilience</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Assessment & Mood */}
        <div className="lg:col-span-7 space-y-8">
          {/* Stress Screener */}
          <div className="bg-helix-surface border border-helix-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <span className="text-8xl">🌡️</span>
            </div>
            
            {step === 0 && (
              <div className="text-center py-6">
                <h2 className="text-2xl font-bold mb-4">Quick Stress Check</h2>
                <p className="text-helix-text-muted mb-8 max-w-md mx-auto italic">A brief 4-question screener to help us recommend the best wellness path for you today.</p>
                <button 
                  onClick={() => setStep(1)}
                  className="px-10 py-4 bg-helix-accent text-black font-bold rounded-2xl hover:scale-105 transition-all shadow-lg shadow-helix-accent/20"
                >
                  Start Assessment
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Mental Health Screener</h2>
                  <span className="text-xs font-mono text-helix-accent">Question {responses.filter((r, i) => i < step).length + 1} of 4</span>
                </div>
                
                {PHQ4_QUESTIONS.map((q, i) => (
                  <div key={i} className="space-y-4">
                    <p className="font-medium">{q}</p>
                    <div className="grid grid-cols-4 gap-2">
                      {["Not at all", "Several days", "More than half", "Nearly every day"].map((label, val) => (
                        <button
                          key={val}
                          onClick={() => {
                            const newRes = [...responses];
                            newRes[i] = val;
                            setResponses(newRes);
                          }}
                          className={`py-3 rounded-xl text-[10px] font-bold border transition-all ${responses[i] === val ? 'bg-helix-accent border-helix-accent text-black shadow-lg shadow-helix-accent/20' : 'bg-black/20 border-helix-border text-helix-text-muted hover:border-white/20'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button 
                  onClick={handleAssess}
                  className="w-full py-4 bg-helix-accent text-black font-bold rounded-2xl shadow-lg shadow-helix-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  See My Results
                </button>
              </div>
            )}

            {step === 2 && assessmentResult && (
              <div className="animate-scale-in">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">Your Results</h2>
                  <div className={`px-4 py-2 rounded-full text-xs font-bold ${
                    assessmentResult.assessment.level === 'Normal' ? 'bg-helix-success/10 text-helix-success border border-helix-success/30' :
                    assessmentResult.assessment.level === 'Mild' ? 'bg-helix-warning/10 text-helix-warning border border-helix-warning/30' :
                    'bg-helix-danger/10 text-helix-danger border border-helix-danger/30'
                  }`}>
                    {assessmentResult.assessment.level} Stress Level
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-5 bg-black/20 rounded-2xl border border-white/5">
                    <h3 className="text-xs font-bold text-helix-text-muted uppercase mb-2">Score</h3>
                    <p className="text-3xl font-bold">{assessmentResult.assessment.score} <span className="text-sm text-helix-text-muted">/ 12</span></p>
                  </div>
                  <div className="p-5 bg-helix-accent/5 rounded-2xl border border-helix-accent/20">
                    <h3 className="text-xs font-bold text-helix-accent uppercase mb-2">Anxiety Index</h3>
                    <p className="text-3xl font-bold">{assessmentResult.anxiety_index}%</p>
                  </div>
                </div>

                <div className="bg-helix-accent/10 border border-helix-accent/30 rounded-2xl p-6 mb-8">
                  <p className="text-sm italic leading-relaxed">
                    "Your region currently has <span className="text-helix-danger font-bold uppercase">High</span> disease outbreak activity. 
                    It is perfectly normal and expected to feel an elevated sense of anxiety in these conditions. 
                    Focus on the exercises we've curated for you."
                  </p>
                </div>

                <button 
                  onClick={() => setStep(0)}
                  className="w-full py-3 border border-helix-border rounded-xl text-xs font-bold hover:bg-helix-surface-light transition-all"
                >
                  Retake Assessment
                </button>
              </div>
            )}
          </div>

          {/* Mood Tracker */}
          <div className="bg-helix-surface border border-helix-border rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold">Mood Tracker</h2>
                <p className="text-xs text-helix-text-muted">Trend: <span className={`font-bold ${moodTrend === 'Improving' ? 'text-helix-success' : moodTrend === 'Declining' ? 'text-helix-danger' : 'text-helix-accent'}`}>{moodTrend}</span></p>
              </div>
              <div className="flex gap-2">
                {MOOD_EMOJIS.map(m => (
                  <button
                    key={m.score}
                    onClick={() => setCurrentMood(m.score)}
                    className={`text-2xl p-2 rounded-xl transition-all ${currentMood === m.score ? 'bg-helix-accent/20 scale-125' : 'hover:bg-white/5'}`}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-48 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodLogs}>
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[0, 10]} hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '8px' }}
                    itemStyle={{ color: '#00D4FF' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#00D4FF" strokeWidth={3} dot={{ fill: '#00D4FF' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex gap-4">
              <input 
                type="text"
                placeholder="How are you feeling today? (optional)"
                className="flex-1 bg-black/20 border border-helix-border rounded-xl p-4 text-sm outline-none focus:border-helix-accent"
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
              />
              <button 
                onClick={logMood}
                disabled={currentMood === null}
                className="px-8 py-4 bg-helix-accent text-black font-bold rounded-xl disabled:opacity-50"
              >
                Log
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Exercises */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-helix-surface border border-helix-border rounded-[2.5rem] p-8 shadow-2xl flex flex-col h-full">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-helix-accent">AI Guided</span> Wellness
            </h2>
            
            <div className="space-y-4 flex-1">
              {exercises.map((ex, i) => (
                <div key={i} className="p-5 bg-black/20 rounded-3xl border border-white/5 group hover:border-helix-accent/50 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold group-hover:text-helix-accent transition-colors">{ex.name}</h4>
                      <span className="text-[10px] text-helix-text-muted uppercase font-bold tracking-widest">{ex.type}</span>
                    </div>
                    <span className="text-xs font-mono text-helix-accent">{ex.duration_minutes}m</span>
                  </div>
                  <p className="text-[10px] text-helix-text-muted mb-4 line-clamp-1">{ex.benefits}</p>
                  <button 
                    onClick={() => startExercise(ex)}
                    className="w-full py-3 bg-helix-surface-light border border-helix-border rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-helix-accent hover:text-black hover:border-helix-accent transition-all"
                  >
                    Start Session
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Mini Crisis Support Card */}
          <div className="bg-helix-danger/5 border border-helix-danger/20 rounded-3xl p-6">
            <h3 className="text-xs font-black text-helix-danger uppercase tracking-widest mb-3">Need Immediate Support?</h3>
            <p className="text-[10px] text-helix-text-muted mb-4 leading-relaxed">Talking to someone can help. These are free, confidential services available 24/7 in India.</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-helix-danger/10">
                <span className="text-xs font-bold">iCall Counselling</span>
                <span className="text-xs font-mono text-helix-danger">9152987821</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-helix-danger/10">
                <span className="text-xs font-bold">Vandrevala Fdn.</span>
                <span className="text-xs font-mono text-helix-danger">1860-2662-345</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Player Modal */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 animate-fade-in backdrop-blur-xl">
          <div className="w-full max-w-2xl bg-helix-surface border border-helix-border rounded-[3rem] overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => { setActiveExercise(null); setIsTimerRunning(false); }}
              className="absolute top-8 right-8 text-helix-text-muted hover:text-helix-text text-2xl"
            >
              ✕
            </button>

            <div className="p-12">
              <div className="text-center mb-12">
                <span className="px-4 py-1 bg-helix-accent/10 text-helix-accent text-[10px] font-bold uppercase rounded-full border border-helix-accent/30 mb-4 inline-block">
                  {activeExercise.type}
                </span>
                <h2 className="text-4xl font-bold mb-2">{activeExercise.name}</h2>
                <p className="text-helix-text-muted text-sm">{activeExercise.benefits}</p>
              </div>

              <div className="flex flex-col items-center justify-center mb-16">
                <div className="text-8xl font-mono font-bold text-helix-accent mb-4 tracking-tighter">
                  {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                </div>
                <div className="w-full max-w-xs h-2 bg-helix-border rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-helix-accent shadow-[0_0_20px_rgba(0,212,255,0.5)] transition-all duration-1000" 
                    style={{ width: `${(timer / (activeExercise.duration_minutes * 60)) * 100}%` }} 
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-bold text-helix-text-muted uppercase tracking-widest text-center">Instructions</h4>
                <div className="grid grid-cols-1 gap-4">
                  {activeExercise.instructions.map((step, i) => (
                    <div key={i} className="flex gap-4 items-start p-4 bg-black/20 rounded-2xl border border-white/5 animate-fade-in" style={{ animationDelay: `${i * 0.2}s` }}>
                      <span className="w-6 h-6 rounded-full bg-helix-accent/10 text-helix-accent text-xs flex items-center justify-center font-bold">{i + 1}</span>
                      <p className="text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 flex gap-4">
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all ${isTimerRunning ? 'bg-helix-surface-light border border-helix-border' : 'bg-helix-accent text-black shadow-lg shadow-helix-accent/20'}`}
                >
                  {isTimerRunning ? '⏸ Pause' : '▶ Resume'}
                </button>
                <button 
                  onClick={() => { setActiveExercise(null); setIsTimerRunning(false); }}
                  className="px-8 py-4 bg-black/40 border border-helix-border rounded-2xl font-bold text-sm"
                >
                  End Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
