'use client';

import { SocialPlatform } from '../../lib/types';

interface SocialEmbedProps {
  url: string;
  platform: SocialPlatform;
  contentId: string;
}

export function SocialEmbed({ url, platform, contentId }: SocialEmbedProps) {
  const getEmbedUrl = () => {
    switch (platform) {
      case 'instagram':
        return `https://www.instagram.com/p/${contentId}/embed`;
      case 'twitter':
        return `https://platform.twitter.com/embed/Tweet.html?id=${contentId}`;
      case 'tiktok':
        return `https://www.tiktok.com/embed/v2/${contentId}`;
      default:
        return null;
    }
  };

  const embedUrl = getEmbedUrl();

  if (!embedUrl) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-yellow-400 underline hover:text-yellow-300"
      >
        Lihat di {platform}
      </a>
    );
  }

  return (
    <div className="w-full aspect-video bg-zinc-800 rounded overflow-hidden">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allowFullScreen
        loading="lazy"
        title={`${platform} embed`}
      />
    </div>
  );
}
