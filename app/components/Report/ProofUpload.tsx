'use client';

import { useState } from 'react';
import { validateSocialUrl } from '../../lib/validators';

interface ProofUploadProps {
  onPhotoChange: (file: File | null) => void;
  onSocialUrlChange: (url: string | null) => void;
  socialUrl: string | null;
}

export function ProofUpload({ onPhotoChange, onSocialUrlChange, socialUrl }: ProofUploadProps) {
  const [activeTab, setActiveTab] = useState<'photo' | 'social'>('social');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      onPhotoChange(file);
      onSocialUrlChange(null);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onSocialUrlChange(url || null);
    onPhotoChange(null);
    setPhotoPreview(null);
    
    if (url && !validateSocialUrl(url)) {
      setUrlError('Link harus dari Instagram, Twitter/X, atau TikTok');
    } else {
      setUrlError(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`flex-1 py-2 font-bold border-2 border-black transition-all ${
            activeTab === 'social'
              ? 'bg-yellow-400 text-black'
              : 'bg-zinc-700 text-white'
          }`}
        >
          🔗 Link Sosmed
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('photo')}
          className={`flex-1 py-2 font-bold border-2 border-black transition-all ${
            activeTab === 'photo'
              ? 'bg-yellow-400 text-black'
              : 'bg-zinc-700 text-white'
          }`}
        >
          📷 Upload Foto
        </button>
      </div>

      {activeTab === 'social' ? (
        <div className="space-y-2">
          <input
            type="url"
            value={socialUrl || ''}
            onChange={handleUrlChange}
            placeholder="Paste link Instagram/Twitter/TikTok..."
            className="w-full px-4 py-3 bg-zinc-800 border-2 border-zinc-600 text-white placeholder-zinc-500 focus:border-yellow-400 focus:outline-none"
          />
          {urlError && (
            <p className="text-red-400 text-sm">{urlError}</p>
          )}
          <p className="text-zinc-500 text-xs">
            Contoh: https://instagram.com/p/xxx atau https://x.com/user/status/xxx
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="block w-full py-8 border-2 border-dashed border-zinc-600 text-center cursor-pointer hover:border-yellow-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="max-h-32 mx-auto" />
            ) : (
              <span className="text-zinc-400">📷 Tap untuk pilih foto</span>
            )}
          </label>
        </div>
      )}
    </div>
  );
}
