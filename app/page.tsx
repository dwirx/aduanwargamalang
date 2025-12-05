'use client';

import { useState, useEffect } from 'react';
import { AuthHeader } from './components/Auth/AuthHeader';
import { QuickFilters } from './components/Filter/QuickFilters';
import { ReportButton } from './components/Report/ReportButton';
import { ReportForm } from './components/Report/ReportForm';
import { ReportDetail } from './components/Report/ReportDetail';
import { CCTVModal } from './components/CCTV/CCTVModal';
import { CCTVPanel } from './components/CCTV/CCTVPanel';
import { AdminPanel } from './components/Admin/AdminPanel';
import { useReports } from './hooks/useReports';
import { useCCTV } from './hooks/useCCTV';
import { useAdmin } from './hooks/useAdmin';
import { FilterType, ReportType, FloodReport } from './lib/types';
import { CCTVCamera } from './lib/cctv-types';

interface LazyMapProps {
  reports: FloodReport[];
  filter: FilterType;
  cameras: CCTVCamera[];
  showCCTV: boolean;
  showLines: boolean;
  onCameraClick: (camera: CCTVCamera) => void;
  onReportClick: (report: FloodReport) => void;
}

function LazyMap({ reports, filter, cameras, showCCTV, showLines, onCameraClick, onReportClick }: LazyMapProps) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    import('./components/Map/MapWrapper').then((mod) => {
      setMapComponent(() => mod.MapWrapper);
    });
  }, []);

  if (!MapComponent) {
    return (
      <div className="h-full w-full bg-zinc-900 flex items-center justify-center">
        <div className="text-yellow-400 font-bold animate-pulse">🗺️ Memuat peta...</div>
      </div>
    );
  }

  return <MapComponent reports={reports} filter={filter} cameras={cameras} showCCTV={showCCTV} showLines={showLines} onCameraClick={onCameraClick} onReportClick={onReportClick} />;
}

export default function Home() {
  const { reports, loading, error, refetch } = useReports();
  const { cameras, loading: cctvLoading } = useCCTV();
  const { isAdmin } = useAdmin();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showForm, setShowForm] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('flood');
  const [mounted, setMounted] = useState(false);
  const [showCCTV, setShowCCTV] = useState(true);
  const [showLines, setShowLines] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<CCTVCamera | null>(null);
  const [selectedReport, setSelectedReport] = useState<FloodReport | null>(null);
  const [showCCTVPanel, setShowCCTVPanel] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReport = (type: ReportType) => {
    setReportType(type);
    setShowForm(true);
  };

  const handleCameraClick = (camera: CCTVCamera) => {
    setSelectedCamera(camera);
  };

  const handleReportClick = (report: FloodReport) => {
    setSelectedReport(report);
  };

  return (
    <main className="h-screen w-screen overflow-hidden relative">
      <AuthHeader />
      
      {/* Map */}
      <div className="h-full w-full pt-14 sm:pt-16">
        {!mounted || loading ? (
          <div className="h-full w-full bg-zinc-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4 animate-bounce">🌊</div>
              <p className="text-yellow-400 font-bold">Memuat data banjir...</p>
            </div>
          </div>
        ) : error ? (
          <div className="h-full w-full bg-zinc-900 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-red-400 font-bold mb-2">Gagal memuat data</p>
              <p className="text-zinc-500 text-sm">{error}</p>
            </div>
          </div>
        ) : (
          <LazyMap 
            reports={reports} 
            filter={filter} 
            cameras={cameras}
            showCCTV={showCCTV}
            showLines={showLines}
            onCameraClick={handleCameraClick}
            onReportClick={handleReportClick}
          />
        )}
      </div>

      {/* Quick Filters */}
      <QuickFilters activeFilter={filter} onFilterChange={setFilter} />

      {/* CCTV & Admin Controls */}
      <div className="fixed top-[60px] sm:top-[72px] right-2 sm:right-4 z-[1000] flex items-center gap-1 sm:gap-2">
        {/* Admin Button */}
        {isAdmin && (
          <button
            onClick={() => setShowAdminPanel(true)}
            className="px-2 sm:px-3 py-1.5 sm:py-2 font-bold text-xs sm:text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all bg-yellow-500 text-black"
          >
            <span className="hidden sm:inline">🔐 Admin</span>
            <span className="sm:hidden">🔐</span>
          </button>
        )}

        {/* CCTV Toggle */}
        <button
          onClick={() => setShowCCTV(!showCCTV)}
          className={`px-2 sm:px-3 py-1.5 sm:py-2 font-bold text-xs sm:text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all ${
            showCCTV ? 'bg-cyan-400 text-black' : 'bg-zinc-700 text-white'
          }`}
        >
          <span className="hidden sm:inline">📹 </span>
          📹{showCCTV ? ' ON' : ' OFF'}
          {!cctvLoading && <span className="ml-1 text-[10px] opacity-80">({cameras.length})</span>}
        </button>

        {/* Lines Toggle */}
        {showCCTV && (
          <button
            onClick={() => setShowLines(!showLines)}
            className={`px-2 sm:px-3 py-1.5 sm:py-2 font-bold text-xs sm:text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all ${
              showLines ? 'bg-purple-500 text-white' : 'bg-zinc-700 text-white'
            }`}
          >
            {showLines ? '⚡' : '➖'}
          </button>
        )}

        {/* List Panel Toggle */}
        <button
          onClick={() => setShowCCTVPanel(!showCCTVPanel)}
          className={`px-2 sm:px-3 py-1.5 sm:py-2 font-bold text-xs sm:text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all ${
            showCCTVPanel ? 'bg-cyan-600 text-white' : 'bg-zinc-800 text-cyan-400'
          }`}
        >
          📋
        </button>
      </div>

      {/* Report Button */}
      <ReportButton onReport={handleReport} />

      {/* Report Form Modal */}
      {showForm && (
        <ReportForm
          type={reportType}
          onClose={() => setShowForm(false)}
          onSuccess={refetch}
          cameras={cameras}
          onCameraSelect={handleCameraClick}
        />
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetail
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onDelete={refetch}
        />
      )}

      {/* CCTV Modal */}
      {selectedCamera && (
        <CCTVModal
          camera={selectedCamera}
          onClose={() => setSelectedCamera(null)}
        />
      )}

      {/* CCTV Panel */}
      <CCTVPanel
        cameras={cameras}
        isOpen={showCCTVPanel}
        onClose={() => setShowCCTVPanel(false)}
        onCameraSelect={handleCameraClick}
      />

      {/* Admin Panel */}
      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
      />

      {/* Stats Overlay */}
      <div className="fixed bottom-20 sm:bottom-4 left-2 sm:left-4 z-[999] bg-zinc-900/95 border-2 border-zinc-700 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm backdrop-blur-sm">
        <span className="text-zinc-400">📊 </span>
        <span className="text-yellow-400 font-bold">{reports.length}</span>
        <span className="text-zinc-600 mx-1 sm:mx-2">|</span>
        <span className="text-cyan-400 font-bold">{cameras.length}</span>
        <span className="text-zinc-500 text-[10px] sm:text-xs ml-1">CCTV</span>
        {isAdmin && <span className="text-yellow-400 ml-2">🔐</span>}
      </div>
    </main>
  );
}
