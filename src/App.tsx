import React, { useState, useEffect } from 'react';
import { railwayEngine } from './services/railwayEngine';
import { Train, ActiveDisruption, DashboardStats } from './types/railway';
import { TopNav } from './components/TopNav';
import { TrainMap } from './components/TrainMap';
import { PassengerView } from './components/PassengerView';
import { StationBoard } from './components/StationBoard';
import { ControlDashboard } from './components/ControlDashboard';
import { DisruptionModal } from './components/DisruptionModal';
import { ScalabilityModal } from './components/ScalabilityModal';
import { ProjectInfoModal } from './components/ProjectInfoModal';
import { ToastNotification, ToastMessage } from './components/ToastNotification';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'passenger' | 'station' | 'control' | 'scalability'>('map');
  const [trains, setTrains] = useState<Train[]>(() => railwayEngine.getTrains());
  const [activeDisruptions, setActiveDisruptions] = useState<ActiveDisruption[]>(() => railwayEngine.getActiveDisruptions());
  const [selectedTrainId, setSelectedTrainId] = useState<string>('12951');
  const [beforeAfterMode, setBeforeAfterMode] = useState<'ML_DYNAMIC' | 'STATIC_SCHEDULE'>('ML_DYNAMIC');
  
  // Modals
  const [isDisruptionModalOpen, setIsDisruptionModalOpen] = useState(false);
  const [isScalabilityModalOpen, setIsScalabilityModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  
  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'alert' | 'success' | 'info', title: string, message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev.slice(-3), { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Subscribe to live engine updates
  useEffect(() => {
    railwayEngine.startSimulation();
    const unsubscribe = railwayEngine.subscribe((updatedTrains, updatedDisruptions) => {
      setTrains([...updatedTrains]);
      setActiveDisruptions([...updatedDisruptions]);
    });

    // Welcome Toast for SIH
    setTimeout(() => {
      addToast(
        'info',
        'RailDrishti AI Live ML Engine Active',
        'Simulating 50 coaching trains across 5 national trunk corridors. XGBoost+LSTM ensemble active.'
      );
    }, 1000);

    return () => {
      unsubscribe();
      railwayEngine.stopSimulation();
    };
  }, []);

  const handleToggleBeforeAfter = () => {
    const newMode = railwayEngine.toggleBeforeAfter();
    setBeforeAfterMode(newMode);
    if (newMode === 'STATIC_SCHEDULE') {
      addToast(
        'info',
        'Viewing Static Timetable Mode',
        'Displaying baseline static schedule timetables (legacy IRCTC mode without live ML correction).'
      );
    } else {
      addToast(
        'success',
        'ML Dynamic ETA Mode Restored',
        'Displaying real-time XGBoost + LSTM ensemble predictions with P10–P90 confidence bounds.'
      );
    }
  };

  const handleInjectDisruption = (sectionCode: string, delayMin: number, type: string) => {
    const result = railwayEngine.injectDisruption(sectionCode, delayMin, type);
    addToast(
      'alert',
      `ETA Changed by +${delayMin} min due to ${type}`,
      `Disruption applied to section ${sectionCode}. ${result.affected_trains_count} coaching trains updated in real-time!`
    );
  };

  const handleClearAllDisruptions = () => {
    railwayEngine.clearAllDisruptions();
    addToast(
      'success',
      'All Track Disruptions Cleared',
      'Track circuits clear. Line speed restrictions lifted and normal schedules recovering.'
    );
  };

  const handleExportCSV = () => {
    const csvContent = railwayEngine.exportPredictionsToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `RailDrishti_Dynamic_ETA_Predictions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Predictions Exported', 'Downloaded complete dynamic ETA dataset to CSV.');
  };

  const handlePrintReport = () => {
    window.print();
  };

  const dashboardStats: DashboardStats = railwayEngine.getDashboardStats();

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col font-sans select-none">
      {/* Top Navigation Bar */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'scalability') {
            setIsScalabilityModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        beforeAfterMode={beforeAfterMode}
        onToggleBeforeAfter={handleToggleBeforeAfter}
        onOpenDisruption={() => setIsDisruptionModalOpen(true)}
        onOpenInfo={() => setIsInfoModalOpen(true)}
        onExportCSV={handleExportCSV}
        activeDisruptionsCount={activeDisruptions.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'map' && (
          <TrainMap
            trains={trains}
            selectedTrainId={selectedTrainId}
            onSelectTrain={(id) => {
              setSelectedTrainId(id);
              if (!id) return;
            }}
            beforeAfterMode={beforeAfterMode}
          />
        )}

        {activeTab === 'passenger' && (
          <PassengerView
            trains={trains}
            selectedTrainId={selectedTrainId}
            onSelectTrain={setSelectedTrainId}
            beforeAfterMode={beforeAfterMode}
          />
        )}

        {activeTab === 'station' && (
          <StationBoard
            trains={trains}
            onSelectTrain={(id) => {
              setSelectedTrainId(id);
              setActiveTab('passenger');
            }}
            beforeAfterMode={beforeAfterMode}
          />
        )}

        {activeTab === 'control' && (
          <ControlDashboard
            stats={dashboardStats}
            onSelectTrain={(id) => {
              setSelectedTrainId(id);
              setActiveTab('passenger');
            }}
            onOpenDisruption={() => setIsDisruptionModalOpen(true)}
          />
        )}
      </main>

      {/* Disruption Simulation Modal */}
      <DisruptionModal
        isOpen={isDisruptionModalOpen}
        onClose={() => setIsDisruptionModalOpen(false)}
        onInject={handleInjectDisruption}
        onClearAll={handleClearAllDisruptions}
        activeDisruptions={activeDisruptions}
      />

      {/* Scalability Proof & Load Testing Modal */}
      <ScalabilityModal
        isOpen={isScalabilityModalOpen}
        onClose={() => setIsScalabilityModalOpen(false)}
      />

      {/* SIH Hackathon Project Info Modal */}
      <ProjectInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        onPrintReport={handlePrintReport}
      />

      {/* Toast Notifications */}
      <ToastNotification
        toasts={toasts}
        onDismiss={handleDismissToast}
      />
    </div>
  );
}
