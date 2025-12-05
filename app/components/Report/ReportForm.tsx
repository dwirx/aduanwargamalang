'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { ReportType, WaterLevel, ReportFormData } from '../../lib/types';
import { validateReportForm, validateSocialUrl } from '../../lib/validators';
import { supabase } from '../../lib/supabase';
import { ProofUpload } from './ProofUpload';

interface ReportFormProps {
  type: ReportType;
  onClose: () => void;
  onSuccess: () => void;
}

const waterLevels: { value: WaterLevel; label: string; color: string }[] = [
  { value: 'siaga', label: '🟡 Siaga (Semata Kaki)', color: 'bg-yellow-400' },
  { value: 'bahaya', label: '🟠 Bahaya (Selutut)', color: 'bg-orange-500' },
  { value: 'evakuasi', label: '🔴 Evakuasi (Sedada)', color: 'bg-red-500' },
];

export function ReportForm({ type, onClose, onSuccess }: ReportFormProps) {
  const { user } = useUser();
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [waterLevel, setWaterLevel] = useState<WaterLevel | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [socialUrl, setSocialUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Auto-get location on mount
  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setErrors(['Browser tidak mendukung geolokasi']);
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setGettingLocation(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        // Default to Malang center if geolocation fails
        setPosition([-7.9666, 112.6326]);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const formData: ReportFormData = {
      type,
      latitude: position?.[0] || 0,
      longitude: position?.[1] || 0,
      water_level: type === 'flood' ? waterLevel : null,
      photo,
      social_url: socialUrl,
    };

    const validation = validateReportForm(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    setErrors([]);

    try {
      let photoUrl: string | null = null;
      
      // Upload photo if provided
      if (photo) {
        const fileName = `${user.id}/${Date.now()}-${photo.name}`;
        const { error: uploadError } = await supabase.storage
          .from('report-photos')
          .upload(fileName, photo);
        
        if (!uploadError) {
          const { data } = supabase.storage.from('report-photos').getPublicUrl(fileName);
          photoUrl = data.publicUrl;
        }
      }

      // Parse social URL
      const socialParsed = socialUrl ? validateSocialUrl(socialUrl) : null;

      // Insert report
      const { error: insertError } = await supabase.from('flood_reports').insert({
        user_id: user.id,
        type,
        latitude: position![0],
        longitude: position![1],
        water_level: type === 'flood' ? waterLevel : null,
        photo_url: photoUrl,
        social_url: socialUrl,
        social_platform: socialParsed?.platform || null,
      });

      if (insertError) throw insertError;

      onSuccess();
      onClose();
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Gagal mengirim laporan']);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 flex items-end sm:items-center justify-center">
      <div className="bg-zinc-900 w-full max-w-lg max-h-[90vh] overflow-y-auto border-t-4 sm:border-4 border-yellow-400">
        <div className="p-4 border-b-2 border-zinc-700 flex justify-between items-center">
          <h2 className="text-xl font-black text-white">
            {type === 'flood' ? '🌊 Lapor Banjir' : '✅ Lapor Jalan Kering'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Location */}
          <div>
            <label className="block text-white font-bold mb-2">
              📍 Lokasi Anda
            </label>
            <div className="bg-zinc-800 border-2 border-zinc-600 p-4">
              {gettingLocation ? (
                <p className="text-yellow-400 animate-pulse">Mendapatkan lokasi...</p>
              ) : position ? (
                <div>
                  <p className="text-green-400 font-bold mb-2">✅ Lokasi terdeteksi</p>
                  <p className="text-zinc-400 text-sm font-mono">
                    {position[0].toFixed(6)}, {position[1].toFixed(6)}
                  </p>
                </div>
              ) : (
                <p className="text-red-400">Lokasi tidak tersedia</p>
              )}
              <button
                type="button"
                onClick={getLocation}
                className="mt-3 px-4 py-2 bg-zinc-700 text-white font-bold border-2 border-zinc-500 hover:bg-zinc-600 transition-colors"
              >
                🔄 Refresh Lokasi
              </button>
            </div>
          </div>

          {/* Water Level (only for flood) */}
          {type === 'flood' && (
            <div>
              <label className="block text-white font-bold mb-2">
                💧 Tingkat Ketinggian Air
              </label>
              <div className="space-y-2">
                {waterLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setWaterLevel(level.value)}
                    className={`w-full py-3 px-4 font-bold border-2 border-black text-left transition-all ${
                      waterLevel === level.value
                        ? `${level.color} text-black`
                        : 'bg-zinc-800 text-white'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Proof Upload */}
          <div>
            <label className="block text-white font-bold mb-2">
              📸 Bukti (Foto atau Link Sosmed)
            </label>
            <ProofUpload
              onPhotoChange={setPhoto}
              onSocialUrlChange={setSocialUrl}
              socialUrl={socialUrl}
            />
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-900/50 border-2 border-red-500 p-3">
              {errors.map((error, i) => (
                <p key={i} className="text-red-300 text-sm">{error}</p>
              ))}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !position}
            className={`w-full py-4 font-black text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${
              submitting || !position
                ? 'bg-zinc-600 text-zinc-400'
                : 'bg-yellow-400 text-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px]'
            }`}
          >
            {submitting ? 'Mengirim...' : 'KIRIM LAPORAN'}
          </button>
        </form>
      </div>
    </div>
  );
}
