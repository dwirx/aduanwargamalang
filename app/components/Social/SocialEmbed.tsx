'use client';

import { useState } from 'react';
import { SocialPlatform } from '../../lib/types';

interface SocialEmbedProps {
  url: string;
  platform?: SocialPlatform | string | null;
  contentId?: string;
}

// Extract content ID from various social media URLs
function extractContentId(url: string, platform: string | null): string | null {
  try {
    if (platform === 'instagram') {
      // Instagram: /p/CODE/ or /reel/CODE/
      const match = url.match(/\/(p|reel|reels)\/([A-Za-z0-9_-]+)/);
      return match ? match[2] : null;
    }
    if (platform === 'twitter') {
      // Twitter/X: /status/ID
      const match = url.match(/\/status\/(\d+)/);
      return match ? match[1] : null;
    }
    if (platform === 'tiktok') {
      // TikTok: /video/ID or /@user/video/ID
      const match = url.match(/\/video\/(\d+)/);
      return match ? match[1] : null;
    }
  } catch {
    return null;
  }
  return null;
}

// Detect platform from URL
function detectPlatform(url: string): SocialPlatform | null {
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  if (url.includes('tiktok.com')) return 'tiktok';
  return null;
}

export function SocialEmbed({ url, platform, contentId }: SocialEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  const detectedPlatform = platform || detectPlatform(url);
  const extractedId = contentId || (detectedPlatform ? extractContentId(url, detectedPlatform) : null);

  const getEmbedUrl = () => {
    if (!extractedId) return null;
    
    switch (detectedPlatform) {
      case 'instagram':
        return `https://www.instagram.com/p/${extractedId}/embed/captioned`;
      case 'twitter':
        return `https://platform.twitter.com/embed/Tweet.html?id=${extractedId}&theme=dark`;
      case 'tiktok':
        return `https://www.tiktok.com/embed/v2/${extractedId}`;
      default:
        return null;
    }
  };

  const embedUrl = getEmbedUrl();

  const getPlatformIcon = () => {
    switch (detectedPlatform) {
      case 'instagram': return '📸';
      case 'twitter': return '🐦';
      case 'tiktok': return '🎵';
      default: return '🔗';
    }
  };

  const getPlatformName = () => {
    switch (detectedPlatform) {
      case 'instagram': return 'Instagram';
      case 'twitter': return 'Twitter/X';
      case 'tiktok': return 'TikTok';
      default: return 'Link';
    }
  };

  const getPlatformColor = () => {
    switch (detectedPlatform) {
      case 'instagram': return 'from-purple-600 to-pink-500';
      case 'twitter': return 'from-blue-500 to-blue-600';
      case 'tiktok': return 'from-black to-pink-500';
      default: return 'from-zinc-600 to-zinc-700';
    }
  };

  // If no embed URL available, show link button
  if (!embedUrl) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`block w-full p-4 bg-gradient-to-r ${getPlatformColor()} text-white font-bold text-center rounded border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all`}
      >
        {getPlatformIcon()} Buka di {getPlatformName()} →
      </a>
    );
  }

  // Show preview button first, then embed on click
  if (!showEmbed) {
    return (
      <div className="space-y-2">
        <button
          onClick={() => setShowEmbed(true)}
          className={`w-full p-4 bg-gradient-to-r ${getPlatformColor()} text-white font-bold text-center rounded border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all`}
        >
          {getPlatformIcon()} Tampilkan {getPlatformName()}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-zinc-400 text-xs hover:text-white transition-colors"
        >
          atau buka di tab baru →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Embed Container */}
      <div className="relative w-full bg-zinc-800 rounded overflow-hidden border-2 border-zinc-700">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-zinc-400 text-xs">Memuat {getPlatformName()}...</p>
            </div>
          </div>
        )}
        
        {hasError ? (
          <div className="p-6 text-center">
            <p className="text-red-400 mb-2">Gagal memuat embed</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 underline text-sm"
            >
              Buka langsung di {getPlatformName()} →
            </a>
          </div>
        ) : (
          <iframe
            src={embedUrl}
            className={`w-full ${detectedPlatform === 'tiktok' ? 'h-[580px]' : 'min-h-[400px]'}`}
            allowFullScreen
            loading="lazy"
            title={`${getPlatformName()} embed`}
            onLoad={() => setIsLoading(false)}
            onError={() => { setIsLoading(false); setHasError(true); }}
            style={{ border: 'none' }}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowEmbed(false)}
          className="flex-1 py-2 bg-zinc-700 text-white font-bold text-xs rounded hover:bg-zinc-600 transition-colors"
        >
          Sembunyikan
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 bg-zinc-700 text-white font-bold text-xs rounded text-center hover:bg-zinc-600 transition-colors"
        >
          Buka di {getPlatformName()}
        </a>
      </div>
    </div>
  );
}
