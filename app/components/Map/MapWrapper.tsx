'use client';

import { useEffect, useState, useMemo } from 'react';
import { FloodReport, FilterType } from '../../lib/types';
import { CCTVCamera } from '../../lib/cctv-types';
import { filterReports } from '../../lib/utils';

interface MapWrapperProps {
  reports: FloodReport[];
  filter: FilterType;
  cameras: CCTVCamera[];
  showCCTV: boolean;
  showLines: boolean;
  onCameraClick: (camera: CCTVCamera) => void;
  onReportClick?: (report: FloodReport) => void;
}

const MALANG_CENTER: [number, number] = [-7.9666, 112.6326];
const DEFAULT_ZOOM = 13;

const DISTRICT_COLORS: Record<string, string> = {
  'Klojen': '#06B6D4',
  'Lowokwaru': '#8B5CF6',
  'Blimbing': '#F59E0B',
  'Kedungkandang': '#10B981',
  'Sukun': '#EC4899',
};

const getDistrictColor = (district: string): string => DISTRICT_COLORS[district] || '#6B7280';

// Calculate distance between two points
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dx = lat2 - lat1;
  const dy = lng2 - lng1;
  return Math.sqrt(dx * dx + dy * dy);
}

// Create MST-like connections using Prim's algorithm for cleaner lines
function createMSTConnections(cameras: CCTVCamera[]): [number, number][][] {
  if (cameras.length < 2) return [];
  
  const positions = cameras.map(c => ({
    lat: parseFloat(c.latitude),
    lng: parseFloat(c.longitude)
  }));
  
  const n = positions.length;
  const visited = new Set<number>();
  const edges: { from: number; to: number }[] = [];
  
  // Start from first node
  visited.add(0);
  
  while (visited.size < n) {
    let minDist = Infinity;
    let minEdge = { from: -1, to: -1 };
    
    // Find minimum edge from visited to unvisited
    for (const v of visited) {
      for (let u = 0; u < n; u++) {
        if (!visited.has(u)) {
          const dist = getDistance(positions[v].lat, positions[v].lng, positions[u].lat, positions[u].lng);
          if (dist < minDist) {
            minDist = dist;
            minEdge = { from: v, to: u };
          }
        }
      }
    }
    
    if (minEdge.to !== -1) {
      edges.push(minEdge);
      visited.add(minEdge.to);
    }
  }
  
  // Convert edges to line segments
  return edges.map(e => [
    [positions[e.from].lat, positions[e.from].lng] as [number, number],
    [positions[e.to].lat, positions[e.to].lng] as [number, number]
  ]);
}

