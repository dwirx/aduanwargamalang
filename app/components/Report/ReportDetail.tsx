'use client';

import { useState } from 'react';
import { FloodReport } from '../../lib/types';
import { useAdmin } from '../../hooks/useAdmin';
import { supabase } from '../../lib/supabase';
import { SocialEmbed } from '../Social/SocialEmbed';

interface ReportDetailProps {
  report: FloodReport;
  onClose: () => void;
  onDelete?: () => void;
}

export function ReportDetail({ report, onClose, onDelete }: ReportDetailProps) {
  const { isAdmin } = useAdmin();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('flood_reports')
        .delete()
        .eq('id', report.id);

      if (error) throw error;
      onDelete?.();
      onClose();
    } catch (err) {
      alert('Gagal menghapus laporan');
    } finally {
      setDeleting(false);
    }
  };

  const levelInfo = report.type === 'dry_route' 
    ? { label: '✅ Jalan Kering', color: 'bg-green-500', desc: 'Jalan ini aman dilalui' }
    : report.water_level === 'siaga' 
    ? { label: '🟡 Siaga', color: 'bg-yellow-400', desc: 'Ketinggian air semata kaki - Motor masih bisa lewat' }
    : report.water_level === 'bahaya'
    ? { label: '🟠 Bahaya', color: 'bg-orange-500', desc: 'Ketinggian air selutut/sepinggang - Mobil kecil jangan lewat' }
    : { label: '🔴 Evakuasi', color: 'bg-red-500', desc: 'Ketinggian air sedada/atap - Butuh perahu karet' };

  return (
    <div className="fixed inset-0 z-[2500] bg-black/90 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div 
        className="bg-zinc-900 w-full max-w-lg max-h-[90vh] overflow-y-auto border-4 border-yellow-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 ${levelInfo.color} text-black`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black">{levelInfo.label}</h2>
              <p className="text-sm opacity-80 mt-1">{levelInfo.desc}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/40 text-black font-bold rounded transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Time & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800 p-3 rounded">
              <p className="text-zinc-500 text-xs mb-1">🕐 Waktu Lapor</p>
              <p className="text-white font-bold text-sm">
                {new Date(report.created_at).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="bg-zinc-800 p-3 rounded">
              <p className="text-zinc-500 text-xs mb-1">✅ Konfirmasi</p>
              <p className="text-green-400 font-bold text-sm">
                {report.confirmation_count} orang
              </p>
            </div>
          </div>

          {/* Coordinates */}
          <div className="bg-zinc-800 p-3 rounded">
            <p className="text-zinc-500 text-xs mb-1">📍 Koordinat</p>
            <p className="text-white font-mono text-sm">
              {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
            </p>
            <a
              href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 text-xs hover:underline mt-1 inline-block"
            >
              Buka di Google Maps →
            </a>
          </div>

          {/* Photo */}
          {report.photo_url && (
            <div>
              <p className="text-zinc-500 text-xs mb-2">📸 Foto Bukti</p>
              <img 
                src={report.photo_url} 
                alt="Bukti banjir" 
                className="w-full rounded border-2 border-zinc-700"
              />
            </div>
          )}

          {/* Social Media Embed */}
          {report.social_url && (
            <div>
              <p className="text-zinc-500 text-xs mb-2">
                🔗 Bukti Media Sosial ({report.social_platform || 'Link'})
              </p>
              <SocialEmbed url={report.social_url} platform={report.social_platform} />
            </div>
          )}

          {/* Expiry Info */}
          <div className="bg-zinc-800/50 p-3 rounded border border-zinc-700">
            <p className="text-zinc-400 text-xs">
              ⏳ Laporan akan kedaluwarsa dalam 3 jam jika tidak ada konfirmasi baru.
              Klik "Masih Banjir" di peta untuk mengkonfirmasi.
            </p>
          </div>

          {/* Admin Actions */}
          {isAdmin && (
            <div className="border-t-2 border-zinc-700 pt-4">
              <p className="text-red-400 text-xs font-bold mb-2">🔐 Admin Actions</p>
              {confirmDelete ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2 bg-zinc-700 text-white font-bold text-sm border-2 border-black"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 py-2 bg-red-600 text-white font-bold text-sm border-2 border-black disabled:opacity-50"
                  >
                    {deleting ? 'Menghapus...' : 'Ya, Hapus!'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleDelete}
                  className="w-full py-2 bg-red-600 text-white font-bold text-sm border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  🗑️ Hapus Laporan
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
