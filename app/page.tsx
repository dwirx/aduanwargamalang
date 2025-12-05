'use client';

import { useState, useEffect } from 'react';
import { AuthHeader } from './components/Auth/AuthHeader';
import { QuickFilters } from './components/Filter/QuickFilters';
import { ReportButton } from './components/Report/ReportButton';
import { ReportForm } from './components/Report/ReportForm';
import { useReports } from './hooks/useReports';
import { FilterType, ReportType, FloodReport } from './lib/types';

function LazyMap({ reports, filter }: { reports: FloodReport[]; filter: FilterType }) {
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

  return <MapComponent reports={reports} filter={filter} />;
}

export default function Home() {
  const { reports, loading, error } = useReports();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showForm, setShowForm] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('flood');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReport = (type: ReportType) => {
    setReportType(type);
    setShowForm(true);
  };

  const handleSuccess = () => {
    // Report submitted successfully
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
          <LazyMap reports={reports} filter={filter} />
        )}
      </div>

      {/* Quick Filters */}
      <QuickFilters activeFilter={filter} onFilterChange={setFilter} />

      {/* Report Button */}
      <ReportButton onReport={handleReport} />

      {/* Report Form Modal */}
      {showForm && (
        <ReportForm
          type={reportType}
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Stats Overlay */}
      <div className="fixed bottom-4 left-4 z-[999] bg-zinc-900/90 border-2 border-zinc-700 px-3 py-2 text-sm">
        <span className="text-zinc-400">Laporan aktif: </span>
        <span className="text-yellow-400 font-bold">{reports.length}</span>
      </div>
    </main>
  );
}
