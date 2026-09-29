import React from 'react';
import { 
  Train, 
  MapPin, 
  LayoutDashboard, 
  Tv2, 
  AlertTriangle, 
  Sparkles, 
  Download, 
  Info, 
  Gauge
} from 'lucide-react';

interface TopNavProps {
  activeTab: 'map' | 'passenger' | 'station' | 'control' | 'scalability';
  setActiveTab: (tab: 'map' | 'passenger' | 'station' | 'control' | 'scalability') => void;
  beforeAfterMode: 'ML_DYNAMIC' | 'STATIC_SCHEDULE';
  onToggleBeforeAfter: () => void;
  onOpenDisruption: () => void;
  onOpenInfo: () => void;
  onExportCSV: () => void;
  activeDisruptionsCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  beforeAfterMode,
  onToggleBeforeAfter,
  onOpenDisruption,
  onOpenInfo,
  onExportCSV,
  activeDisruptionsCount
}) => {
  return (
    <header className="flex items-center justify-between px-4 lg:px-6 py-3 bg-[#0d1627] border-b border-slate-800 shrink-0 sticky top-0 z-40 select-none">
      {/* Zone 1: Brand title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#1F3864] border border-blue-500/40 flex items-center justify-center text-amber-400 font-bold shadow-md">
          <Train className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
            RailDrishti AI
            <span className="text-[10px] font-semibold tracking-wider uppercase text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded bg-amber-500/10">
              SIH 2026
            </span>
          </span>
          <span className="text-[11px] text-slate-400">Dynamic Coaching Train ETA & Sectional Congestion Engine</span>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
            activeTab === 'map'
              ? 'bg-[#1F3864] text-white shadow-sm border border-blue-400/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          Live Network Map
        </button>

        <button
          onClick={() => setActiveTab('passenger')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
            activeTab === 'passenger'
              ? 'bg-[#1F3864] text-white shadow-sm border border-blue-400/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Train className="w-3.5 h-3.5 text-emerald-400" />
          Passenger View
        </button>

        <button
          onClick={() => setActiveTab('station')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
            activeTab === 'station'
              ? 'bg-[#1F3864] text-white shadow-sm border border-blue-400/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Tv2 className="w-3.5 h-3.5 text-amber-300" />
          Station LED Board
        </button>

        <button
          onClick={() => setActiveTab('control')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
            activeTab === 'control'
              ? 'bg-[#1F3864] text-white shadow-sm border border-blue-400/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
          Control Room
        </button>

        <button
          onClick={() => setActiveTab('scalability')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
            activeTab === 'scalability'
              ? 'bg-[#1F3864] text-white shadow-sm border border-blue-400/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Gauge className="w-3.5 h-3.5 text-purple-400" />
          Scalability Lab
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2">
        {/* Before vs After ML Toggle */}
        <button
          onClick={onToggleBeforeAfter}
          title="Toggle between Static Schedule Timetable ETA and ML Dynamic XGBoost+LSTM ETA"
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all whitespace-nowrap ${
            beforeAfterMode === 'ML_DYNAMIC'
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{beforeAfterMode === 'ML_DYNAMIC' ? 'ML Dynamic ETA' : 'Static Schedule'}</span>
        </button>

        {/* Simulate Disruption (SIH Judge Showstopper) */}
        <button
          onClick={onOpenDisruption}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 border border-red-400/40 rounded-md shadow-md transition-all whitespace-nowrap relative"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
          <span>Simulate Disruption</span>
          {activeDisruptionsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
          )}
        </button>

        {/* Export CSV */}
        <button
          onClick={onExportCSV}
          title="Download live ETA predictions CSV dataset"
          className="p-1.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Hackathon Project Info */}
        <button
          onClick={onOpenInfo}
          title="SIH Project Architecture & Team Overview"
          className="p-1.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
