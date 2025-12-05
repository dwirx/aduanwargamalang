'use client';

import { useState, useMemo } from 'react';
import { CCTVCamera } from '../../lib/cctv-types';

interface CCTVListProps {
  cameras: CCTVCamera[];
  onCameraSelect: (camera: CCTVCamera) => void;
  onLocationSelect?: (lat: number, lng: number, name: string) => void;
  showLocationPicker?: boolean;
}

export function CCTVList({ cameras, onCameraSelect, onLocationSelect, showLocationPicker }: CCTVListProps) {
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  // Get unique districts
  const districts = useMemo(() => {
    const uniqueDistricts = [...new Set(cameras.map(c => c.district))].sort();
    return ['all', ...uniqueDistricts];
  }, [cameras]);

  // Filter cameras
  const filteredCameras = useMemo(() => {
    return cameras.filter(camera => {
      const matchesSearch = search === '' || 
        camera.name.toLowerCase().includes(search.toLowerCase()) ||
        camera.street.toLowerCase().includes(search.toLowerCase());
      const matchesDistrict = selectedDistrict === 'all' || camera.district === selectedDistrict;
      return matchesSearch && matchesDistrict;
    });
  }, [cameras, search, selectedDistrict]);

  // Group by district
  const groupedCameras = useMemo(() => {
    const groups: Record<string, CCTVCamera[]> = {};
    filteredCameras.forEach(camera => {
      if (!groups[camera.district]) {
        groups[camera.district] = [];
      }
      groups[camera.district].push(camera);
    });
    return groups;
  }, [filteredCameras]);

  return (
    <div className="flex flex-col h-full">
      {/* Search & Filter */}
      <div className="p-3 border-b-2 border-zinc-700 space-y-2">
        <input
          type="text"
          placeholder="🔍 Cari CCTV..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-800 border-2 border-zinc-600 text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none"
        />
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-800 border-2 border-zinc-600 text-white focus:border-cyan-400 focus:outline-none"
        >
          {districts.map(district => (
            <option key={district} value={district}>
              {district === 'all' ? '📍 Semua Kecamatan' : district}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="px-3 py-2 bg-zinc-800/50 border-b border-zinc-700 text-xs text-zinc-400">
        Menampilkan <span className="text-cyan-400 font-bold">{filteredCameras.length}</span> dari {cameras.length} CCTV
      </div>

      {/* Camera List */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedCameras).map(([district, districtCameras]) => (
          <div key={district}>
            <div className="sticky top-0 px-3 py-2 bg-cyan-900/80 text-cyan-300 font-bold text-sm backdrop-blur-sm">
              📍 {district} ({districtCameras.length})
            </div>
            {districtCameras.map((camera, index) => (
              <div
                key={camera.id}
                className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors animate-fadeIn"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${camera.status === 1 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                        <h4 className="text-white font-bold text-sm truncate">{camera.name}</h4>
                      </div>
                      <p className="text-zinc-500 text-xs truncate">{camera.street}</p>
                      <div className="flex gap-1 mt-2">
                        {camera.isIntersection === 1 && (
                          <span className="px-1.5 py-0.5 bg-yellow-900/50 text-yellow-400 text-[10px] font-bold rounded">
                            Simpang
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 bg-zinc-700 text-zinc-400 text-[10px] font-bold rounded">
                          {camera.camera_type}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => onCameraSelect(camera)}
                        className="px-3 py-1.5 bg-cyan-600 text-white text-xs font-bold rounded hover:bg-cyan-500 transition-colors"
                      >
                        👁️ Lihat
                      </button>
                      {showLocationPicker && onLocationSelect && (
                        <button
                          onClick={() => onLocationSelect(
                            parseFloat(camera.latitude),
                            parseFloat(camera.longitude),
                            camera.name
                          )}
                          className="px-3 py-1.5 bg-yellow-500 text-black text-xs font-bold rounded hover:bg-yellow-400 transition-colors"
                        >
                          📍 Pilih
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {filteredCameras.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-zinc-500">Tidak ada CCTV ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
