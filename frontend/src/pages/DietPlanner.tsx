import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface Meal {
  name: string;
  category: string;
  calories: number;
  macros: { carbs: number; protein: number; fat: number };
  GI_index: number;
  key_nutrients: string[];
  image_url: string;
}

interface Supplement {
  name: string;
  reason: string;
  dosage: string;
  note: string;
}

export default function DietPlanner() {
  const [riskProfile, setRiskProfile] = useState({ diabetes: 75, heart: 40, stroke: 20, immunity_boost: 0 });
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const planRes = await axios.post('http://localhost:8000/api/diet/generate-plan', { risk_profile: riskProfile });
      setMealPlan(planRes.data);
      
      const suppRes = await axios.get('http://localhost:8000/api/diet/supplements', {
        params: { risk_profile: JSON.stringify(riskProfile) }
      });
      setSupplements(suppRes.data);
    } catch (err) {
      console.error("Error fetching diet data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const res = await axios.post('http://localhost:8000/api/diet/score-meal', {
        meal_name: searchQuery,
        risk_profile: riskProfile
      });
      setSearchResult({ name: searchQuery, score: res.data.score });
    } catch (err) {
      setSearchResult({ name: searchQuery, score: 50, note: "Meal not in database, showing baseline score." });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-helix-success bg-helix-success/10';
    if (score >= 60) return 'text-helix-warning bg-helix-warning/10';
    return 'text-helix-danger bg-helix-danger/10';
  };

  const macroData = mealPlan ? [
    { name: 'Carbs', value: mealPlan[selectedDay]["Lunch"].macros.carbs },
    { name: 'Protein', value: mealPlan[selectedDay]["Lunch"].macros.protein },
    { name: 'Fat', value: mealPlan[selectedDay]["Lunch"].macros.fat },
  ] : [];

  const COLORS = ['#00D4FF', '#10B981', '#F59E0B'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-helix-text-muted">
        <div className="w-16 h-16 border-4 border-helix-accent/20 border-t-helix-accent rounded-full animate-spin mb-6" />
        <p className="text-xl font-medium">Synthesizing Nutritional Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-helix-background p-8 pb-24 text-helix-text animate-fade-in">
      <div className="flex items-center gap-4 mb-10">
        <span className="text-4xl">🥗</span>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">AI <span className="text-helix-accent">Diet Planner</span></h1>
          <p className="text-sm text-helix-text-muted">Personalized nutrition based on predictive health markers</p>
        </div>
      </div>

      {/* Risk Profile Context */}
      <div className="bg-helix-surface border border-helix-border rounded-3xl p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-bold mb-1">Risk-Adjusted Configuration</h2>
          <p className="text-xs text-helix-text-muted">Your plan is optimized for these primary risk vectors</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className={`px-4 py-2 rounded-full text-xs font-bold border ${riskProfile.diabetes > 60 ? 'border-helix-danger bg-helix-danger/10 text-helix-danger' : 'border-helix-border'}`}>
            Diabetes: {riskProfile.diabetes > 60 ? 'High' : 'Normal'}
          </div>
          <div className={`px-4 py-2 rounded-full text-xs font-bold border ${riskProfile.heart > 60 ? 'border-helix-danger bg-helix-danger/10 text-helix-danger' : 'border-helix-border'}`}>
            Heart: {riskProfile.heart > 60 ? 'High' : 'Normal'}
          </div>
          <div className={`px-4 py-2 rounded-full text-xs font-bold border ${riskProfile.stroke > 60 ? 'border-helix-danger bg-helix-danger/10 text-helix-danger' : 'border-helix-border'}`}>
            Stroke: {riskProfile.stroke > 60 ? 'High' : 'Normal'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weekly Calendar & Meals */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex bg-helix-surface border border-helix-border rounded-2xl p-1 overflow-x-auto scrollbar-hide">
            {Object.keys(mealPlan).map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-1 min-w-[100px] py-3 rounded-xl text-sm font-bold transition-all ${selectedDay === day ? 'bg-helix-accent text-black shadow-lg shadow-helix-accent/20' : 'text-helix-text-muted hover:text-helix-text'}`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["Breakfast", "Lunch", "Dinner", "Snacks"].map(category => {
              const meal = mealPlan[selectedDay][category];
              const score = 85; // Mock score for UI
              return (
                <div key={category} className="bg-helix-surface border border-helix-border rounded-[2.5rem] overflow-hidden group hover:border-helix-accent/50 transition-all shadow-xl">
                  <div className="relative h-40 overflow-hidden">
                    <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {category}
                    </div>
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold ${getScoreColor(score)}`}>
                      Score: {score}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">{meal.name}</h3>
                    <div className="flex justify-between items-center text-xs text-helix-text-muted mb-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-helix-text">{meal.calories}</span>
                        <span>kcal</span>
                      </div>
                      <div className="h-8 w-px bg-helix-border" />
                      <div className="flex flex-col gap-1 text-center">
                        <span className="font-bold text-helix-text">{meal.macros.protein}g</span>
                        <span>Protein</span>
                      </div>
                      <div className="h-8 w-px bg-helix-border" />
                      <div className="flex flex-col gap-1 text-right">
                        <span className="font-bold text-helix-text">{meal.macros.carbs}g</span>
                        <span>Carbs</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedMeal(meal)}
                        className="flex-1 py-3 bg-helix-surface-light border border-helix-border rounded-xl text-xs font-bold hover:bg-helix-accent hover:text-black hover:border-helix-accent transition-all"
                      >
                        Details
                      </button>
                      <button className="px-4 py-3 bg-black/40 border border-helix-border rounded-xl text-xs hover:border-helix-accent transition-all">
                        🔄 Swap
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Stats & Supplements */}
        <div className="lg:col-span-4 space-y-8">
          {/* Nutrition Summary */}
          <div className="bg-helix-surface border border-helix-border rounded-[2.5rem] p-8 shadow-xl">
            <h3 className="text-sm font-bold text-helix-text-muted uppercase tracking-widest mb-8">Daily Macros (Target)</h3>
            <div className="h-48 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                {macroData.map((m, i) => (
                  <div key={m.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-[10px] font-bold text-helix-text-muted uppercase">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-helix-text-muted font-bold">Calories</span>
                  <span className="font-bold">1,450 / 1,800 kcal</span>
                </div>
                <div className="h-1.5 w-full bg-helix-border rounded-full overflow-hidden">
                  <div className="h-full bg-helix-accent rounded-full shadow-[0_0_10px_rgba(0,212,255,0.5)]" style={{ width: '80%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-helix-text-muted font-bold">Protein</span>
                  <span className="font-bold">85 / 120g</span>
                </div>
                <div className="h-1.5 w-full bg-helix-border rounded-full overflow-hidden">
                  <div className="h-full bg-helix-success rounded-full" style={{ width: '70%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Supplement Recommendations */}
          <div className="bg-helix-surface border border-helix-border rounded-[2.5rem] p-8 shadow-xl">
            <h3 className="text-sm font-bold text-helix-text-muted uppercase tracking-widest mb-6">Targeted Supplements</h3>
            <div className="space-y-4">
              {supplements.map((supp, i) => (
                <div key={i} className="p-4 bg-black/20 rounded-2xl border border-white/5 group hover:border-helix-accent/30 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-helix-accent">{supp.name}</h4>
                    <span className="text-[10px] px-2 py-1 bg-white/5 rounded-md text-helix-text-muted font-mono">{supp.dosage}</span>
                  </div>
                  <p className="text-[10px] text-helix-text-muted leading-relaxed mb-2">{supp.reason}</p>
                  <p className="text-[9px] text-helix-warning italic font-medium">⚠️ {supp.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Search & Score */}
          <div className="bg-helix-accent/10 border border-helix-accent/30 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-helix-accent/10 rounded-full blur-3xl" />
            <h3 className="text-sm font-bold text-helix-accent uppercase tracking-widest mb-4">Is this good for me?</h3>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="Search food..." 
                className="flex-1 bg-black/30 border border-helix-accent/20 rounded-xl p-3 text-xs outline-none focus:border-helix-accent transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                onClick={handleSearch}
                className="p-3 bg-helix-accent text-black rounded-xl font-bold"
              >
                🔍
              </button>
            </div>
            {searchResult && (
              <div className="p-4 bg-black/40 rounded-2xl border border-helix-accent/20 animate-fade-in">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm">{searchResult.name}</span>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${getScoreColor(searchResult.score)}`}>{searchResult.score}</span>
                </div>
                <p className="text-[10px] text-helix-text-muted">{searchResult.score >= 70 ? 'Safe to consume. Aligns with your risk profile.' : 'Limit intake. May negatively impact your health markers.'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Meal Details Modal */}
      {selectedMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-helix-surface border border-helix-border w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="h-64 md:h-full overflow-hidden">
                <img src={selectedMeal.image_url} alt={selectedMeal.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold">{selectedMeal.name}</h2>
                    <span className="text-sm text-helix-accent">{selectedMeal.category}</span>
                  </div>
                  <button onClick={() => setSelectedMeal(null)} className="text-helix-text-muted hover:text-helix-text text-xl">✕</button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-black/30 p-4 rounded-2xl text-center">
                    <p className="text-[10px] text-helix-text-muted uppercase font-bold mb-1">Calories</p>
                    <p className="font-bold">{selectedMeal.calories}</p>
                  </div>
                  <div className="bg-black/30 p-4 rounded-2xl text-center">
                    <p className="text-[10px] text-helix-text-muted uppercase font-bold mb-1">Protein</p>
                    <p className="font-bold">{selectedMeal.macros.protein}g</p>
                  </div>
                  <div className="bg-black/30 p-4 rounded-2xl text-center">
                    <p className="text-[10px] text-helix-text-muted uppercase font-bold mb-1">GI Index</p>
                    <p className="font-bold">{selectedMeal.GI_index}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-xs font-bold text-helix-text-muted uppercase tracking-widest mb-3">Key Nutrients</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMeal.key_nutrients.map(nut => (
                      <span key={nut} className="px-3 py-1 bg-helix-accent/10 text-helix-accent text-[10px] font-bold rounded-full border border-helix-accent/20">
                        {nut}
                      </span>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedMeal(null)}
                  className="w-full py-4 bg-helix-accent text-black font-bold rounded-2xl shadow-lg shadow-helix-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Add to Diary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
