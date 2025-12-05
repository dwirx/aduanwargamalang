import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      flood_reports: {
        Row: {
          id: string;
          user_id: string;
          type: 'flood' | 'dry_route';
          latitude: number;
          longitude: number;
          water_level: 'siaga' | 'bahaya' | 'evakuasi' | null;
          photo_url: string | null;
          social_url: string | null;
          social_platform: 'instagram' | 'twitter' | 'tiktok' | null;
          confirmation_count: number;
          created_at: string;
          last_confirmed_at: string;
          expires_at: string;
        };
        Insert: Omit<Database['public']['Tables']['flood_reports']['Row'], 'id' | 'created_at' | 'last_confirmed_at' | 'expires_at' | 'confirmation_count'>;
        Update: Partial<Database['public']['Tables']['flood_reports']['Insert']>;
      };
      report_confirmations: {
        Row: {
          id: string;
          report_id: string;
          user_id: string;
          confirmed_at: string;
        };
        Insert: Omit<Database['public']['Tables']['report_confirmations']['Row'], 'id' | 'confirmed_at'>;
        Update: Partial<Database['public']['Tables']['report_confirmations']['Insert']>;
      };
    };
  };
};
