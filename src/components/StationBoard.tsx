import React, { useState, useMemo } from 'react';
import { Train } from '../types/railway';
import { railwayEngine, addMinutesToTimeString } from '../services/railwayEngine';
import { 
  Building2, 
  Volume2, 
  Clock, 
  Train as TrainIcon, 
  Sparkles, 
  AlertTriangle, 
  Radio, 
  CheckCircle2 
} from 'lucide-react';

interface StationBoardProps {
  trains: Train[];
  onSelectTrain: (trainId: string) => void;
  beforeAfterMode: 'ML_DYNAMIC' | 'STATIC_SCHEDULE';
}

const MAJOR_STATIONS = [
  { code: 'NDLS', name: 'New Delhi Junction', zone: 'Northern Railway (NR)' },
  { code: 'CNB', name: 'Kanpur Central', zone: 'North Central Railway (NCR)' },
  { code: 'MMCT', name: 'Mumbai Central', zone: 'Western Railway (WR)' },
  { code: 'HWH', name: 'Howrah Junction', zone: 'Eastern Railway (ER)' },
  { code: 'MAS', name: 'MGR Chennai Central', zone: 'Southern Railway (SR)' },
  { code: 'SBC', name: 'KSR Bengaluru City', zone: 'South Western Railway (SWR)' },
  { code: 'PUNE', name: 'Pune Junction', zone: 'Central Railway (CR)' },
  { code: 'KOTA', name: 'Kota Junction', zone: 'West Central Railway (WCR)' },
  { code: 'PRYJ', name: 'Prayagraj Junction', zone: 'North Central Railway (NCR)' },
  { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya', zone: 'East Central Railway (ECR)' }
];

export const StationBoard: React.FC<StationBoardProps> = ({
  trains,
  onSelectTrain,
  beforeAfterMode
}) => {
  const [selectedStationCode, setSelectedStationCode] = useState<string>('NDLS');
  const [isAnnouncing, setIsAnnouncing] = useState(false);

  const selectedStationMeta = MAJOR_STATIONS.find(s => s.code === selectedStationCode) || MAJOR_STATIONS[0];

  // Find trains passing through or terminating at this station
  const arrivingTrains = useMemo(() => {
    const list: any[] = [];

    trains.forEach(train => {
      const stIdx = train.stations.findIndex(s => s.code === selectedStationCode);
      if (stIdx !== -1) {
        const station = train.stations[stIdx];
        const isCurrentOrUpcoming = stIdx >= train.current_station_index;
        
        if (isCurrentOrUpcoming) {
          const forecast = railwayEngine.predictETAForecast(train.train_id);
          const targetPred = forecast?.predictions.find(p => p.station_code === selectedStationCode);

          const scheduled = station.scheduled_arrival;
          const predicted = targetPred?.predicted_arrival || scheduled;
          const delay = targetPred?.delay_minutes ?? train.current_delay_min;
          const platform = station.platform;
          const origin = train.stations[0].name;

          list.push({
            train_id: train.train_id,
            train_name: train.train_name,
            origin,
            scheduled_arrival: scheduled,
            expected_arrival: beforeAfterMode === 'ML_DYNAMIC' ? predicted : scheduled,
            delay_minutes: beforeAfterMode === 'ML_DYNAMIC' ? delay : 0,
            platform,
            status: delay <= 5 ? 'ON TIME' : (delay > 15 ? 'RUNNING LATE' : 'DELAYED'),
            category: train.category,
            distanceAway: targetPred?.distance_from_current_km ?? 0
          });
        }
      }
    });

    // Sort by expected arrival
    return list.sort((a, b) => a.expected_arrival.localeCompare(b.expected_arrival)).slice(0, 10);
  }, [trains, selectedStationCode, beforeAfterMode]);

  const handleSimulateChime = () => {
    setIsAnnouncing(true);
    // Play dual-tone station chime with Web Audio API
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc1.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.3); // A5

      osc2.frequency.setValueAtTime(440.00, audioCtx.currentTime); // A4
      osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.3); // E5

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.9);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 1.0);
      osc2.stop(audioCtx.currentTime + 1.0);
    } catch {
      // Audio fallback
    }

    setTimeout(() => {
      setIsAnnouncing(false);
    }, 3500);
  };

  return (
    <div className="min-h-[calc(100vh-61px)] bg-[#080d1a] p-4 lg:p-8 text-slate-100 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        
        {/* Top Controls & Station Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-amber-400 uppercase font-bold tracking-wider block">
                Electronic Passenger Information Display (PIDS)
              </span>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                {selectedStationMeta.name} ({selectedStationMeta.code})
              </h1>
              <span className="text-xs text-slate-400">{selectedStationMeta.zone}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedStationCode}
              onChange={(e) => setSelectedStationCode(e.target.value)}
              aria-label="Select Railway Station Terminal"
              className="px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-amber-300 font-mono focus:outline-none focus:border-amber-500"
            >
              {MAJOR_STATIONS.map(s => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>

            <button
              onClick={handleSimulateChime}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                isAnnouncing
                  ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>{isAnnouncing ? 'Announcement In Progress...' : 'Play Station Chime'}</span>
            </button>
          </div>
        </div>

        {/* Realistic Railway LED Display Board */}
        <div className="railway-led-board rounded-2xl border-4 border-[#27272a] p-4 lg:p-6 shadow-2xl overflow-hidden relative">
          
          {/* LED Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-amber-500/20 text-xs font-mono font-bold tracking-wider">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
              <span className="led-amber uppercase tracking-widest text-sm font-black">
                INDIAN RAILWAYS // LIVE ARRIVALS &amp; DEPARTURES
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5 led-green">
                <Radio className="w-3.5 h-3.5" />
                GPS Telemetry Online
              </span>
              <span className="led-amber font-mono text-xs">
                {new Date().toLocaleTimeString('en-IN', { hour12: false })} IST
              </span>
            </div>
          </div>

          {/* Announcement Flash Banner if Active */}
          {isAnnouncing && (
            <div className="mt-3 p-2 bg-amber-500/20 border border-amber-500/50 rounded text-center led-amber font-mono text-xs font-bold animate-pulse">
              🔔 "Kripya Dhyan Dijiye: Station {selectedStationMeta.name} par aane wali sabhi gaadiyon ka dynamic samay screen par uplabdh hai."
            </div>
          )}

          {/* Table Container */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left font-mono">
              <thead>
                <tr className="border-b border-amber-500/20 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="pb-3 px-3">Train No</th>
                  <th className="pb-3 px-3">Train Name</th>
                  <th className="pb-3 px-3">From Station</th>
                  <th className="pb-3 px-3 text-center">Sch. Time</th>
                  <th className="pb-3 px-3 text-center">
                    {beforeAfterMode === 'ML_DYNAMIC' ? 'ML Exp. Time' : 'Timetable Time'}
                  </th>
                  <th className="pb-3 px-3 text-center">Delay</th>
                  <th className="pb-3 px-3 text-center">Platform</th>
                  <th className="pb-3 px-3 text-right">Operational Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900/80 text-sm">
                {arrivingTrains.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                      No trains currently scheduled or arriving within the next 4 hours at {selectedStationMeta.name}.
                    </td>
                  </tr>
                ) : (
                  arrivingTrains.map((item, idx) => {
                    const isLate = item.delay_minutes > 5;
                    const isSevere = item.delay_minutes > 15;

                    return (
                      <tr 
                        key={idx}
                        onClick={() => onSelectTrain(item.train_id)}
                        className="hover:bg-amber-500/5 cursor-pointer transition-colors group"
                      >
                        {/* Train No */}
                        <td className="py-3.5 px-3 font-bold led-amber group-hover:text-amber-300">
                          {item.train_id}
                        </td>

                        {/* Train Name */}
                        <td className="py-3.5 px-3 text-slate-200 group-hover:text-white font-sans font-bold">
                          {item.train_name}
                          <span className="block text-[10px] text-slate-400 font-mono">
                            {item.category}
                          </span>
                        </td>

                        {/* Origin */}
                        <td className="py-3.5 px-3 text-slate-300 text-xs font-sans">
                          {item.origin}
                        </td>

                        {/* Sch. Time */}
                        <td className="py-3.5 px-3 text-center text-slate-400">
                          {item.scheduled_arrival}
                        </td>

                        {/* Exp. Time */}
                        <td className="py-3.5 px-3 text-center font-bold text-base">
                          <span className={isSevere ? 'led-red' : (isLate ? 'led-amber' : 'led-green')}>
                            {item.expected_arrival}
                          </span>
                        </td>

                        {/* Delay */}
                        <td className="py-3.5 px-3 text-center text-xs">
                          {item.delay_minutes === 0 ? (
                            <span className="led-green font-bold">RT</span>
                          ) : (
                            <span className={`font-bold ${isSevere ? 'led-red' : 'led-amber'}`}>
                              +{item.delay_minutes} min
                            </span>
                          )}
                        </td>

                        {/* Platform */}
                        <td className="py-3.5 px-3 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                            PF-{item.platform}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3 text-right">
                          <span className={`text-xs font-extrabold tracking-wider ${
                            isSevere ? 'led-red' : (isLate ? 'led-amber' : 'led-green')
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* LED Ticker Footer */}
          <div className="mt-6 pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-slate-400">
            <span className="led-amber">
              ⚡ LIVE ML FORECAST: ETA recalculated continuously using XGBoost gradient boost and downstream sectional track occupancy.
            </span>
            <span className="text-slate-400">
              Showing next {arrivingTrains.length} coaching arrivals
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
