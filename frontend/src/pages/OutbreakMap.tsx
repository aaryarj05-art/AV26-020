import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { X } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import DiseaseSelector from '../components/DiseaseSelector';
import { useWHODiseases } from '../hooks/useWHODiseases';
import { useRealtimeSocket } from '../hooks/useRealtimeSocket';

const DISEASES = ['All', 'Dengue', 'Malaria', 'Cholera', 'Influenza'];

export default function OutbreakMap() {
  const [selectedDisease, setSelectedDisease] = useState('All');
  const [forecastMode, setForecastMode] = useState(false);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [realtimePoints, setRealtimePoints] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { diseases } = useWHODiseases();
  const { connected, subscribe } = useRealtimeSocket();

  // Subscribe to realtime heatmap points (Phase 4)
  useEffect(() => {
    subscribe('heatmap_points', (payload: any) => {
      if (payload?.points) {
        setRealtimePoints(payload.points);
        setLastUpdated(new Date());
      }
    });
  }, [subscribe]);

  // Time since last update
  const [secondsAgo, setSecondsAgo] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUpdated) {
        setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  // Global map data (static fallback)
  const mapData = [
    { city: 'Mumbai, India', lat: 19.0760, lng: 72.8777, cases: 1240, risk_score: 85, level: 'Critical', top_disease: 'Dengue', trend: 'Rising' },
    { city: 'New York, USA', lat: 40.7128, lng: -74.0060, cases: 850, risk_score: 65, level: 'High', top_disease: 'Influenza', trend: 'Rising' },
    { city: 'London, UK', lat: 51.5074, lng: -0.1278, cases: 420, risk_score: 45, level: 'Medium', top_disease: 'Influenza', trend: 'Stable' },
    { city: 'Sao Paulo, Brazil', lat: -23.5505, lng: -46.6333, cases: 950, risk_score: 75, level: 'High', top_disease: 'Dengue', trend: 'Rising' },
    { city: 'Johannesburg, SA', lat: -26.2041, lng: 28.0473, cases: 310, risk_score: 35, level: 'Medium', top_disease: 'Cholera', trend: 'Declining' },
    { city: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, cases: 150, risk_score: 20, level: 'Low', top_disease: 'Influenza', trend: 'Declining' },
    { city: 'Lagos, Nigeria', lat: 6.5244, lng: 3.3792, cases: 1100, risk_score: 80, level: 'Critical', top_disease: 'Malaria', trend: 'Rising' },
    { city: 'Jakarta, Indonesia', lat: -6.2088, lng: 106.8456, cases: 620, risk_score: 55, level: 'High', top_disease: 'Dengue', trend: 'Stable' },
    { city: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, cases: 80, risk_score: 15, level: 'Low', top_disease: 'Influenza', trend: 'Declining' },
    { city: 'Cairo, Egypt', lat: 30.0444, lng: 31.2357, cases: 280, risk_score: 40, level: 'Medium', top_disease: 'Cholera', trend: 'Stable' },
  ];

  // Merge realtime WHO points with static data
  const mergedRealtimeMarkers = realtimePoints
    .filter(p => p.lat !== 0 && p.lng !== 0)
    .map(p => ({
      city: p.region,
      lat: p.lat,
      lng: p.lng,
      cases: p.caseCount || 100,
      risk_score: Math.round(p.intensity * 100),
      level: p.intensity > 0.8 ? 'Critical' : p.intensity > 0.6 ? 'High' : p.intensity > 0.3 ? 'Medium' : 'Low',
      top_disease: p.disease || 'Unknown',
      trend: 'Stable',
      isRealtime: true,
    }));

  const sparklineData = [
    { value: 10 }, { value: 15 }, { value: 8 }, { value: 12 }, { value: 20 }, { value: 18 }, { value: 25 }
  ];

  const getRiskColor = (score: number) => {
    if (score > 80) return '#DC2626'; // Critical
    if (score > 60) return '#EF4444'; // High
    if (score > 30) return '#F59E0B'; // Medium
    return '#10B981'; // Low
  };

  // Use realtime data if available, fallback to static
  const baseData = mergedRealtimeMarkers.length > 0 ? mergedRealtimeMarkers : mapData;
  const filteredData = baseData.filter(d => selectedDisease === 'All' || d.top_disease === selectedDisease);

  // Apply forecast projections if forecastMode is active
  const displayData = filteredData.map(city => {
    if (!forecastMode) return city;

    let multiplier = 1;
    let riskBump = 0;
    
    if (city.trend === 'Rising') { 
      multiplier = 1.45; 
      riskBump = 15; 
    } else if (city.trend === 'Declining') { 
      multiplier = 0.75; 
      riskBump = -12; 
    } else { 
      multiplier = 1.08; 
      riskBump = 3; 
    }

    const projectedCases = Math.floor(city.cases * multiplier);
    const projectedRisk = Math.min(100, Math.max(0, city.risk_score + riskBump));

    return {
      ...city,
      cases: projectedCases,
      risk_score: projectedRisk,
      isForecast: true
    };
  });

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] overflow-hidden">
      {/* TOP BAR */}
      <div className="h-[48px] px-6 bg-[#0C1220] border-b border-[#1E2D40] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* Disease filter buttons */}
          <div className="flex items-center gap-2">
            {DISEASES.map(disease => (
              <button
                key={disease}
                onClick={() => setSelectedDisease(disease)}
                className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
                  selectedDisease === disease 
                    ? 'bg-[#3B82F6] text-white' 
                    : 'text-[#8A9BB0] hover:text-[#F0F4F8]'
                }`}
              >
                {disease}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-[#1E2D40]" />

          {/* LIVE badge (Phase 4) */}
          {connected && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[11px] font-bold text-[#10B981] uppercase tracking-wider">LIVE</span>
            </div>
          )}

          {/* Last updated timestamp */}
          {lastUpdated && (
            <span className="text-[11px] text-[#4A5568]">
              Updated {secondsAgo}s ago
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[12px] transition-colors ${forecastMode ? 'text-[#3B82F6] font-bold' : 'text-[#8A9BB0]'}`}>
            {forecastMode ? '30-Day Forecast Active' : 'Forecast Mode'}
          </span>
          <button 
            onClick={() => setForecastMode(!forecastMode)}
            className={`w-8 h-4 rounded-full relative transition-colors ${forecastMode ? 'bg-[#3B82F6]' : 'bg-[#1E2D40]'}`}
          >
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${forecastMode ? 'left-4.5' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      {/* MAP AREA */}
      <div className="flex-1 relative">
        <MapContainer 
          center={[20, 0]} 
          zoom={3} 
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          
          {displayData.map((city, idx) => (
            <CircleMarker
              key={idx}
              center={[city.lat, city.lng]}
              radius={Math.sqrt(city.cases) * 0.8 + 5}
              fillColor={getRiskColor(city.risk_score)}
              color={getRiskColor(city.risk_score)}
              weight={1}
              fillOpacity={0.6}
              eventHandlers={{
                click: () => setSelectedCity(city)
              }}
            >
              <Popup>
                <div className="p-3 bg-[#111827] text-[#F0F4F8] rounded-xl border border-[#1E2D40] min-w-[180px]">
                  <div className="font-bold text-[14px] mb-2">{city.city}</div>
                  <div className="space-y-1 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-[#8A9BB0]">{city.isForecast ? 'Proj. Risk:' : 'Risk Score:'}</span>
                      <span style={{ color: getRiskColor(city.risk_score) }}>{city.risk_score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8A9BB0]">{city.isForecast ? 'Proj. Cases:' : 'Active Cases:'}</span>
                      <span>{city.cases}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8A9BB0]">Top Disease:</span>
                      <span>{city.top_disease}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8A9BB0]">7D Trend:</span>
                      <span className={city.trend === 'Rising' ? 'text-[#EF4444]' : 'text-[#10B981]'}>{city.trend}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* LEGEND */}
        <div className="absolute bottom-6 right-6 z-[1000] bg-[#111827]/90 rounded-xl p-3 border border-[#1E2D40] space-y-2">
          {[
            { label: 'Critical', color: '#DC2626' },
            { label: 'High', color: '#EF4444' },
            { label: 'Medium', color: '#F59E0B' },
            { label: 'Low', color: '#10B981' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[11px] text-[#F0F4F8]">{item.label}</span>
            </div>
          ))}
        </div>

        {/* RIGHT PANEL SLIDE-IN */}
        <div className={`absolute top-0 right-0 h-full w-[300px] bg-[#111827] border-l border-[#1E2D40] z-[1001] transition-transform duration-300 ${selectedCity ? 'translate-x-0' : 'translate-x-full'}`}>
          {selectedCity && (
            <div className="p-5 h-full flex flex-col relative">
              <button 
                onClick={() => setSelectedCity(null)}
                className="absolute top-4 right-4 text-[#8A9BB0] hover:text-[#F0F4F8]"
              >
                <X size={20} />
              </button>

              <div className="mb-6 pr-8">
                <h2 className="text-[20px] font-semibold text-[#F0F4F8]">{selectedCity.city}</h2>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-[#8A9BB0] mt-1">REGION REPORT</div>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[11px] font-semibold text-[#8A9BB0] uppercase">Risk Score</span>
                    <span className="text-[14px] font-mono font-bold" style={{ color: getRiskColor(selectedCity.risk_score) }}>{selectedCity.risk_score}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1E2D40] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ width: `${selectedCity.risk_score}%`, backgroundColor: getRiskColor(selectedCity.risk_score) }} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-[11px] text-[#8A9BB0] uppercase">Cases</div>
                    <div className="text-[18px] font-mono font-semibold">{selectedCity.cases}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] text-[#8A9BB0] uppercase">Dominant</div>
                    <div className="text-[14px] font-semibold">{selectedCity.top_disease}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-[#8A9BB0] uppercase mb-4">7-DAY TREND</div>
                  <div className="h-[60px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparklineData}>
                        <Line type="monotone" dataKey="value" stroke={selectedCity.trend === 'Rising' ? '#EF4444' : '#10B981'} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-[#1E2D40]">
                  <div className="text-[11px] font-semibold text-[#8A9BB0] uppercase">ACTIVE ALERTS</div>
                  {[
                    { type: 'Spike', msg: 'Symptom spike in North Mumbai', time: '2h ago' },
                    { type: 'Weather', msg: 'Heavy rainfall predicted', time: '5h ago' },
                  ].map((alert, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0" />
                      <div>
                        <div className="text-[12px] text-[#F0F4F8] font-medium leading-tight">{alert.msg}</div>
                        <div className="text-[11px] text-[#4A5568] mt-1">{alert.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setSelectedCity(null)}
                className="w-full h-10 mt-auto bg-[#1E2D40] text-[#F0F4F8] rounded-lg text-[13px] font-medium hover:bg-[#1A2332] transition-colors"
              >
                Close Panel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
