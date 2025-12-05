'use client';

import { useEffect, useState, useCallback } from 'react';

interface MapPickerProps {
  position: [number, number] | null;
  onPositionChange: (pos: [number, number]) => void;
  onClose: () => void;
}

const MALANG_CENTER: [number, number] = [-7.9666, 112.6326];

export function MapPicker({ position, onPositionChange, onClose }: MapPickerProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapComponents, setMapComponents] = useState<any>(null);
  const [selectedPos, setSelectedPos] = useState<[number, number]>(position || MALANG_CENTER);
  const [address, setAddress] = useState<string>('');
  const [loadingAddress, setLoadingAddress] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    
    Promise.all([import('react-leaflet'), import('leaflet')]).then(([rl, l]) => {
      setMapComponents({ ...rl, L: l.default });
    });

    return () => { link.parentNode?.removeChild(link); };
  }, []);

  // Reverse geocoding to get address
  const fetchAddress = useCallback(async (lat: number, lng: number) => {
    setLoadingAddress(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch {
      setAddress('');
    } finally {
      setLoadingAddress(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPos) {
      fetchAddress(selectedPos[0], selectedPos[1]);
    }
  }, [selectedPos, fetchAddress]);

  const handleConfirm = () => {
    onPositionChange(selectedPos);
    onClose();
  };

  if (!isClient || !mapComponents) {
    return (
      <div className="fixed inset-0 z-[3000] bg-black/90 flex items-center justify-center">
        <div className="text-yellow-400 font-bold animate-pulse">🗺️ Memuat peta...</div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, useMapEvents } = mapComponents;
  const L = mapComponents.L;

  // Custom marker icon
  const markerIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48" width="32" height="48">
        <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 32 16 32s16-20 16-32C32 7.2 24.8 0 16 0z" fill="#EF4444" stroke="#000" stroke-width="2"/>
        <circle cx="16" cy="16" r="8" fill="#fff"/>
        <circle cx="16" cy="16" r="4" fill="#EF4444"/>
      </svg>
    `),
    iconSize: [32, 48],
    iconAnchor: [16, 48],
  });

  // Component to handle map clicks
  function MapClickHandler() {
    useMapEvents({
      click: (e: any) => {
        setSelectedPos([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  }

  return (
    <div className="fixed inset-0 z-[3000] bg-black/95 flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 border-b-2 border-yellow-400 p-3 sm:p-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white">📍 Pilih Lokasi di Peta</h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">Tap/klik peta untuk memilih lokasi</p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white text-xl font-bold transition-all rounded"
        >
          ✕
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer 
          center={selectedPos} 
          zoom={15} 
          className="h-full w-full" 
          style={{ background: '#1a1a1a' }}
        >
          <TileLayer 
            attribution='&copy; OpenStreetMap' 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          />
          <MapClickHandler />
          <Marker 
            position={selectedPos} 
            icon={markerIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e: any) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                setSelectedPos([pos.lat, pos.lng]);
              },
            }}
          />
        </MapContainer>

        {/* Crosshair overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-yellow-400 rounded-full opacity-50"></div>
        </div>
      </div>

      {/* Footer with coordinates and confirm */}
      <div className="bg-zinc-900 border-t-2 border-zinc-700 p-3 sm:p-4">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-green-400">📍</span>
            <span className="text-white font-mono text-sm">
              {selectedPos[0].toFixed(6)}, {selectedPos[1].toFixed(6)}
            </span>
          </div>
          {loadingAddress ? (
            <p className="text-zinc-500 text-xs animate-pulse">Mencari alamat...</p>
          ) : address ? (
            <p className="text-zinc-400 text-xs line-clamp-2">{address}</p>
          ) : null}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-zinc-700 text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 bg-yellow-400 text-black font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            ✓ Pilih Lokasi Ini
          </button>
        </div>
      </div>
    </div>
  );
}
