/**
 * Analytics utility functions for parsing and extracting analytics data
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type TrafficSource = 'direct' | 'search' | 'social' | 'referral' | 'email' | 'paid';

/**
 * Parse user agent to extract browser information
 */
export const getBrowserInfo = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();

  if (ua.includes('edg/')) return 'Edge';
  if (ua.includes('chrome/') && !ua.includes('edg/')) return 'Chrome';
  if (ua.includes('safari/') && !ua.includes('chrome/')) return 'Safari';
  if (ua.includes('firefox/')) return 'Firefox';
  if (ua.includes('opera/') || ua.includes('opr/')) return 'Opera';
  if (ua.includes('trident/')) return 'IE';

  return 'Other';
};

/**
 * Parse user agent to extract OS information
 */
export const getOSInfo = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();

  if (ua.includes('windows nt 10')) return 'Windows 10/11';
  if (ua.includes('windows nt 6.3')) return 'Windows 8.1';
  if (ua.includes('windows nt 6.2')) return 'Windows 8';
  if (ua.includes('windows nt 6.1')) return 'Windows 7';
  if (ua.includes('windows')) return 'Windows';

  if (ua.includes('mac os x')) {
    const match = ua.match(/mac os x ([\d_]+)/);
    if (match) {
      const version = match[1].replace(/_/g, '.');
      return `macOS ${version}`;
    }
    return 'macOS';
  }

  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('cros')) return 'Chrome OS';

  return 'Other';
};

/**
 * Detect device type from user agent and screen size
 */
export const getDeviceType = (userAgent: string, screenWidth?: number): DeviceType => {
  const ua = userAgent.toLowerCase();

  // Check user agent first
  if (ua.includes('mobile') || (ua.includes('android') && !ua.includes('tablet'))) {
    return 'mobile';
  }

  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }

  // Use screen width as fallback
  if (screenWidth) {
    if (screenWidth < 768) return 'mobile';
    if (screenWidth < 1024) return 'tablet';
  }

  return 'desktop';
};

/**
 * Extract UTM parameters from URL
 */
export const extractUTMParams = (url: string) => {
  const urlObj = new URL(url, window.location.origin);
  const params = urlObj.searchParams;

  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_term: params.get('utm_term') || undefined,
    utm_content: params.get('utm_content') || undefined,
  };
};

/**
 * Determine traffic source from referrer and UTM params
 */
export const getTrafficSource = (referrer: string | null, utmSource?: string): TrafficSource => {
  // Check UTM source first
  if (utmSource) {
    const source = utmSource.toLowerCase();
    if (
      source.includes('google') ||
      source.includes('bing') ||
      source.includes('yahoo') ||
      source.includes('duckduckgo')
    ) {
      return 'search';
    }
    if (
      source.includes('facebook') ||
      source.includes('twitter') ||
      source.includes('linkedin') ||
      source.includes('instagram') ||
      source.includes('tiktok') ||
      source.includes('reddit')
    ) {
      return 'social';
    }
    if (source.includes('email') || source.includes('newsletter')) {
      return 'email';
    }
    if (source.includes('ads') || source.includes('cpc') || source.includes('ppc')) {
      return 'paid';
    }
  }

  // No referrer means direct traffic
  if (!referrer || referrer === '') {
    return 'direct';
  }

  // Parse referrer domain
  try {
    const referrerUrl = new URL(referrer);
    const domain = referrerUrl.hostname.toLowerCase();

    // Remove www. prefix
    const cleanDomain = domain.replace(/^www\./, '');

    // Check if it's the same domain (internal link)
    if (cleanDomain === window.location.hostname.replace(/^www\./, '')) {
      return 'direct';
    }

    // Search engines
    const searchEngines = ['google', 'bing', 'yahoo', 'duckduckgo', 'baidu', 'yandex', 'ask'];
    if (searchEngines.some((engine) => domain.includes(engine))) {
      return 'search';
    }

    // Social media
    const socialPlatforms = [
      'facebook',
      'twitter',
      'linkedin',
      'instagram',
      'tiktok',
      'reddit',
      'pinterest',
      'youtube',
      'snapchat',
      'whatsapp',
      't.co',
    ];
    if (socialPlatforms.some((platform) => domain.includes(platform))) {
      return 'social';
    }

    // Email clients
    if (domain.includes('mail') || domain.includes('outlook') || domain.includes('gmail')) {
      return 'email';
    }

    // Everything else is referral
    return 'referral';
  } catch {
    return 'direct';
  }
};

/**
 * Get screen resolution
 */
export const getScreenResolution = (): string => {
  return `${window.screen.width}x${window.screen.height}`;
};

/**
 * Get browser language
 */
export const getBrowserLanguage = (): string => {
  return (
    navigator.language ||
    (navigator as Navigator & { userLanguage?: string }).userLanguage ||
    'en-US'
  );
};

/**
 * Get timezone
 */
export const getTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Attempt to get geolocation (requires user permission)
 * Returns null if not available or user denies permission
 */
export const getGeolocation = (): Promise<{ latitude: number; longitude: number } | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        resolve(null);
      },
      {
        timeout: 5000,
        maximumAge: 600000, // Cache for 10 minutes
      }
    );
  });
};

/**
 * Get all analytics metadata
 */
export const getAnalyticsMetadata = async () => {
  const userAgent = navigator.userAgent;
  const screenWidth = window.screen.width;

  const metadata = {
    device_type: getDeviceType(userAgent, screenWidth),
    browser: getBrowserInfo(userAgent),
    os: getOSInfo(userAgent),
    screen_resolution: getScreenResolution(),
    language: getBrowserLanguage(),
    timezone: getTimezone(),
    user_agent: userAgent,
  };

  return metadata;
};
