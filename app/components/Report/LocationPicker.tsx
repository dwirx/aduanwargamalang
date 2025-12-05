'use client';

import { useState, useEffect } from 'react';
import { CCTVCamera } from '../../lib/cctv-types';
import { CCTVList } from '../CCTV/CCTVList';
import { MapPicker } from './MapPicker';

interface LocationPickerProps {
  position: [number, number] | null;
  onPositionChange: (pos: [number, number], locationName?: string) => void;
  cameras: CCTVCamera[];
  onCameraSelect: (camera: CCTVCamera) => void;
}

type LocationMode = 'auto' | 'map' | 'cctv';

export function LocationPicker({ position, onPositionChange, cameras, onCameraSelect }: LocationPickerProps) {
  const [mode, setMode] = useState<LocationMode>('auto');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showCCTVList, setShowCCTVList] = useState(false);

  useEffect(() => {
    getAutoLocation();
  }, []);

  const getAutoLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Browser tidak mendukung geolokasi');
      return;
    }

    setGettingLocation(true);
    setLocationError(null);
    setLocationName(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onPositionChange([pos.coords.latitude, pos.coords.longitude]);
        setLocationName('📍 Lokasi GPS Anda');
        setGettingLocation(false);
        setMode('auto');
      },
      (err) => {
        let errorMsg = 'Gagal mendapatkan lokasi';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = 'Akses lokasi ditolak. Gunakan pilih di peta.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = 'Lokasi tidak tersedia. Gunakan pilih di peta.';
            break;
          case err.TIMEOUT:
            errorMsg = 'Timeout. Gunakan pilih di peta.';
            break;
        }
        setLocationError(errorMsg);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleMapPositionSelect = (pos: [number, number]) => {
    onPositionChange(pos, '📍 Lokasi dari Peta');
    setLocationName('📍 Lokasi dari Peta');
    setMode('map');
  };

  const handleCCTVLocationSelect = (lat: number, lng: number, name: string) => {
    onPositionChange([lat, lng], name);
    setLocationName(`📹 Dekat: ${name}`);
    setShowCCTVList(false);
    setMode('cctv');
  };

  return (
    <div className="space-y-3">
      {/* Mode Selection */}
      <div className="grid grid-cols-3 gap-1 border-2 border-zinc-600 p-1 bg-zinc-800">
        <button
          type="button"
          onClick={() => { setMode('auto'); getAutoLocation(); }}
          className={`py-2 px-2 text-[11px] sm:text-xs font-bold transition-all flex flex-col items-center gap-1 ${
            mode === 'auto' ? 'bg-green-500 text-black' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
          }`}
        >
          <span className="text-lg">📍</span>
          <span>GPS</span>
        </button>
        <button
          type="button"
          onClick={() => setShowMapPicker(true)}
          className={`py-2 px-2 text-[11px] sm:text-xs font-bold transition-all flex flex-col items-center gap-1 ${
            mode === 'map' ? 'bg-blue-500 text-white' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
          }`}
        >
          <span className="text-lg">🗺️</span>
          <span>Peta</span>
        </button>
        <button
          type="button"
          onClick={() => setShowCCTVList(true)}
          className={`py-2 px-2 text-[11px] sm:text-xs font-bold transition-all flex flex-col items-center gap-1 ${
            mode === 'cctv' ? 'bg-cyan-500 text-black' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
          }`}
        >
          <span className="text-lg">📹</span>
          <span>CCTV</span>
        </button>
      </div>

      {/* Location Display */}
      <div className="bg-zinc-800 border-2 border-zinc-600 p-3">
        {gettingLocation ? (
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-yellow-400 animate-pulse text-sm">Mendapatkan lokasi GPS...</p>
          </div>
        ) : position ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-green-400 text-lg">✅</span>
              <p className="text-green-400 font-bold text-sm">Lokasi dipilih</p>
            </div>
            {locationName && (
              <p className="text-cyan-400 text-sm mb-1">{locationName}</p>
            )}
            <p className="text-zinc-400 text-xs font-mono bg-zinc-900 px-2 py-1 rounded inline-block">
              {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-lg">⚠️</span>
            <p className="text-yellow-400 text-sm">Pilih lokasi dengan salah satu metode di atas</p>
          </div>
        )}

        {locationError && (
          <div className="mt-2 p-2 bg-red-900/30 border border-red-700 rounded">
            <p className="text-red-400 text-xs">{locationError}</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={getAutoLocation}
          disabled={gettingLocation}
          className="flex-1 py-2 bg-zinc-700 text-white font-bold text-xs border-2 border-zinc-500 hover:bg-zinc-600 transition-colors disabled:opacity-50"
        >
          🔄 Refresh GPS
        </button>
        <button
          type="button"
          onClick={() => setShowMapPicker(true)}
          className="flex-1 py-2 bg-blue-600 text-white font-bold text-xs border-2 border-black hover:bg-blue-500 transition-colors"
        >
          🗺️ Pilih di Peta
        </button>
      </div>

      {/* Map Picker Modal */}
      {showMapPicker && (
        <MapPicker
          position={position}
          onPositionChange={handleMapPositionSelect}
          onClose={() => setShowMapPicker(false)}
        />
      )}

      {/* CCTV List Modal */}
      {showCCTVList && (
        <div className="fixed inset-0 z-[2500] bg-black/90 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-zinc-900 w-full max-w-md h-[85vh] border-4 border-cyan-400 flex flex-col animate-slideUp">
            <div className="p-3 border-b-2 border-zinc-700 flex justify-between items-center bg-cyan-900/30">
              <h3 className="text-white font-bold text-sm sm:text-base">📹 Pilih Lokasi CCTV</h3>
              <button
                type="button"
                onClick={() => setShowCCTVList(false)}
                className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white font-bold rounded"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <CCTVList
                cameras={cameras}
                onCameraSelect={onCameraSelect}
                onLocationSelect={handleCCTVLocationSelect}
                showLocationPicker
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
