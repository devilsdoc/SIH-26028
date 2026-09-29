import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Train, StationPrediction } from '../types/railway';
import { ROUTES_CONFIG, railwayEngine } from '../services/railwayEngine';
import { 
  X, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  Zap, 
  MapPin, 
  Compass, 
  Search, 
  Layers, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface TrainMapProps {
  trains: Train[];
  selectedTrainId: string | null;
  onSelectTrain: (trainId: string) => void;
  beforeAfterMode: 'ML_DYNAMIC' | 'STATIC_SCHEDULE';
}

export const TrainMap: React.FC<TrainMapProps> = ({
  trains,
  selectedTrainId,
  onSelectTrain,
  beforeAfterMode
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const trainMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylinesLayerRef = useRef<L.LayerGroup | null>(null);
  const stationsLayerRef = useRef<L.LayerGroup | null>(null);

  const [routeFilter, setRouteFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected train details
  const selectedTrain = trains.find(t => t.train_id === selectedTrainId) || null;
  const etaData = selectedTrain ? railwayEngine.predictETAForecast(selectedTrain.train_id) : null;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.8, 79.2],
      zoom: 5,
      minZoom: 4,
      maxZoom: 12,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dark sleek CartoDB basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    polylinesLayerRef.current = L.layerGroup().addTo(map);
    stationsLayerRef.current = L.layerGroup().addTo(map);

    // Draw route polylines & station points
    ROUTES_CONFIG.forEach(route => {
      const latlngs = route.stations.map(st => [st.lat, st.lon] as [number, number]);
      
      // Track casing
      L.polyline(latlngs, {
        color: '#0f172a',
        weight: 6,
        opacity: 0.8
      }).addTo(polylinesLayerRef.current!);

      // Track main line
      L.polyline(latlngs, {
        color: route.color,
        weight: 3,
        opacity: 0.85,
        dashArray: '8, 6'
      }).addTo(polylinesLayerRef.current!);

      // Stations
      route.stations.forEach(st => {
        const marker = L.circleMarker([st.lat, st.lon], {
          radius: 3.5,
          fillColor: '#94a3b8',
          fillOpacity: 0.9,
          color: '#1e293b',
          weight: 1.5
        });
        marker.bindTooltip(`<b>${st.name}</b> (${st.code})<br/>Distance: ${st.dist} km`, {
          direction: 'top',
          offset: [0, -4]
        });
        marker.addTo(stationsLayerRef.current!);
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update train markers smoothly
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const filteredTrains = trains.filter(t => {
      if (routeFilter !== 'ALL' && t.route_id !== routeFilter) return false;
      if (statusFilter === 'ON_TIME' && t.current_delay_min > 5) return false;
      if (statusFilter === 'DELAYED' && t.current_delay_min <= 5) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return t.train_id.includes(q) || t.train_name.toLowerCase().includes(q);
      }
      return true;
    });

    const activeIds = new Set<string>();

    filteredTrains.forEach(train => {
      activeIds.add(train.train_id);
      const isSelected = train.train_id === selectedTrainId;
      const isLate = train.current_delay_min > 15;
      const isModerate = train.current_delay_min > 5 && train.current_delay_min <= 15;

      const markerColor = isLate ? '#ef4444' : (isModerate ? '#f59e0b' : '#10b981');
      const borderColor = isSelected ? '#ffffff' : markerColor;
      const pulseRing = isLate ? 'animate-ping' : '';

      const customHtml = `
        <div class="relative flex items-center justify-center cursor-pointer train-marker-icon" style="width: 32px; height: 32px;">
          ${isLate ? `<div class="absolute w-8 h-8 rounded-full bg-red-500/30 ${pulseRing}"></div>` : ''}
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-125" style="background-color: ${markerColor}; border: 2px solid ${borderColor};">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect width="16" height="16" x="4" y="3" rx="2"/>
              <path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/>
            </svg>
          </div>
          <div class="absolute -bottom-4 text-[9px] font-mono font-bold px-1 rounded bg-slate-900/90 text-slate-200 border border-slate-700 whitespace-nowrap shadow-sm pointer-events-none">
            ${train.train_id}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: customHtml,
        className: 'train-custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      if (trainMarkersRef.current.has(train.train_id)) {
        const marker = trainMarkersRef.current.get(train.train_id)!;
        marker.setLatLng([train.current_lat, train.current_lon]);
        marker.setIcon(icon);
      } else {
        const marker = L.marker([train.current_lat, train.current_lon], { icon });
        marker.on('click', () => {
          onSelectTrain(train.train_id);
        });
        marker.addTo(map);
        trainMarkersRef.current.set(train.train_id, marker);
      }
    });

    // Remove markers that are no longer in filtered list
    trainMarkersRef.current.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        trainMarkersRef.current.delete(id);
      }
    });
  }, [trains, selectedTrainId, routeFilter, statusFilter, searchQuery, onSelectTrain]);

  // Center on selected train if requested
  const handleCenterTrain = () => {
    if (selectedTrain && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedTrain.current_lat, selectedTrain.current_lon], 8, {
        duration: 1.2
      });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-61px)] bg-[#0b1120] overflow-hidden flex">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-[#0f172a]/95 backdrop-blur-md p-2 rounded-lg border border-slate-700 shadow-xl max-w-[calc(100vw-32px)]">
        {/* Search */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search train no / name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-900/90 text-slate-200 border border-slate-700 rounded-md focus:outline-none focus:border-blue-500 w-48 font-mono placeholder:font-sans"
          />
        </div>

        {/* Route Filter */}
        <select
          value={routeFilter}
          onChange={(e) => setRouteFilter(e.target.value)}
          aria-label="Filter by Railway Route Corridor"
          className="text-xs bg-slate-900/90 text-slate-200 border border-slate-700 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All 5 Corridors (50 Trains)</option>
          <option value="DELHI_MUMBAI">Delhi - Mumbai (Western)</option>
          <option value="DELHI_HOWRAH">Delhi - Howrah (Eastern Trunk)</option>
          <option value="MUMBAI_CHENNAI">Mumbai - Chennai (Deccan)</option>
          <option value="BENGALURU_DELHI">Bengaluru - Delhi (Grand South)</option>
          <option value="CHENNAI_COIMBATORE">Chennai - Coimbatore (Kongu)</option>
        </select>

        {/* Punctuality Filter */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-md border border-slate-700">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${statusFilter === 'ALL' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('ON_TIME')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${statusFilter === 'ON_TIME' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
          >
            On Time (≤5m)
          </button>
          <button
            onClick={() => setStatusFilter('DELAYED')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${statusFilter === 'DELAYED' ? 'bg-red-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
          >
            Delayed (&gt;5m)
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400 border-l border-slate-700 pl-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            On Time
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            6-15 min
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            &gt;15 min
          </span>
        </div>
      </div>

      {/* Side ETA Drawer (when train is selected) */}
      {selectedTrain && (
        <div className="absolute top-4 right-4 z-20 w-96 max-w-[calc(100vw-32px)] max-h-[calc(100vh-90px)] bg-[#0f172a]/95 backdrop-blur-md rounded-xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#172554] to-[#1e1b4b] border-b border-slate-700 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-white font-mono">{selectedTrain.train_id}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-medium border border-blue-400/30">
                  {selectedTrain.category}
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-100">{selectedTrain.train_name}</h2>
              <p className="text-[11px] text-slate-300 flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-400" />
                {selectedTrain.route_name}
              </p>
            </div>
            <button
              onClick={() => onSelectTrain('')}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/60 border-b border-slate-800 text-center font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Current Delay</span>
              <span className={`text-sm font-bold ${selectedTrain.current_delay_min > 15 ? 'text-red-400' : (selectedTrain.current_delay_min > 5 ? 'text-amber-400' : 'text-emerald-400')}`}>
                {selectedTrain.current_delay_min === 0 ? 'ON TIME' : `+${selectedTrain.current_delay_min} min`}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Live Speed</span>
              <span className="text-sm font-bold text-slate-100">{selectedTrain.speed_kmh} km/h</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Next Stop</span>
              <span className="text-xs font-bold text-cyan-400 truncate block">{selectedTrain.next_station_code}</span>
            </div>
          </div>

          {/* Active Disruption Banner if any */}
          {selectedTrain.disrupted_section && (
            <div className="mx-3 mt-3 p-2.5 rounded-lg bg-red-950/80 border border-red-500/50 flex items-start gap-2 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-red-300">Active Disruption Impact</span>
                {selectedTrain.disruption_reason} on section {selectedTrain.disrupted_section}. Speed throttled to {selectedTrain.speed_kmh} km/h.
              </div>
            </div>
          )}

          {/* Center on Train Action */}
          <div className="px-3 pt-2">
            <button
              onClick={handleCenterTrain}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              Focus Locomotive on Map
            </button>
          </div>

          {/* Upcoming Stations Prediction List */}
          <div className="p-3 flex-1 overflow-y-auto space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
              <span>Station / Distance</span>
              <span>{beforeAfterMode === 'ML_DYNAMIC' ? 'ML Dynamic ETA (P10-P90)' : 'Static Timetable'}</span>
            </div>

            {etaData?.predictions.map((p, idx) => {
              const isFirst = idx === 0;
              const hasDelay = p.delay_minutes > 5;

              return (
                <div 
                  key={p.station_code}
                  className={`p-2.5 rounded-lg border transition-all ${
                    isFirst 
                      ? 'bg-blue-950/40 border-blue-600/40' 
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-100">{p.station_name}</span>
                        <span className="text-[10px] font-mono text-slate-400 px-1 rounded bg-slate-800">
                          {p.station_code}
                        </span>
                        {isFirst && (
                          <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                            (Current)
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Platform {p.platform}</span>
                        <span>·</span>
                        <span>{p.distance_from_current_km} km away</span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-xs text-slate-400 line-through">
                          {p.scheduled_arrival}
                        </span>
                        <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                        <span className={`text-sm font-bold ${hasDelay ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {p.predicted_arrival}
                        </span>
                      </div>

                      {beforeAfterMode === 'ML_DYNAMIC' && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Range: [{p.confidence_lower} - {p.confidence_upper}]
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SHAP Factor Attribution Pill for judges */}
                  {beforeAfterMode === 'ML_DYNAMIC' && p.shap_explanations && p.shap_explanations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                      <span className="text-[9px] font-semibold text-slate-400 uppercase block mb-1">
                        Top ML Attribution Factors (SHAP)
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {p.shap_explanations.map((shap, sIdx) => (
                          <span
                            key={sIdx}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${
                              shap.impact > 0 
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40' 
                                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                            }`}
                          >
                            {shap.feature}: {shap.impact > 0 ? `+${shap.impact}m` : `${shap.impact}m`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
