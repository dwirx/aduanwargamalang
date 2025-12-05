'use client';

import { useState, useEffect } from 'react';
import { AuthHeader } from './components/Auth/AuthHeader';
import { QuickFilters } from './components/Filter/QuickFilters';
import { ReportButton } from './components/Report/ReportButton';
import { ReportForm } from './components/Report/ReportForm';
import { CCTVModal } from './components/CCTV/CCTVModal';
import { useReports } from './hooks/useReports';
import { useCCTV } from './hooks/useCCTV';
import { FilterType, ReportType, FloodReport } from './lib/types';
import { CCTVCamera } from './lib/cctv-types';

interface LazyMapProps {
  reports: FloodReport[];
  filter: FilterType;
  cameras: CCTVCamera[];
  showCCTV: boolean;
  onCameraClick: (camera: CCTVCamera) => void;
}

function LazyMap({ reports, filter, cameras, showCCTV, onCameraClick }: LazyMapProps) {
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

  return <MapComponent reports={reports} filter={filter} cameras={cameras} showCCTV={showCCTV} onCameraClick={onCameraClick} />;
}

export default function Home() {
  const { reports, loading, error } = useReports();
  const { cameras, loading: cctvLoading } = useCCTV();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showForm, setShowForm] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('flood');
  const [mounted, setMounted] = useState(false);
  const [showCCTV, setShowCCTV] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<CCTVCamera | null>(null);

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

  return (
    <main className="h-screen w-screen overflow-hidden relative">
      <AuthHeader />
      
      {/* Map */}
      <div className="h-full w-full pt-16">
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
            onCameraClick={handleCameraClick}
          />
        )}
      </div>

      {/* Quick Filters */}
      <QuickFilters activeFilter={filter} onFilterChange={setFilter} />

      {/* CCTV Toggle */}
      <button
        onClick={() => setShowCCTV(!showCCTV)}
        className={`fixed top-20 right-4 z-[1000] px-4 py-2 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${
          showCCTV ? 'bg-cyan-400 text-black' : 'bg-zinc-700 text-white'
        }`}
      >
        📹 CCTV {showCCTV ? 'ON' : 'OFF'}
        {!cctvLoading && <span className="ml-1 text-xs">({cameras.length})</span>}
      </button>

      {/* Report Button */}
      <ReportButton onReport={handleReport} />

      {/* Report Form Modal */}
      {showForm && (
        <ReportForm
          type={reportType}
          onClose={() => setShowForm(false)}
          onSuccess={() => {}}
        />
      )}

      {/* CCTV Modal */}
      {selectedCamera && (
        <CCTVModal
          camera={selectedCamera}
          onClose={() => setSelectedCamera(null)}
        />
      )}

      {/* Stats Overlay */}
      <div className="fixed bottom-4 left-4 z-[999] bg-zinc-900/90 border-2 border-zinc-700 px-3 py-2 text-sm">
        <span className="text-zinc-400">Laporan: </span>
        <span className="text-yellow-400 font-bold">{reports.length}</span>
        <span className="text-zinc-600 mx-2">|</span>
        <span className="text-zinc-400">CCTV: </span>
        <span className="text-cyan-400 font-bold">{cameras.length}</span>
      </div>
    </main>
  );
}
