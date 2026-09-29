import React, { useState, useEffect } from 'react';
import { Train, StationPrediction } from '../types/railway';
import { railwayEngine } from '../services/railwayEngine';
import { 
  Search, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Navigation, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  Share2, 
  Compass, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';

interface PassengerViewProps {
  trains: Train[];
  selectedTrainId: string;
  onSelectTrain: (trainId: string) => void;
  beforeAfterMode: 'ML_DYNAMIC' | 'STATIC_SCHEDULE';
}

export const PassengerView: React.FC<PassengerViewProps> = ({
  trains,
  selectedTrainId,
  onSelectTrain,
  beforeAfterMode
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Timer for "Last updated X sec ago"
  useEffect(() => {
    setSecondsAgo(0);
    const interval = setInterval(() => {
      setSecondsAgo(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [trains]);

  const activeTrain = trains.find(t => t.train_id === selectedTrainId) || trains[0];
  const etaData = activeTrain ? railwayEngine.predictETAForecast(activeTrain.train_id) : null;

  const filteredTrains = trains.filter(t => {
    if (categoryFilter !== 'ALL' && !t.category.includes(categoryFilter)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return t.train_id.includes(q) || t.train_name.toLowerCase().includes(q) || t.route_name.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-[calc(100vh-61px)] bg-[#0b1120] text-slate-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Train Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Live IRCTC Passenger Assistant
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
                Updated {secondsAgo}s ago
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Dynamic Live Train ETA & Platform Tracker
            </h1>
            <p className="text-xs text-slate-400">
              Machine Learning-predicted accurate arrival times based on live locomotive telemetry, congestion, and weather.
            </p>
          </div>

          {/* Search & Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Find train no / name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 w-56 font-mono placeholder:font-sans"
              />
            </div>

            <select
              value={activeTrain?.train_id || ''}
              onChange={(e) => onSelectTrain(e.target.value)}
              aria-label="Select Coaching Train"
              className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
            >
              {filteredTrains.map(t => (
                <option key={t.train_id} value={t.train_id}>
                  {t.train_id} - {t.train_name} ({t.current_station_code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Train Big Status Card */}
        {activeTrain && (
          <div className="bg-gradient-to-br from-[#121d33] via-[#0f172a] to-[#0d1527] rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-white font-mono tracking-tight">
                    {activeTrain.train_id}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-500/20 text-blue-400 border border-blue-400/30">
                    {activeTrain.category}
                  </span>
                  {activeTrain.current_delay_min <= 5 ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> On Time
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-red-500/20 text-red-400 border border-red-500/30">
                      <AlertCircle className="w-3.5 h-3.5" /> Delayed by {activeTrain.current_delay_min} min
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-100">{activeTrain.train_name}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>{activeTrain.route_name}</span>
                </div>
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 font-sans block">Current Location</span>
                  <span className="text-sm font-bold text-amber-400 block truncate">{activeTrain.current_station}</span>
                  <span className="text-[10px] text-slate-400">Station Code: {activeTrain.current_station_code}</span>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 font-sans block">Next Station</span>
                  <span className="text-sm font-bold text-cyan-400 block truncate">{activeTrain.next_station}</span>
                  <span className="text-[10px] text-slate-400">Code: {activeTrain.next_station_code}</span>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 font-sans block">Locomotive Speed</span>
                  <span className="text-sm font-bold text-emerald-400 block">{activeTrain.speed_kmh} km/h</span>
                  <span className="text-[10px] text-slate-400">GPS Live Telemetry</span>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 font-sans block">Prediction Model</span>
                  <span className="text-xs font-bold text-purple-300 block">XGBoost+LSTM</span>
                  <span className="text-[10px] text-emerald-400">MAE 3.4 min</span>
                </div>
              </div>
            </div>

            {/* Active Disruption Banner */}
            {activeTrain.disrupted_section && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center justify-between text-xs text-red-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>
                    <strong>Disruption Alert:</strong> {activeTrain.disruption_reason} reported on section {activeTrain.disrupted_section}. ETAs dynamically adjusted!
                  </span>
                </div>
                <span className="text-red-300 font-bold font-mono">+{activeTrain.current_delay_min} min impact</span>
              </div>
            )}
          </div>
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Upcoming Station Forecasts
              <span className="text-xs font-mono text-slate-400 font-normal">
                ({etaData?.predictions.length || 0} remaining stops)
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Comparing original timetable scheduled arrival vs ML Dynamic Arrival with 80% confidence interval (P10 - P90).
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SHAP Explainability Active</span>
          </div>
        </div>

        {/* Big ETA Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {etaData?.predictions.map((p, idx) => {
            const isCurrent = idx === 0;
            const isLate = p.delay_minutes > 5;
            const isSevere = p.delay_minutes > 15;

            return (
              <div 
                key={p.station_code}
                className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-blue-950/40 border-blue-500/50 shadow-lg ring-1 ring-blue-500/30'
                    : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Station Title */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">{p.station_name}</span>
                        <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {p.station_code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="text-amber-400 font-semibold">Platform {p.platform}</span>
                        <span>·</span>
                        <span>{p.distance_from_current_km} km away</span>
                      </div>
                    </div>

                    {isCurrent ? (
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                        Current Stop
                      </span>
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isSevere 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                          : (isLate ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30')
                      }`}>
                        {p.delay_minutes === 0 ? 'On Time' : `+${p.delay_minutes}m Late`}
                      </span>
                    )}
                  </div>

                  {/* Arrival Times Comparison */}
                  <div className="mt-5 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="border-r border-slate-800 pr-2">
                        <span className="text-[11px] text-slate-400 block">Scheduled Time</span>
                        <span className="text-lg font-bold text-slate-300 font-mono">
                          {p.scheduled_arrival}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">IRCTC Timetable</span>
                      </div>

                      <div className="pl-2">
                        <span className="text-[11px] text-slate-400 block">
                          {beforeAfterMode === 'ML_DYNAMIC' ? 'ML Dynamic ETA' : 'Static Schedule'}
                        </span>
                        <span className={`text-xl font-extrabold font-mono ${
                          isSevere ? 'text-red-400' : (isLate ? 'text-amber-400' : 'text-emerald-400')
                        }`}>
                          {p.predicted_arrival}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {beforeAfterMode === 'ML_DYNAMIC' ? `Conf: ${Math.round(p.confidence_score * 100)}%` : 'No Live ML'}
                        </span>
                      </div>
                    </div>

                    {/* Confidence Interval Bar */}
                    {beforeAfterMode === 'ML_DYNAMIC' && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                        <span className="text-slate-400">Expected Arrival Range:</span>
                        <span className="font-bold text-slate-200">
                          {p.confidence_lower} — {p.confidence_upper}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SHAP Impact Attribution */}
                {beforeAfterMode === 'ML_DYNAMIC' && p.shap_explanations && p.shap_explanations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Why this prediction? (Top SHAP Drivers)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {p.shap_explanations.map((shap, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800"
                        >
                          <span className="text-slate-300">{shap.feature}:</span>
                          <span className={`font-bold ${shap.impact > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {shap.impact > 0 ? `+${shap.impact}m` : `${shap.impact}m`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
