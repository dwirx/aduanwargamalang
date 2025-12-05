'use client';

import { useState, useEffect } from 'react';
import { CCTVCamera } from '../../lib/cctv-types';
import { CCTVList } from '../CCTV/CCTVList';

interface LocationPickerProps {
  position: [number, number] | null;
  onPositionChange: (pos: [number, number], locationName?: string) => void;
  cameras: CCTVCamera[];
  onCameraSelect: (camera: CCTVCamera) => void;
}

type LocationMode = 'auto' | 'manual' | 'cctv';

export function LocationPicker({ position, onPositionChange, cameras, onCameraSelect }: LocationPickerProps) {
  const [mode, setMode] = useState<LocationMode>('auto');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [showCCTVList, setShowCCTVList] = useState(false);

  // Auto-get location on mount
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
        setLocationName('Lokasi GPS Anda');
        setGettingLocation(false);
        setMode('auto');
      },
      (err) => {
        let errorMsg = 'Gagal mendapatkan lokasi';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = 'Akses lokasi ditolak. Silakan izinkan akses lokasi di browser.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = 'Informasi lokasi tidak tersedia.';
            break;
          case err.TIMEOUT:
            errorMsg = 'Waktu permintaan lokasi habis.';
            break;
        }
        setLocationError(errorMsg);
        setGettingLocation(false);
        // Don't set default position, let user choose manually
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleManualSubmit = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng)) {
      setLocationError('Koordinat tidak valid');
      return;
    }

    // Validate Malang area roughly
    if (lat < -8.1 || lat > -7.8 || lng < 112.5 || lng > 112.8) {
      setLocationError('Koordinat di luar area Kota Malang');
      return;
    }

    onPositionChange([lat, lng], 'Lokasi Manual');
    setLocationName('Lokasi Manual');
    setLocationError(null);
  };

  const handleCCTVLocationSelect = (lat: number, lng: number, name: string) => {
    onPositionChange([lat, lng], name);
    setLocationName(`Dekat CCTV: ${name}`);
    setShowCCTVList(false);
    setMode('cctv');
  };

  return (
    <div className="space-y-3">
      {/* Mode Tabs */}
      <div className="flex border-2 border-zinc-600 overflow-hidden">
        <button
          type="button"
          onClick={() => { setMode('auto'); getAutoLocation(); }}
          className={`flex-1 py-2 px-3 text-xs font-bold transition-all ${
            mode === 'auto' ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          📍 GPS Otomatis
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex-1 py-2 px-3 text-xs font-bold transition-all ${
            mode === 'manual' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          ✏️ Manual
        </button>
        <button
          type="button"
          onClick={() => { setMode('cctv'); setShowCCTVList(true); }}
          className={`flex-1 py-2 px-3 text-xs font-bold transition-all ${
            mode === 'cctv' ? 'bg-cyan-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          📹 Pilih CCTV
        </button>
      </div>

      {/* Location Display */}
      <div className="bg-zinc-800 border-2 border-zinc-600 p-3">
        {gettingLocation ? (
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-yellow-400 animate-pulse">Mendapatkan lokasi GPS...</p>
          </div>
        ) : position ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-400 text-lg">✅</span>
              <p className="text-green-400 font-bold text-sm">Lokasi terdeteksi</p>
            </div>
            {locationName && (
              <p className="text-cyan-400 text-sm mb-1">{locationName}</p>
            )}
            <p className="text-zinc-400 text-xs font-mono bg-zinc-900 px-2 py-1 rounded">
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

      {/* Manual Input */}
      {mode === 'manual' && (
        <div className="bg-zinc-800 border-2 border-blue-600 p-3 space-y-2 animate-fadeIn">
          <p className="text-blue-400 text-xs font-bold mb-2">Masukkan koordinat manual:</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-zinc-500 text-xs">Latitude</label>
              <input
                type="text"
                placeholder="-7.9666"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-600 text-white text-sm focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-zinc-500 text-xs">Longitude</label>
              <input
                type="text"
                placeholder="112.6326"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-600 text-white text-sm focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleManualSubmit}
            className="w-full py-2 bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-colors"
          >
            Gunakan Koordinat Ini
          </button>
          <p className="text-zinc-500 text-[10px]">
            💡 Tip: Buka Google Maps, klik kanan lokasi, lalu copy koordinatnya
          </p>
        </div>
      )}

      {/* CCTV List Modal */}
      {showCCTVList && (
        <div className="fixed inset-0 z-[2500] bg-black/90 flex items-center justify-center p-4">
          <div className="bg-zinc-900 w-full max-w-md h-[80vh] border-4 border-cyan-400 flex flex-col animate-slideUp">
            <div className="p-3 border-b-2 border-zinc-700 flex justify-between items-center bg-cyan-900/30">
              <h3 className="text-white font-bold">📹 Pilih Lokasi CCTV</h3>
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
          onClick={() => {
            onPositionChange([-7.9666, 112.6326], 'Pusat Kota Malang');
            setLocationName('Pusat Kota Malang (Default)');
          }}
          className="flex-1 py-2 bg-zinc-700 text-white font-bold text-xs border-2 border-zinc-500 hover:bg-zinc-600 transition-colors"
        >
          🏛️ Pusat Malang
        </button>
      </div>
    </div>
  );
}
