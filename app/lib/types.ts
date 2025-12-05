export type WaterLevel = 'siaga' | 'bahaya' | 'evakuasi';
export type ReportType = 'flood' | 'dry_route';
export type SocialPlatform = 'instagram' | 'twitter' | 'tiktok';
export type FilterType = 'all' | 'passable' | 'blocked' | 'dry';

export interface FloodReport {
  id: string;
  user_id: string;
  type: ReportType;
  latitude: number;
  longitude: number;
  water_level: WaterLevel | null;
  photo_url: string | null;
  social_url: string | null;
  social_platform: SocialPlatform | null;
  confirmation_count: number;
  created_at: string;
  last_confirmed_at: string;
  expires_at: string;
}

export interface ReportConfirmation {
  id: string;
  report_id: string;
  user_id: string;
  confirmed_at: string;
}

export interface ReportFormData {
  type: ReportType;
  latitude: number;
  longitude: number;
  water_level: WaterLevel | null;
  photo: File | null;
  social_url: string | null;
}

export interface SocialUrlParseResult {
  platform: SocialPlatform;
  contentId: string;
  embedUrl: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
