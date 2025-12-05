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

  // Create CCTV marker icon
  const createCCTVIcon = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
      <rect x="2" y="6" width="16" height="12" rx="2" fill="#06B6D4" stroke="#000" stroke-width="1.5"/>
      <polygon points="18,9 22,7 22,17 18,15" fill="#06B6D4" stroke="#000" stroke-width="1.5"/>
      <circle cx="8" cy="12" r="3" fill="#000"/>
    </svg>`;
    return new L.Icon({ iconUrl: 'data:image/svg+xml;base64,' + btoa(svg), iconSize: [28, 28], iconAnchor: [14, 14] });
  };

  const cctvIcon = createCCTVIcon();

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
              <div className="p-2">
                <p className="font-bold">{label}</p>
                <p className="text-sm">{new Date(report.created_at).toLocaleString('id-ID')}</p>
                <p className="text-sm">✅ {report.confirmation_count} konfirmasi</p>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* CCTV Cameras */}
      {showCCTV && cameras.map((camera) => (
        <Marker 
          key={camera.id} 
          position={[parseFloat(camera.latitude), parseFloat(camera.longitude)]} 
          icon={cctvIcon}
          eventHandlers={{
            click: () => onCameraClick(camera)
          }}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <p className="font-bold text-cyan-600">📹 {camera.name}</p>
              <p className="text-xs text-gray-500">{camera.district}</p>
              <p className="text-xs mt-1">{camera.street}</p>
              <button 
                onClick={() => onCameraClick(camera)}
                className="mt-2 w-full py-1 bg-cyan-500 text-white text-sm font-bold rounded"
              >
                Lihat Stream
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
