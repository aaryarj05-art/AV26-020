import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

const CITIES = [
  { name: "Mumbai", coords: [19.0760, 72.8777], region: "Maharashtra" },
  { name: "Delhi", coords: [28.6139, 77.2090], region: "Delhi" },
  { name: "Bangalore", coords: [12.9716, 77.5946], region: "Karnataka" },
  { name: "Chennai", coords: [13.0827, 80.2707], region: "Tamil Nadu" },
  { name: "Kochi", coords: [9.9312, 76.2673], region: "Kerala" },
  { name: "Kolkata", coords: [22.5726, 88.3639], region: "West Bengal" },
  { name: "Hyderabad", coords: [17.3850, 78.4867], region: "Telangana" },
  { name: "Pune", coords: [18.5204, 73.8567], region: "Maharashtra" },
  { name: "Jaipur", coords: [26.9124, 75.7873], region: "Rajasthan" },
  { name: "Lucknow", coords: [26.8467, 80.9462], region: "Uttar Pradesh" }
];

// Heatmap Layer Component (as leaflet.heat needs direct access to the map instance)
function HeatmapLayer({ points }: { points: any[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !points.length) return;
    
    // @ts-ignore
    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
    }).addTo(map);
    
    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);
  
  return null;
}

export default function OutbreakMap() {
  const [selectedDisease, setSelectedDisease] = useState('All');
  const [mapData, setMapData] = useState<any[]>([]);
  const [heatPoints, setHeatPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/dashboard/summary');
        const summary = await res.json();
        
        const processed = CITIES.map(city => {
          const risk = summary.region_risk_matrix[city.region]?.[selectedDisease === 'All' ? 'Dengue' : selectedDisease] || 45;
          return {
            ...city,
            risk,
            cases: Math.floor(risk * 150), // simulation
            trend: risk > 60 ? 'rising' : 'stable'
          };
        });
        setMapData(processed);
        
        // Simulation for heatmap points (symptom reports)
        const mockHeat = CITIES.map(c => [c.coords[0], c.coords[1], Math.random()]);
        setHeatPoints(mockHeat);
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch map data:", err);
      }
    };
    fetchData();
  }, [selectedDisease]);

  const getRiskColor = (risk: number) => {
    if (risk > 80) return "#EF4444"; // red
    if (risk > 60) return "#F59E0B"; // orange
    if (risk > 30) return "#EAB308"; // yellow
    return "#10B981"; // green
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-helix-text">Bio-Spatial <span className="text-helix-accent">Intelligence</span></h1>
          <p className="text-helix-text-muted text-sm">Real-time disease spread and climate correlation mapping</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 bg-helix-surface px-3 py-1.5 rounded-full border border-helix-border">
              <span className="text-[10px] text-helix-text-muted uppercase font-bold tracking-widest">Filter:</span>
              <select 
                value={selectedDisease}
                onChange={(e) => setSelectedDisease(e.target.value)}
                className="bg-transparent text-xs text-helix-text outline-none cursor-pointer"
              >
                <option value="All">All Pathogens</option>
                <option value="Dengue">Dengue</option>
                <option value="Malaria">Malaria</option>
                <option value="Cholera">Cholera</option>
                <option value="Influenza">Influenza</option>
              </select>
           </div>
           
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-helix-danger animate-pulse" />
              <span className="text-[10px] font-bold text-helix-text uppercase tracking-widest">Live Network</span>
           </div>
        </div>
      </div>

      <div className="flex-1 rounded-3xl overflow-hidden border border-helix-border relative z-0">
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
          
          <HeatmapLayer points={heatPoints} />
          
          {mapData.map((city, idx) => (
            <CircleMarker
              key={idx}
              center={city.coords as [number, number]}
              radius={Math.sqrt(city.cases) * 0.8 + 5}
              fillColor={getRiskColor(city.risk)}
              color={getRiskColor(city.risk)}
              weight={1}
              fillOpacity={0.6}
            >
              <Popup>
                <div className="p-1 space-y-2 min-w-[150px]">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold text-helix-text">{city.name}</h3>
                    <span className="text-[10px] text-helix-text-muted font-mono">{city.region}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-helix-bg p-2 rounded-lg border border-helix-border">
                       <p className="text-[8px] text-helix-text-muted uppercase">Risk Score</p>
                       <p className="text-xs font-bold text-helix-accent">{city.risk}%</p>
                    </div>
                    <div className="bg-helix-bg p-2 rounded-lg border border-helix-border">
                       <p className="text-[8px] text-helix-text-muted uppercase">Active Cases</p>
                       <p className="text-xs font-bold text-helix-text">{city.cases.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="pt-1 flex items-center justify-between text-[9px] uppercase tracking-tighter">
                     <span className={city.trend === 'rising' ? 'text-helix-danger' : 'text-helix-success'}>
                        {city.trend === 'rising' ? '▲ Rising Trend' : '▼ Stable Trend'}
                     </span>
                     <button className="text-helix-accent hover:underline">Full Report</button>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
        
        {/* Map Legend Overlay */}
        <div className="absolute bottom-6 left-6 z-[1000] bg-helix-surface/80 backdrop-blur-md border border-helix-border p-4 rounded-2xl space-y-3">
           <h4 className="text-[10px] font-bold text-helix-text-muted uppercase tracking-widest">Risk Level Legend</h4>
           <div className="space-y-2">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-helix-danger" />
                 <span className="text-[10px] text-helix-text">Critical (81-100)</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                 <span className="text-[10px] text-helix-text">High (61-80)</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-[#EAB308]" />
                 <span className="text-[10px] text-helix-text">Moderate (31-60)</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-helix-success" />
                 <span className="text-[10px] text-helix-text">Low (0-30)</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
