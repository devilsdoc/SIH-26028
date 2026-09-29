import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Zap, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Clock 
} from 'lucide-react';
import { ActiveDisruption } from '../types/railway';

interface DisruptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInject: (sectionCode: string, delayMin: number, type: string) => void;
  onClearAll: () => void;
  activeDisruptions: ActiveDisruption[];
}

const SECTIONS = [
  { code: 'CNB-PRYJ', name: 'Kanpur Central (CNB) - Prayagraj (PRYJ)', corridor: 'Delhi - Howrah Trunk' },
  { code: 'GZB-ALJN', name: 'Ghaziabad (GZB) - Aligarh Jn (ALJN)', corridor: 'Delhi - Howrah Trunk' },
  { code: 'MTJ-KOTA', name: 'Mathura (MTJ) - Kota Jn (KOTA)', corridor: 'Delhi - Mumbai Western' },
  { code: 'KYN-PUNE', name: 'Kalyan (KYN) - Pune Jn (PUNE)', corridor: 'Mumbai - Chennai Deccan' },
  { code: 'KZJ-BPQ', name: 'Kazipet (KZJ) - Balharshah (BPQ)', corridor: 'Bengaluru - Delhi Grand South' },
  { code: 'JTJ-SA', name: 'Jolarpettai (JTJ) - Salem Jn (SA)', corridor: 'Chennai - Coimbatore Kongu' }
];

const DISRUPTION_TYPES = [
  { label: 'Signal & Interlocking Failure', delay: 18, desc: 'Automatic block signal failure; trains restricted to 15 km/h pilot run.' },
  { label: 'Heavy Monsoon Waterlogging', delay: 25, desc: 'Track track-circuit failure and speed restriction to 20 km/h.' },
  { label: 'Overhead Equipment (OHE) Breakdown', delay: 35, desc: 'Traction power trip; single-line token working in section.' },
  { label: 'Urgent Track Fractures Repair', delay: 12, desc: 'Temporary speed restriction 30 km/h imposed by permanent way inspector.' }
];

export const DisruptionModal: React.FC<DisruptionModalProps> = ({
  isOpen,
  onClose,
  onInject,
  onClearAll,
  activeDisruptions
}) => {
  const [selectedSection, setSelectedSection] = useState(SECTIONS[0].code);
  const [selectedTypeIdx, setSelectedTypeIdx] = useState(0);

  if (!isOpen) return null;

  const currentType = DISRUPTION_TYPES[selectedTypeIdx];

  const handleTrigger = () => {
    onInject(selectedSection, currentType.delay, currentType.label);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-[#0f172a] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-950 via-[#1e1b4b] to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block font-mono">
                SIH Judge Demo Scenario
              </span>
              <h2 className="text-lg font-black text-white">Simulate Real-Time Rail Disruption</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-300 leading-relaxed">
            Inject a live real-time operational failure on a selected rail corridor. Watch the XGBoost + LSTM dynamic prediction engine recalculate ETAs instantly across the map, passenger cards, and station displays.
          </p>

          {/* Section Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Target Railway Corridor Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-red-500"
            >
              {SECTIONS.map((sec) => (
                <option key={sec.code} value={sec.code}>
                  {sec.name} ({sec.corridor})
                </option>
              ))}
            </select>
          </div>

          {/* Incident Type Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Incident Category &amp; Severity</label>
            <div className="grid grid-cols-1 gap-2">
              {DISRUPTION_TYPES.map((type, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedTypeIdx(idx)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedTypeIdx === idx
                      ? 'bg-red-950/40 border-red-500 shadow-md ring-1 ring-red-500/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">{type.label}</span>
                    <span className="text-xs font-mono font-bold text-red-400">
                      +{type.delay} min delay
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{type.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Disruptions List */}
          {activeDisruptions.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400">Currently Active Disruptions ({activeDisruptions.length})</span>
                <button
                  onClick={onClearAll}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" /> Clear All &amp; Restore Speed
                </button>
              </div>
              {activeDisruptions.map(d => (
                <div key={d.id} className="text-[11px] text-slate-300 flex items-center justify-between font-mono bg-slate-950/60 p-1.5 rounded">
                  <span>{d.disruption_type} [{d.section_code}]</span>
                  <span className="text-red-400">+{d.delay_increment}m ({d.affected_trains_count} trains affected)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between gap-3">
          {activeDisruptions.length > 0 && (
            <button
              onClick={onClearAll}
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              Reset Disruptions
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>

            <button
              onClick={handleTrigger}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-lg shadow-lg border border-red-400/40 transition-all"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Inject Disruption (+{currentType.delay}m)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
