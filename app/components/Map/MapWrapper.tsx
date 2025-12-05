'use client';

import { useEffect, useState } from 'react';
import { FloodReport, FilterType } from '../../lib/types';
import { CCTVCamera } from '../../lib/cctv-types';
import { filterReports } from '../../lib/utils';

interface MapWrapperProps {
  reports: FloodReport[];
  filter: FilterType;
  cameras: CCTVCamera[];
  showCCTV: boolean;
  onCameraClick: (camera: CCTVCamera) => void;
}

const MALANG_CENTER: [number, number] = [-7.9666, 112.6326];
const DEFAULT_ZOOM = 13;

export function MapWrapper({ reports, filter, cameras, showCCTV, onCameraClick }: MapWrapperProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapComponents, setMapComponents] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    Promise.all([
      import('react-leaflet'),
      import('leaflet')
    ]).then(([rl, l]) => {
      setMapComponents({ ...rl, L: l.default });
    });

    return () => { link.parentNode?.removeChild(link); };
  }, []);

  const filteredReports = filterReports(reports, filter);

  if (!isClient || !mapComponents) {
    return (
      <div className="h-full w-full bg-zinc-900 flex items-center justify-center">
        <div className="text-yellow-400 font-bold animate-pulse">🗺️ Memuat peta...</div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = mapComponents;
  const L = mapComponents.L;

  // Create flood marker icon
  const createFloodIcon = (report: FloodReport) => {
    const color = report.type === 'dry_route' ? '#22C55E' : 
      report.water_level === 'siaga' ? '#FACC15' :
      report.water_level === 'bahaya' ? '#F97316' : '#EF4444';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"><circle cx="12" cy="12" r="10" fill="${color}" stroke="#000" stroke-width="2"/></svg>`;
    return new L.Icon({ iconUrl: 'data:image/svg+xml;base64,' + btoa(svg), iconSize: [32, 32], iconAnchor: [16, 16] });
  };

  // Create CCTV marker icon with better design
  const createCCTVIcon = (isIntersection: boolean = false) => {
    const color = isIntersection ? '#FBBF24' : '#06B6D4';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <circle cx="16" cy="16" r="14" fill="${color}" stroke="#000" stroke-width="2"/>
      <rect x="8" y="11" width="12" height="8" rx="1" fill="#000"/>
      <polygon points="20,13 24,11 24,21 20,19" fill="#000"/>
      <circle cx="12" cy="15" r="2" fill="${color}"/>
      <circle cx="16" cy="28" r="3" fill="${color}" stroke="#000" stroke-width="1.5" opacity="0.5"/>
    </svg>`;
    return new L.Icon({ iconUrl: 'data:image/svg+xml;base64,' + btoa(svg), iconSize: [32, 32], iconAnchor: [16, 28], popupAnchor: [0, -28] });
  };

  return (
    <MapContainer center={MALANG_CENTER} zoom={DEFAULT_ZOOM} className="h-full w-full" style={{ background: '#1a1a1a' }}>
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* Flood Reports */}
      {filteredReports.map((report) => {
        const icon = createFloodIcon(report);
        const label = report.type === 'dry_route' ? '🟢 Jalan Kering' : 
          report.water_level === 'siaga' ? '🟡 Siaga' : 
          report.water_level === 'bahaya' ? '🟠 Bahaya' : '🔴 Evakuasi';
        return (
          <Marker key={report.id} position={[report.latitude, report.longitude]} icon={icon}>
            <Popup>
              <div className="p-3">
                <p className="font-bold text-lg">{label}</p>
                <p className="text-sm text-zinc-400 mt-1">{new Date(report.created_at).toLocaleString('id-ID')}</p>
                <p className="text-sm text-green-400 mt-1">✅ {report.confirmation_count} konfirmasi</p>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* CCTV Cameras */}
      {showCCTV && cameras.map((camera) => {
        const cctvIcon = createCCTVIcon(camera.isIntersection === 1);
        return (
          <Marker 
            key={camera.id} 
            position={[parseFloat(camera.latitude), parseFloat(camera.longitude)]} 
            icon={cctvIcon}
            eventHandlers={{
              click: () => onCameraClick(camera)
            }}
          >
            <Popup>
              <div className="p-3 min-w-[250px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-green-400 font-bold">LIVE</span>
                </div>
                <p className="font-bold text-cyan-400 text-lg">📹 {camera.name}</p>
                <p className="text-xs text-zinc-500 mt-1">{camera.formatted_address}</p>
                <div className="flex gap-1 mt-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-cyan-900 text-cyan-300 text-xs font-bold rounded">{camera.district}</span>
                  <span className="px-2 py-0.5 bg-zinc-700 text-zinc-300 text-xs rounded">{camera.camera_type}</span>
                  {camera.isIntersection === 1 && (
                    <span className="px-2 py-0.5 bg-yellow-900 text-yellow-300 text-xs font-bold rounded">⚠️ Simpang</span>
                  )}
                </div>
                <button 
                  onClick={() => onCameraClick(camera)}
                  className="mt-3 w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  🎥 Lihat Stream
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
