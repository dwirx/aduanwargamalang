import { SocialPlatform, SocialUrlParseResult, ReportFormData, ValidationResult } from './types';

const INSTAGRAM_REGEX = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|stories)\/([A-Za-z0-9_-]+)/;
const TWITTER_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/;
const TIKTOK_REGEX = /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/(\d+)/;

export function isInstagramUrl(url: string): boolean {
  return INSTAGRAM_REGEX.test(url);
}

export function isTwitterUrl(url: string): boolean {
  return TWITTER_REGEX.test(url);
}

export function isTikTokUrl(url: string): boolean {
  return TIKTOK_REGEX.test(url);
}

export function extractSocialContentId(url: string, platform: SocialPlatform): string | null {
  let match: RegExpMatchArray | null = null;
  
  switch (platform) {
    case 'instagram':
      match = url.match(INSTAGRAM_REGEX);
      break;
    case 'twitter':
      match = url.match(TWITTER_REGEX);
      break;
    case 'tiktok':
      match = url.match(TIKTOK_REGEX);
      break;
  }
  
  return match ? match[1] : null;
}

export function validateSocialUrl(url: string): SocialUrlParseResult | null {
  if (!url || url.trim() === '') return null;
  
  if (isInstagramUrl(url)) {
    const contentId = extractSocialContentId(url, 'instagram');
    if (contentId) {
      return {
        platform: 'instagram',
        contentId,
        embedUrl: `https://www.instagram.com/p/${contentId}/embed`
      };
    }
  }
  
  if (isTwitterUrl(url)) {
    const contentId = extractSocialContentId(url, 'twitter');
    if (contentId) {
      return {
        platform: 'twitter',
        contentId,
        embedUrl: `https://platform.twitter.com/embed/Tweet.html?id=${contentId}`
      };
    }
  }
  
  if (isTikTokUrl(url)) {
    const contentId = extractSocialContentId(url, 'tiktok');
    if (contentId) {
      return {
        platform: 'tiktok',
        contentId,
        embedUrl: `https://www.tiktok.com/embed/v2/${contentId}`
      };
    }
  }
  
  return null;
}

export function validateReportForm(data: ReportFormData): ValidationResult {
  const errors: string[] = [];
  
  // Check location
  if (!data.latitude || !data.longitude) {
    errors.push('Lokasi harus dipilih di peta');
  }
  
  // Check water level for flood reports
  if (data.type === 'flood' && !data.water_level) {
    errors.push('Tingkat ketinggian air harus dipilih');
  }
  
  // Check proof (photo or social URL)
  const hasPhoto = data.photo !== null;
  const hasSocialUrl = data.social_url !== null && data.social_url.trim() !== '';
  
  if (!hasPhoto && !hasSocialUrl) {
    errors.push('Bukti foto atau link sosial media harus disertakan');
  }
  
  // Validate social URL if provided
  if (hasSocialUrl && !validateSocialUrl(data.social_url!)) {
    errors.push('Link sosial media tidak valid (harus Instagram, Twitter/X, atau TikTok)');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
