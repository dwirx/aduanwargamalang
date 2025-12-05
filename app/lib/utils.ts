import { FloodReport, WaterLevel, FilterType } from './types';

export function getMarkerColor(waterLevel: WaterLevel | null): string {
  switch (waterLevel) {
    case 'siaga':
      return '#FACC15'; // yellow
    case 'bahaya':
      return '#F97316'; // orange
    case 'evakuasi':
      return '#EF4444'; // red
    default:
      return '#22C55E'; // green for dry routes
  }
}

export function isReportExpired(report: FloodReport): boolean {
  const expiresAt = new Date(report.expires_at);
  const now = new Date();
  return now > expiresAt;
}

export function getMarkerOpacity(report: FloodReport): number {
  if (isReportExpired(report)) {
    return 0.5;
  }
  return 1.0;
}

export function filterReports(reports: FloodReport[], filter: FilterType): FloodReport[] {
  switch (filter) {
    case 'passable':
      return reports.filter(r => r.type === 'flood' && r.water_level === 'siaga');
    case 'blocked':
      return reports.filter(r => r.type === 'flood' && r.water_level === 'evakuasi');
    case 'dry':
      return reports.filter(r => r.type === 'dry_route');
    case 'all':
    default:
      return reports;
  }
}

export function serializeReport(report: FloodReport): string {
  return JSON.stringify(report);
}

export function deserializeReport(json: string): FloodReport {
  return JSON.parse(json) as FloodReport;
}

export function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getWaterLevelLabel(level: WaterLevel | null): string {
  switch (level) {
    case 'siaga':
      return '🟡 Siaga (Semata Kaki)';
    case 'bahaya':
      return '🟠 Bahaya (Selutut/Sepinggang)';
    case 'evakuasi':
      return '🔴 Evakuasi (Sedada/Atap)';
    default:
      return '🟢 Jalan Kering';
  }
}
