'use client';

import { CCTVCamera } from '../../lib/cctv-types';

interface CCTVModalProps {
  camera: CCTVCamera;
  onClose: () => void;
}

export function CCTVModal({ camera, onClose }: CCTVModalProps) {
  return (
    <div className="fixed inset-0 z-[3000] bg-black/90 flex items-center justify-center p-4">
      <div className="bg-zinc-900 w-full max-w-4xl max-h-[90vh] overflow-hidden border-4 border-cyan-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="p-4 border-b-2 border-zinc-700 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              📹 {camera.name}
            </h2>
            <p className="text-zinc-400 text-sm mt-1">{camera.formatted_address}</p>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-1 bg-cyan-900 text-cyan-300 text-xs font-bold">
                {camera.district}
              </span>
              <span className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs font-bold">
                {camera.camera_type}
              </span>
              {camera.isIntersection === 1 && (
                <span className="px-2 py-1 bg-yellow-900 text-yellow-300 text-xs font-bold">
                  Persimpangan
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-3xl font-bold leading-none"
          >
            ✕
          </button>
        </div>

        {/* Video Stream */}
        <div className="aspect-video bg-black relative">
          <iframe
            src={camera.webrtc_url}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media"
          />
          
          {/* Fallback info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <p className="text-white text-sm">
              Stream ID: {camera.stream_id}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t-2 border-zinc-700 flex gap-3">
          <a
            href={camera.webrtc_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 bg-cyan-500 text-black font-bold text-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            🔗 Buka di Tab Baru
          </a>
          <a
            href={camera.hls_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 bg-zinc-700 text-white font-bold text-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            📺 HLS Stream
          </a>
        </div>
      </div>
    </div>
  );
}
