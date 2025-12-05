'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { ReportType, WaterLevel, ReportFormData } from '../../lib/types';
import { CCTVCamera } from '../../lib/cctv-types';
import { validateReportForm, validateSocialUrl } from '../../lib/validators';
import { supabase } from '../../lib/supabase';
import { ProofUpload } from './ProofUpload';
import { LocationPicker } from './LocationPicker';

interface ReportFormProps {
  type: ReportType;
  onClose: () => void;
  onSuccess: () => void;
  cameras?: CCTVCamera[];
  onCameraSelect?: (camera: CCTVCamera) => void;
}

const waterLevels: { value: WaterLevel; label: string; color: string; desc: string }[] = [
  { value: 'siaga', label: '🟡 Siaga', color: 'bg-yellow-400', desc: 'Semata kaki - Motor masih bisa lewat' },
  { value: 'bahaya', label: '🟠 Bahaya', color: 'bg-orange-500', desc: 'Selutut/Sepinggang - Mobil kecil jangan lewat' },
  { value: 'evakuasi', label: '🔴 Evakuasi', color: 'bg-red-500', desc: 'Sedada/Atap - Butuh perahu karet' },
];

export function ReportForm({ type, onClose, onSuccess, cameras = [], onCameraSelect }: ReportFormProps) {
  const { user } = useUser();
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [waterLevel, setWaterLevel] = useState<WaterLevel | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [socialUrl, setSocialUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const handlePositionChange = (pos: [number, number], name?: string) => {
    setPosition(pos);
    if (name) setLocationName(name);
  };

  const handleCameraSelect = (camera: CCTVCamera) => {
    if (onCameraSelect) {
      onCameraSelect(camera);
    }
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

      const socialParsed = socialUrl ? validateSocialUrl(socialUrl) : null;

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

  const canProceedStep1 = position !== null;
  const canProceedStep2 = type === 'dry_route' || waterLevel !== null;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/90 flex items-end sm:items-center justify-center">
      <div className="bg-zinc-900 w-full max-w-lg max-h-[95vh] overflow-hidden border-t-4 sm:border-4 border-yellow-400 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-slideUp">
        <div className="p-4 border-b-2 border-zinc-700 flex justify-between items-center bg-gradient-to-r from-yellow-900/30 to-zinc-900">
          <div>
            <h2 className="text-xl font-black text-white">
              {type === 'flood' ? '🌊 Lapor Banjir' : '✅ Lapor Jalan Kering'}
            </h2>
            <p className="text-zinc-500 text-xs mt-1">Langkah {step} dari 3</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white text-xl font-bold transition-all rounded">✕</button>
        </div>

        <div className="h-1 bg-zinc-800 flex">
          <div className={`h-full transition-all duration-300 ${step >= 1 ? 'bg-yellow-400' : 'bg-zinc-700'}`} style={{ width: '33.33%' }}></div>
          <div className={`h-full transition-all duration-300 ${step >= 2 ? 'bg-yellow-400' : 'bg-zinc-700'}`} style={{ width: '33.33%' }}></div>
          <div className={`h-full transition-all duration-300 ${step >= 3 ? 'bg-yellow-400' : 'bg-zinc-700'}`} style={{ width: '33.33%' }}></div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-140px)]">
          {step === 1 && (
            <div className="p-4 space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 flex items-center justify-center bg-yellow-400 text-black font-black rounded-full">1</span>
                <h3 className="text-white font-bold">Pilih Lokasi</h3>
              </div>
              <LocationPicker position={position} onPositionChange={handlePositionChange} cameras={cameras} onCameraSelect={handleCameraSelect} />
              <button type="button" onClick={() => setStep(2)} disabled={!canProceedStep1} className={`w-full py-3 font-bold text-lg border-2 border-black transition-all ${canProceedStep1 ? 'bg-yellow-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]' : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'}`}>Lanjut →</button>
            </div>
          )}

          {step === 2 && (
            <div className="p-4 space-y-4 animate-fadeIn">
              <button type="button" onClick={() => setStep(1)} className="text-zinc-400 hover:text-white text-sm flex items-center gap-1">← Kembali</button>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 flex items-center justify-center bg-yellow-400 text-black font-black rounded-full">2</span>
                <h3 className="text-white font-bold">{type === 'flood' ? 'Tingkat Ketinggian Air' : 'Konfirmasi Jalan Kering'}</h3>
              </div>
              {type === 'flood' ? (
                <div className="space-y-2">
                  {waterLevels.map((level) => (
                    <button key={level.value} type="button" onClick={() => setWaterLevel(level.value)} className={`w-full py-4 px-4 font-bold border-2 border-black text-left transition-all ${waterLevel === level.value ? `${level.color} text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]` : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}>
                      <div className="text-lg">{level.label}</div>
                      <div className={`text-xs mt-1 ${waterLevel === level.value ? 'text-black/70' : 'text-zinc-500'}`}>{level.desc}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-green-900/30 border-2 border-green-600 p-4 rounded">
                  <p className="text-green-400 font-bold mb-2">✅ Anda akan melaporkan jalan yang AMAN dilalui</p>
                  <p className="text-zinc-400 text-sm">Laporan ini akan membantu warga lain menemukan jalur alternatif saat banjir.</p>
                </div>
              )}
              <button type="button" onClick={() => setStep(3)} disabled={!canProceedStep2} className={`w-full py-3 font-bold text-lg border-2 border-black transition-all ${canProceedStep2 ? 'bg-yellow-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]' : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'}`}>Lanjut →</button>
            </div>
          )}

          {step === 3 && (
            <div className="p-4 space-y-4 animate-fadeIn">
              <button type="button" onClick={() => setStep(2)} className="text-zinc-400 hover:text-white text-sm flex items-center gap-1">← Kembali</button>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 flex items-center justify-center bg-yellow-400 text-black font-black rounded-full">3</span>
                <h3 className="text-white font-bold">Bukti & Kirim</h3>
              </div>
              <div className="bg-zinc-800 border-2 border-zinc-600 p-3 space-y-2">
                <p className="text-zinc-400 text-xs font-bold uppercase">Ringkasan Laporan</p>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Lokasi:</span>
                  <span className="text-white font-mono text-xs">{locationName || `${position?.[0].toFixed(4)}, ${position?.[1].toFixed(4)}`}</span>
                </div>
                {type === 'flood' && waterLevel && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Level:</span>
                    <span className={`font-bold ${waterLevel === 'siaga' ? 'text-yellow-400' : waterLevel === 'bahaya' ? 'text-orange-400' : 'text-red-400'}`}>{waterLevels.find(l => l.value === waterLevel)?.label}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-white font-bold mb-2 text-sm">📸 Bukti (Opsional tapi Direkomendasikan)</label>
                <ProofUpload onPhotoChange={setPhoto} onSocialUrlChange={setSocialUrl} socialUrl={socialUrl} />
              </div>
              {errors.length > 0 && (
                <div className="bg-red-900/50 border-2 border-red-500 p-3 rounded">
                  {errors.map((error, i) => (<p key={i} className="text-red-300 text-sm">{error}</p>))}
                </div>
              )}
              <button type="submit" disabled={submitting || !position} className={`w-full py-4 font-black text-lg border-4 border-black transition-all ${submitting || !position ? 'bg-zinc-600 text-zinc-400' : 'bg-yellow-400 text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px]'}`}>
                {submitting ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>Mengirim...</span> : '🚀 KIRIM LAPORAN'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