export function MapWrapper({ reports, filter, cameras, showCCTV, showLines, onCameraClick, onReportClick }: MapWrapperProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapComponents, setMapComponents] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(false);

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

  // Group cameras by district
  const districtData = useMemo(() => {
    const grouped: Record<string, CCTVCamera[]> = {};
    cameras.forEach(camera => {
      if (!grouped[camera.district]) grouped[camera.district] = [];
      grouped[camera.district].push(camera);
    });
    return grouped;
  }, [cameras]);

  // Create MST-based polylines for each district
  const districtLines = useMemo(() => {
    const lines: { district: string; segments: [number, number][][]; color: string; count: number }[] = [];
    
    Object.entries(districtData).forEach(([district, cams]) => {
      if (cams.length >= 2) {
        const segments = createMSTConnections(cams);
        lines.push({
          district,
          segments,
          color: getDistrictColor(district),
          count: cams.length
        });
      }
    });
    
    return lines;
  }, [districtData]);

  const filteredReports = filterReports(reports, filter);
  const filteredCameras = useMemo(() => {
    if (!selectedDistrict) return cameras;
    return cameras.filter(c => c.district === selectedDistrict);
  }, [cameras, selectedDistrict]);

  if (!isClient || !mapComponents) {
    return (
      <div className="h-full w-full bg-zinc-900 flex items-center justify-center">
        <div className="text-yellow-400 font-bold animate-pulse">🗺️ Memuat peta...</div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } = mapComponents;
  const L = mapComponents.L;

  const createFloodIcon = (report: FloodReport) => {
    const color = report.type === 'dry_route' ? '#22C55E' : report.water_level === 'siaga' ? '#FACC15' : report.water_level === 'bahaya' ? '#F97316' : '#EF4444';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28"><circle cx="12" cy="12" r="10" fill="${color}" stroke="#000" stroke-width="2"/></svg>`;
    return new L.Icon({ iconUrl: 'data:image/svg+xml;base64,' + btoa(svg), iconSize: [28, 28], iconAnchor: [14, 14] });
  };

  const createCCTVIcon = (camera: CCTVCamera) => {
    const baseColor = getDistrictColor(camera.district);
    const isInt = camera.isIntersection === 1;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
      <circle cx="14" cy="14" r="12" fill="${baseColor}" stroke="#000" stroke-width="2"/>
      <rect x="7" y="10" width="10" height="7" rx="1" fill="#000"/>
      <polygon points="17,11 20,9 20,18 17,16" fill="#000"/>
      <circle cx="10" cy="13" r="2" fill="${baseColor}"/>
      ${isInt ? '<circle cx="21" cy="7" r="5" fill="#FBBF24" stroke="#000" stroke-width="1"/>' : ''}
    </svg>`;
    return new L.Icon({ iconUrl: 'data:image/svg+xml;base64,' + btoa(svg), iconSize: [28, 28], iconAnchor: [14, 24], popupAnchor: [0, -24] });
  };

  const districts = Object.keys(districtData);

  return (
    <div className="relative h-full w-full">
      {/* District Legend */}
      {showCCTV && (
        <div className="absolute top-2 left-2 z-[1000]">
          <button 
            onClick={() => setShowLegend(!showLegend)}
            className="sm:hidden mb-1 px-2 py-1.5 bg-zinc-900/95 border-2 border-zinc-700 text-white text-xs font-bold flex items-center gap-1"
          >
            🗺️ Kecamatan {showLegend ? '▲' : '▼'}
          </button>
          
          <div className={`bg-zinc-900/95 border-2 border-zinc-700 backdrop-blur-sm transition-all ${showLegend ? 'block' : 'hidden sm:block'}`}>
            <div className="p-2 max-h-[200px] sm:max-h-[280px] overflow-y-auto">
              <p className="text-zinc-400 text-[10px] font-bold mb-1.5 uppercase hidden sm:block">Kecamatan</p>
              <button 
                onClick={() => setSelectedDistrict(null)} 
                className={`w-full text-left px-2 py-1 text-[11px] sm:text-xs font-bold mb-0.5 transition-all rounded ${!selectedDistrict ? 'bg-white text-black' : 'text-zinc-400 hover:bg-zinc-800'}`}
              >
                Semua ({cameras.length})
              </button>
              {districts.map(district => (
                <button 
                  key={district} 
                  onClick={() => setSelectedDistrict(selectedDistrict === district ? null : district)} 
                  className={`w-full text-left px-2 py-1 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all rounded ${selectedDistrict === district ? 'bg-zinc-700' : 'hover:bg-zinc-800'}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full border border-black flex-shrink-0" style={{ backgroundColor: getDistrictColor(district) }}></span>
                  <span className="text-white flex-1 truncate">{district}</span>
                  <span className="text-zinc-500 text-[10px]">{districtData[district]?.length || 0}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <MapContainer center={MALANG_CENTER} zoom={DEFAULT_ZOOM} className="h-full w-full" style={{ background: '#1a1a1a' }}>
        <TileLayer attribution='&copy; OSM' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* MST-based District Lines - Each segment is a separate line */}
        {showCCTV && showLines && districtLines.map(({ district, segments, color, count }) => {
          if (selectedDistrict && selectedDistrict !== district) return null;
          return segments.map((segment, idx) => (
            <Polyline 
              key={`line-${district}-${idx}`} 
              positions={segment} 
              pathOptions={{ 
                color, 
                weight: 2.5, 
                opacity: 0.7,
                lineCap: 'round', 
                lineJoin: 'round' 
              }}
            >
              {idx === 0 && (
                <Tooltip sticky>
                  <span className="font-bold text-xs">{district}</span>
                  <br />
                  <span className="text-[10px]">{count} CCTV terhubung</span>
                </Tooltip>
              )}
            </Polyline>
          ));
        })}

        {/* Flood Reports */}
        {filteredReports.map((report) => {
          const icon = createFloodIcon(report);
          const label = report.type === 'dry_route' ? '🟢 Jalan Kering' : report.water_level === 'siaga' ? '🟡 Siaga' : report.water_level === 'bahaya' ? '🟠 Bahaya' : '🔴 Evakuasi';
          return (
            <Marker key={report.id} position={[report.latitude, report.longitude]} icon={icon} eventHandlers={{ click: () => onReportClick?.(report) }}>
              <Popup>
                <div className="p-2 sm:p-3">
                  <p className="font-bold text-sm sm:text-base">{label}</p>
                  <p className="text-[11px] sm:text-sm text-zinc-400 mt-1">{new Date(report.created_at).toLocaleString('id-ID')}</p>
                  <p className="text-[11px] sm:text-sm text-green-400 mt-1">✅ {report.confirmation_count} konfirmasi</p>
                  {(report.social_url || report.photo_url) && (
                    <button 
                      onClick={() => onReportClick?.(report)}
                      className="mt-2 w-full py-1.5 bg-yellow-400 text-black text-xs font-bold border border-black"
                    >
                      📸 Lihat Detail & Bukti
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* CCTV Cameras */}
        {showCCTV && filteredCameras.map((camera) => {
          const cctvIcon = createCCTVIcon(camera);
          const districtColor = getDistrictColor(camera.district);
          return (
            <Marker key={camera.id} position={[parseFloat(camera.latitude), parseFloat(camera.longitude)]} icon={cctvIcon} eventHandlers={{ click: () => onCameraClick(camera) }}>
              <Popup>
                <div className="p-2 sm:p-3 min-w-[220px] sm:min-w-[260px]">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-[10px] text-green-400 font-bold">LIVE</span>
                    </div>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded text-black" style={{ backgroundColor: districtColor }}>{camera.district}</span>
                  </div>
                  <p className="font-bold text-white text-sm sm:text-base leading-tight">📹 {camera.name}</p>
                  <p className="text-[10px] sm:text-xs text-zinc-500 mt-1 line-clamp-2">{camera.street}</p>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 bg-zinc-700 text-zinc-300 text-[10px] rounded">{camera.camera_type}</span>
                    {camera.isIntersection === 1 && <span className="px-1.5 py-0.5 bg-yellow-500 text-black text-[10px] font-bold rounded">Simpang</span>}
                  </div>
                  <button 
                    onClick={() => onCameraClick(camera)} 
                    className="mt-2 w-full py-1.5 sm:py-2 text-black text-xs sm:text-sm font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all" 
                    style={{ backgroundColor: districtColor }}
                  >
                    🎥 Lihat Stream
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
