import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// CSS for the critical pulse animation
const pulseCSS = `
  @keyframes critical-pulse {
    0% { stroke-width: 1; stroke-opacity: 1; }
    100% { stroke-width: 20; stroke-opacity: 0; }
  }
  .critical-pulse path {
    animation: critical-pulse 1.5s infinite ease-out;
  }
  .slide-panel-enter {
    transform: translateX(100%);
  }
  .slide-panel-enter-active {
    transform: translateX(0);
    transition: transform 300ms ease-in-out;
  }
`;

function HeatmapLayer({ points, visible }: { points: any[], visible: boolean }) {
  const map = useMap();
  const heatRef = useRef<any>(null);
  
  useEffect(() => {
    if (!map || !points.length) return;
    
    if (visible && !heatRef.current) {
      // @ts-ignore
      heatRef.current = L.heatLayer(points, {
        radius: 35,
        blur: 25,
        maxZoom: 10,
        gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
      }).addTo(map);
    } else if (!visible && heatRef.current) {
      map.removeLayer(heatRef.current);
      heatRef.current = null;
    }
    
    return () => {
      if (heatRef.current) {
        map.removeLayer(heatRef.current);
        heatRef.current = null;
      }
    };
  }, [map, points, visible]);
  
  return null;
}

export default function OutbreakMap() {
  const [mapData, setMapData] = useState<any[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [selectedDisease, setSelectedDisease] = useState('All');
  const [forecastMode, setForecastMode] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showZones, setShowZones] = useState(true);
  
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regionDetails, setRegionDetails] = useState<any>(null);
  
  // Animation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(29); // 0 to 29
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Inject CSS
    const style = document.createElement('style');
    style.innerHTML = pulseCSS;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const fetchMapData = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/map/heatmap-data?forecast_mode=${forecastMode}`);
      const data = await res.json();
      setMapData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTimelineData = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/map/timeline`);
      const data = await res.json();
      setTimelineData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, [forecastMode]);

  useEffect(() => {
    fetchTimelineData();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = setInterval(() => {
        setCurrentDayIndex(prev => {
          if (prev >= 29) {
            setIsPlaying(false);
            return 29;
          }
          return prev + 1;
        });
      }, 500); // 2fps for visibility
    } else if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    return () => { if (animationRef.current) clearInterval(animationRef.current); };
  }, [isPlaying]);

  const loadRegionDetail = async (city: string) => {
    setSelectedRegion(city);
    try {
      const res = await fetch(`http://localhost:8000/api/map/region/${city}`);
      const data = await res.json();
      setRegionDetails(data);
    } catch (err) {
      console.error(err);
    }
  };

  const getRiskColor = (level: string) => {
    switch(level) {
      case "Critical": return "#EF4444";
      case "High": return "#F59E0B";
      case "Medium": return "#EAB308";
      default: return "#10B981";
    }
  };

  const getDiseaseIcon = (disease: string) => {
    switch(disease) {
      case "Dengue": return "🦟";
      case "Malaria": return "🦠";
      case "Cholera": return "💧";
      case "Influenza": return "🤧";
      default: return "🦠";
    }
  };

  // Determine which data to show based on timeline
  const activeData = isPlaying || currentDayIndex < 29 
    ? mapData.map(d => {
        const tlDay = timelineData[currentDayIndex]?.data.find((t: any) => t.city === d.city);
        if (tlDay) {
          const risk = tlDay.risk_score;
          let level = "Low";
          if (risk > 80) level = "Critical";
          else if (risk > 50) level = "High";
          else if (risk > 30) level = "Medium";
          return { ...d, risk_score: risk, risk_level: level };
        }
        return d;
      })
    : mapData;

  const filteredData = activeData.filter(d => selectedDisease === 'All' || d.top_disease === selectedDisease);
  const heatPoints = filteredData.map(d => [d.lat, d.lng, d.risk_score / 100]);

  const COLORS = ['#00D4FF', '#F59E0B', '#EF4444', '#10B981'];

  return (
    <div className="h-[calc(100vh-120px)] flex gap-4 animate-fade-in relative overflow-hidden">
      
      {/* LEFT CONTROL PANEL */}
      <div className="w-64 bg-helix-surface border border-helix-border rounded-3xl p-5 flex flex-col gap-6 overflow-y-auto z-10 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-helix-text mb-1">Intelligence <span className="text-helix-accent">Map</span></h2>
          <p className="text-[10px] text-helix-text-muted">Bio-spatial visualization</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-helix-text-muted uppercase tracking-widest">Disease Filter</h3>
          {['All', 'Dengue', 'Malaria', 'Cholera', 'Influenza'].map(disease => (
            <button
              key={disease}
              onClick={() => setSelectedDisease(disease)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${selectedDisease === disease ? 'bg-helix-accent/20 text-helix-accent border border-helix-accent/30' : 'bg-helix-bg text-helix-text-muted hover:bg-helix-surface-light border border-transparent'}`}
            >
              {disease === 'All' ? '🌐 ' : getDiseaseIcon(disease) + ' '} {disease}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-helix-text-muted uppercase tracking-widest">Layers & Modes</h3>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-8 h-4 rounded-full transition-colors relative ${forecastMode ? 'bg-helix-accent' : 'bg-helix-bg border border-helix-border'}`}>
               <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${forecastMode ? 'left-4.5' : 'left-0.5'}`} />
            </div>
            <span className="text-xs text-helix-text group-hover:text-helix-accent transition-colors">Forecast Mode (2W)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-8 h-4 rounded-full transition-colors relative ${showZones ? 'bg-helix-accent' : 'bg-helix-bg border border-helix-border'}`}>
               <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${showZones ? 'left-4.5' : 'left-0.5'}`} />
            </div>
            <span className="text-xs text-helix-text group-hover:text-helix-accent transition-colors">Risk Zones</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-8 h-4 rounded-full transition-colors relative ${showHeatmap ? 'bg-helix-accent' : 'bg-helix-bg border border-helix-border'}`}>
               <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${showHeatmap ? 'left-4.5' : 'left-0.5'}`} />
            </div>
            <span className="text-xs text-helix-text group-hover:text-helix-accent transition-colors">Symptom Heatmap</span>
          </label>
        </div>
      </div>

      {/* MAP CONTAINER */}
      <div className="flex-1 rounded-3xl border border-helix-border overflow-hidden relative z-0">
        <MapContainer 
          center={[20.5937, 78.9629]} 
          zoom={5} 
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          
          <HeatmapLayer points={heatPoints} visible={showHeatmap} />
          
          {showZones && filteredData.map((city, idx) => {
            const isCritical = city.risk_level === 'Critical';
            // Scale radius based on cases: min 15, max 60
            const radius = Math.max(15, Math.min(60, Math.sqrt(city.cases) * 1.5));
            
            return (
              <CircleMarker
                key={`${idx}-${currentDayIndex}`} // Force re-render on data change for animation
                center={[city.lat, city.lng]}
                radius={radius}
                fillColor={getRiskColor(city.risk_level)}
                color={getRiskColor(city.risk_level)}
                weight={isCritical ? 2 : 1}
                fillOpacity={0.4}
                className={isCritical ? 'critical-pulse' : ''}
                eventHandlers={{
                  click: () => loadRegionDetail(city.city)
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[200px] space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-black text-[#0D1421] leading-none">{city.city}</h3>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{city.state}</span>
                      </div>
                      <div className="text-xl">{getDiseaseIcon(city.top_disease)}</div>
                    </div>
                    
                    <div className="space-y-1">
                       <div className="flex justify-between text-[10px] font-bold text-gray-600 uppercase">
                          <span>Risk Score</span>
                          <span style={{ color: getRiskColor(city.risk_level) }}>{city.risk_score}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                             className="h-full rounded-full transition-all duration-500"
                             style={{ width: `${city.risk_score}%`, backgroundColor: getRiskColor(city.risk_level) }}
                          />
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                       <div className="bg-gray-50 p-2 rounded border border-gray-100">
                          <p className="text-[8px] text-gray-400 uppercase font-bold">Active Cases</p>
                          <p className="text-sm font-black text-gray-800">{city.cases.toLocaleString()}</p>
                       </div>
                       <div className="bg-gray-50 p-2 rounded border border-gray-100">
                          <p className="text-[8px] text-gray-400 uppercase font-bold">7-Day Trend</p>
                          <p className={`text-xs font-black ${city.trend === 'Rising' ? 'text-red-500' : city.trend === 'Declining' ? 'text-green-500' : 'text-yellow-500'}`}>
                             {city.trend === 'Rising' ? '↑ Rising' : city.trend === 'Declining' ? '↓ Declining' : '→ Stable'}
                          </p>
                       </div>
                    </div>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); loadRegionDetail(city.city); }}
                      className="w-full py-1.5 bg-[#00D4FF] text-white font-bold text-[10px] uppercase tracking-widest rounded shadow-md hover:bg-[#00A3CC] transition-colors"
                    >
                      View Full Report
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* MAP LEGEND */}
        <div className="absolute bottom-6 right-6 z-[1000] bg-helix-surface/90 backdrop-blur-md border border-helix-border p-4 rounded-2xl space-y-4">
           <div>
             <h4 className="text-[10px] font-bold text-helix-text-muted uppercase tracking-widest mb-2">Risk Level</h4>
             <div className="space-y-2">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-helix-danger animate-pulse shadow-[0_0_8px_#EF4444]" />
                   <span className="text-[10px] font-bold text-helix-text">Critical (81-100)</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                   <span className="text-[10px] text-helix-text">High (51-80)</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-[#EAB308]" />
                   <span className="text-[10px] text-helix-text">Medium (31-50)</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-helix-success" />
                   <span className="text-[10px] text-helix-text">Low (0-30)</span>
                </div>
             </div>
           </div>
           <div className="pt-3 border-t border-helix-border">
              <h4 className="text-[10px] font-bold text-helix-text-muted uppercase tracking-widest mb-2">Volume</h4>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full border border-helix-text-muted" />
                 <div className="w-4 h-4 rounded-full border border-helix-text-muted" />
                 <div className="w-6 h-6 rounded-full border border-helix-text-muted" />
                 <span className="text-[9px] text-helix-text-muted">Proportional Cases</span>
              </div>
           </div>
        </div>

        {/* TIMELINE SCRUBBER */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-helix-surface/90 backdrop-blur-md border border-helix-border p-3 rounded-2xl w-96 flex items-center gap-4">
           <button 
             onClick={() => {
                if (isPlaying) setIsPlaying(false);
                else {
                   if (currentDayIndex >= 29) setCurrentDayIndex(0);
                   setIsPlaying(true);
                }
             }}
             className="w-8 h-8 rounded-full bg-helix-accent text-helix-bg flex items-center justify-center hover:brightness-110 transition-all flex-shrink-0"
           >
             {isPlaying ? '⏸' : '▶'}
           </button>
           <div className="flex-1">
              <div className="flex justify-between text-[8px] font-bold text-helix-text-muted uppercase tracking-widest mb-1">
                 <span>-30 Days</span>
                 <span className="text-helix-accent">Day {currentDayIndex - 30 + 1}</span>
                 <span>Live</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="29" 
                value={currentDayIndex}
                onChange={(e) => {
                   setIsPlaying(false);
                   setCurrentDayIndex(parseInt(e.target.value));
                }}
                className="w-full accent-helix-accent"
              />
           </div>
        </div>
      </div>

      {/* REGION DETAIL SLIDE-IN PANEL */}
      {selectedRegion && regionDetails && (
         <div className="absolute top-0 right-0 h-full w-96 bg-helix-surface border-l border-helix-border p-6 overflow-y-auto z-[2000] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] transform transition-transform duration-300">
            <button 
              onClick={() => setSelectedRegion(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-helix-bg text-helix-text hover:bg-helix-danger hover:text-white transition-colors"
            >
              ✕
            </button>
            
            <div className="mb-8 pr-8">
               <h2 className="text-2xl font-black text-helix-text">{regionDetails.city}</h2>
               <p className="text-xs font-bold text-helix-text-muted uppercase tracking-widest">Region Intelligence Report</p>
            </div>

            <div className="space-y-8">
               {/* Active Alerts */}
               {regionDetails.active_alerts > 0 && (
                  <div className="p-4 bg-helix-danger/10 border border-helix-danger/20 rounded-xl flex items-start gap-3">
                     <span className="text-xl">🚨</span>
                     <div>
                        <h4 className="text-xs font-bold text-helix-danger uppercase tracking-widest">Active Alerts</h4>
                        <p className="text-sm text-helix-text mt-1">{regionDetails.active_alerts} critical symptom spikes detected in the last 24h.</p>
                     </div>
                  </div>
               )}

               {/* Breakdown */}
               <div>
                  <h3 className="text-[10px] font-bold text-helix-text-muted uppercase tracking-widest mb-4">Disease Breakdown</h3>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={regionDetails.disease_breakdown}
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {regionDetails.disease_breakdown.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0D1421', border: '1px solid #1F2937', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               {/* Case Trend */}
               <div>
                  <h3 className="text-[10px] font-bold text-helix-text-muted uppercase tracking-widest mb-4">30-Day Trajectory</h3>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={regionDetails.case_trend}>
                        <defs>
                          <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0D1421', border: '1px solid #1F2937', borderRadius: '8px' }}
                          labelStyle={{ display: 'none' }}
                        />
                        <Area type="monotone" dataKey="cases" stroke="#00D4FF" fillOpacity={1} fill="url(#colorCases)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               {/* Weather Correlation */}
               <div className="bg-helix-bg border border-helix-border p-4 rounded-xl">
                  <h3 className="text-[10px] font-bold text-helix-text-muted uppercase tracking-widest mb-3">Environmental Modifiers</h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                     <div>
                        <span className="text-lg">🌡️</span>
                        <p className="text-sm font-bold text-helix-text mt-1">{regionDetails.weather_correlation.temperature}°C</p>
                     </div>
                     <div>
                        <span className="text-lg">💧</span>
                        <p className="text-sm font-bold text-helix-text mt-1">{regionDetails.weather_correlation.humidity}%</p>
                     </div>
                     <div>
                        <span className="text-lg">🌧️</span>
                        <p className="text-sm font-bold text-helix-text mt-1">{regionDetails.weather_correlation.rainfall}mm</p>
                     </div>
                  </div>
               </div>

               <button className="w-full py-3 bg-helix-bg border border-helix-border hover:bg-helix-accent hover:border-helix-accent hover:text-helix-bg text-helix-text font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all">
                  Download Full PDF Report
               </button>
            </div>
         </div>
      )}
    </div>
  );
}
