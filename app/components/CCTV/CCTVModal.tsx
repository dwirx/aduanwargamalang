'use client';

import { useState, useEffect } from 'react';
import { CCTVCamera } from '../../lib/cctv-types';

interface CCTVModalProps {
  camera: CCTVCamera;
  onClose: () => void;
}

export function CCTVModal({ camera, onClose }: CCTVModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [streamError, setStreamError] = useState(false);
  const [activeTab, setActiveTab] = useState<'webrtc' | 'hls'>('webrtc');

  useEffect(() => {
    // Reset states when camera changes
    setIsLoading(true);
    setStreamError(false);
  }, [camera.id]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setStreamError(true);
  };

  return (
    <div 
      className="fixed inset-0 z-[3000] bg-black/95 flex items-center justify-center p-2 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-900 w-full max-w-5xl max-h-[95vh] overflow-hidden border-4 border-cyan-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3 sm:p-4 border-b-2 border-zinc-700 flex justify-between items-start bg-gradient-to-r from-cyan-900/50 to-zinc-900">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="animate-pulse text-red-500">●</span>
              <span className="text-xs text-red-400 font-bold uppercase tracking-wider">LIVE</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 truncate">
              📹 {camera.name}
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 truncate">{camera.formatted_address}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-1 bg-cyan-900 text-cyan-300 text-xs font-bold rounded">
                {camera.district}
              </span>
              <span className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs font-bold rounded">
                {camera.camera_type}
              </span>
              {camera.isIntersection === 1 && (
                <span className="px-2 py-1 bg-yellow-900 text-yellow-300 text-xs font-bold rounded animate-pulse">
                  ⚠️ Persimpangan
                </span>
              )}
              {camera.priority === 'Tinggi' && (
                <span className="px-2 py-1 bg-red-900 text-red-300 text-xs font-bold rounded">
                  🔥 Prioritas Tinggi
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-2 w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white text-2xl font-bold transition-all rounded"
          >
            ✕
          </button>
        </div>

        {/* Stream Tabs */}
        <div className="flex border-b-2 border-zinc-700">
          <button
            onClick={() => setActiveTab('webrtc')}
            className={`flex-1 py-2 px-4 font-bold text-sm transition-all ${
              activeTab === 'webrtc' 
                ? 'bg-cyan-600 text-white' 
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            🎥 WebRTC (Realtime)
          </button>
          <button
            onClick={() => setActiveTab('hls')}
            className={`flex-1 py-2 px-4 font-bold text-sm transition-all ${
              activeTab === 'hls' 
                ? 'bg-cyan-600 text-white' 
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            📺 HLS Stream
          </button>
        </div>

        {/* Video Stream */}
        <div className="aspect-video bg-black relative">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
              <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-cyan-400 font-bold animate-pulse">Menghubungkan ke CCTV...</p>
              <p className="text-zinc-500 text-sm mt-2">{camera.name}</p>
            </div>
          )}
          
          {streamError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900">
              <div className="text-6xl mb-4">📵</div>
              <p className="text-red-400 font-bold mb-2">Stream tidak tersedia</p>
              <p className="text-zinc-500 text-sm text-center px-4">
                CCTV mungkin sedang offline atau ada masalah koneksi
              </p>
              <a
                href={activeTab === 'webrtc' ? camera.webrtc_url : camera.hls_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 px-6 py-2 bg-cyan-600 text-white font-bold rounded hover:bg-cyan-500 transition-colors"
              >
                Coba Buka Langsung →
              </a>
            </div>
          ) : (
            <iframe
              key={`${camera.id}-${activeTab}`}
              src={activeTab === 'webrtc' ? camera.webrtc_url : camera.hls_url}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; encrypted-media"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          )}
          
          {/* Stream Info Overlay */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start pointer-events-none">
            <div className="bg-black/70 px-2 py-1 rounded text-xs text-white">
              ID: {camera.stream_id.slice(0, 12)}...
            </div>
            <div className="bg-red-600/90 px-2 py-1 rounded text-xs text-white font-bold flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              REC
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-3 sm:p-4 border-t-2 border-zinc-700 bg-zinc-800/50">
          <div className="grid grid-cols-2 gap-3">
            <a
              href={camera.webrtc_url}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 bg-cyan-500 text-black font-bold text-center text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              🔗 Buka WebRTC
            </a>
            <a
              href={camera.hls_url}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 bg-zinc-700 text-white font-bold text-center text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              📺 Buka HLS
            </a>
          </div>
          <p className="text-zinc-500 text-xs text-center mt-3">
            💡 Jika stream tidak muncul, coba buka di tab baru atau gunakan tab HLS
          </p>
        </div>
      </div>
    </div>
  );
}
