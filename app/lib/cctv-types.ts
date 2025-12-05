export interface CCTVCamera {
  id: string;
  name: string;
  stream_id: string;
  host: string;
  status: number;
  isIntersection: number;
  isPublic: number;
  street: string;
  district: string;
  city: string;
  province: string;
  formatted_address: string;
  camera_type: string;
  location_type: string;
  priority: string;
  district_category: string;
  webrtc_url: string;
  hls_url: string;
  latitude: string;
  longitude: string;
}

export interface CCTVData {
  [district: string]: CCTVCamera[];
}
