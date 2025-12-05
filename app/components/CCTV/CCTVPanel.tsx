'use client';

import { useState } from 'react';
import { CCTVCamera } from '../../lib/cctv-types';
import { CCTVList } from './CCTVList';

interface CCTVPanelProps {
  cameras: CCTVCamera[];
  isOpen: boolean;
  onClose: () => void;
  onCameraSelect: (camera: CCTVCamera) => void;
}

export function CCTVPanel({ cameras, isOpen, onClose, onCameraSelect }: CCTVPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-0 bottom-0 w-full sm:w-96 z-[1500] bg-zinc-900 border-l-4 border-cyan-400 shadow-[-8px_0px_20px_rgba(0,0,0,0.5)] animate-slideLeft flex flex-col">
      {/* Header */}
      <div className="p-4 border-b-2 border-zinc-700 bg-gradient-to-r from-cyan-900/50 to-zinc-900 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            📹 CCTV Kota Malang
          </h3>
          <p className="text-cyan-400 text-sm">
            {cameras.length} kamera aktif
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white text-xl font-bold transition-all rounded"
        >
          ✕
        </button>
      </div>

      {/* Camera List */}
      <CCTVList 
        cameras={cameras} 
        onCameraSelect={onCameraSelect}
      />
    </div>
  );
}
