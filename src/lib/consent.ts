import { logger } from './logger';

export type ConsentCategory = 'essential' | 'analytics' | 'marketing' | 'functional';

export type ConsentState = {
  version: number;
  timestamp: number;
  essential: true;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
};

const CONSENT_COOKIE = 'imadlab_consent';
const CONSENT_VERSION = 1;
const CONSENT_MAX_AGE_DAYS = 180;
const CONSENT_MAX_AGE_MS = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

type Subscriber = (state: ConsentState) => void;
const subscribers: Subscriber[] = [];
let removeStorageListener: (() => void) | null = null;

const notify = (state: ConsentState) => {
  // One failing subscriber must not stop revocation from reaching the rest.
  for (const subscriber of [...subscribers]) {
    try {
      subscriber(state);
    } catch (error) {
      logger.warn('imadlab: consent subscriber failed', error);
    }
  }
};

const daysToExpires = (days: number) => {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  return d.toUTCString();
};

const setCookie = (name: string, value: string, days: number) => {
  document.cookie = `${name}=${value}; expires=${daysToExpires(days)}; path=/; SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

const encode = (obj: ConsentState) => encodeURIComponent(JSON.stringify(obj));
const decode = (str: string): ConsentState => JSON.parse(decodeURIComponent(str)) as ConsentState;

export function getConsent(): ConsentState | null {
  // Prefer the most recent valid decision. The cookie can be stale if a write
  // fails, and localStorage can outlive the cookie without an explicit expiry.
  let cookie: string | null = null;
  let stored: string | null = null;
  try {
    cookie = getCookie(CONSENT_COOKIE);
  } catch {
    // Cookies may be blocked.
  }
  try {
    stored = localStorage.getItem(CONSENT_COOKIE);
  } catch {
    // Storage may be blocked.
  }

  const now = Date.now();
  const candidates: ConsentState[] = [];
  for (const raw of [stored, cookie]) {
    if (!raw) continue;
    try {
      const parsed = decode(raw);
      if (
        parsed.version !== CONSENT_VERSION ||
        parsed.essential !== true ||
        typeof parsed.analytics !== 'boolean' ||
        typeof parsed.marketing !== 'boolean' ||
        typeof parsed.functional !== 'boolean' ||
        !Number.isFinite(parsed.timestamp) ||
        parsed.timestamp > now + 5 * 60 * 1000 ||
        now - parsed.timestamp >= CONSENT_MAX_AGE_MS
      )
        continue;
      candidates.push(parsed);
    } catch {
      // Ignore malformed records.
    }
  }
  return candidates.sort((a, b) => b.timestamp - a.timestamp)[0] ?? null;
}

export function setConsent(
  next: Omit<ConsentState, 'version' | 'timestamp' | 'essential'> & { essential?: true }
) {
  const state: ConsentState = {
    version: CONSENT_VERSION,
    timestamp: Date.now(),
    essential: true,
    analytics: !!next.analytics,
    marketing: !!next.marketing,
    functional: !!next.functional,
  };
  const encoded = encode(state);
  try {
    localStorage.setItem(CONSENT_COOKIE, encoded);
  } catch (error) {
    logger.warn('imadlab: unable to persist consent in localStorage', error);
  }
  try {
    setCookie(CONSENT_COOKIE, encoded, CONSENT_MAX_AGE_DAYS);
  } catch (error) {
    logger.warn('imadlab: unable to persist consent cookie', error);
  }
  notify(state);
  try {
    window.dispatchEvent(new CustomEvent('imadlab:consentchange', { detail: state }));
  } catch (error) {
    logger.warn('imadlab: unable to dispatch consent change event', error);
  }
}

export function onConsentChange(cb: Subscriber) {
  subscribers.push(cb);
  if (!removeStorageListener && typeof window !== 'undefined') {
    const onStorage = (event: StorageEvent) => {
      // A null key means the other tab cleared storage.
      if (event.key !== CONSENT_COOKIE && event.key !== null) return;
      const state: ConsentState = getConsent() ?? {
        version: CONSENT_VERSION,
        timestamp: Date.now(),
        essential: true,
        analytics: false,
        marketing: false,
        functional: false,
      };
      // Revocation in another tab must stop analytics here too.
      notify(state);
    };
    window.addEventListener('storage', onStorage);
    removeStorageListener = () => window.removeEventListener('storage', onStorage);
  }
  return () => {
    const idx = subscribers.indexOf(cb);
    if (idx >= 0) subscribers.splice(idx, 1);
    if (subscribers.length === 0) {
      removeStorageListener?.();
      removeStorageListener = null;
    }
  };
}

// Owner/developer exclusion for analytics
const OWNER_EXCLUSION_KEY = 'imadlab_exclude_analytics';

/**
 * Check if the current visitor is the site owner/developer
 * who has opted out of being tracked.
 */
export function isOwnerExcluded(): boolean {
  try {
    return localStorage.getItem(OWNER_EXCLUSION_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Exclude yourself (the site owner) from analytics tracking.
 * Run this once in your browser console: excludeFromAnalytics()
 */
export function excludeFromAnalytics(): void {
  try {
    localStorage.setItem(OWNER_EXCLUSION_KEY, 'true');
    console.log('✅ You are now excluded from analytics tracking on this browser.');
  } catch (error) {
    console.error('Failed to set exclusion flag:', error);
  }
}

/**
 * Re-include yourself in analytics tracking.
 * Run this in your browser console: includeInAnalytics()
 */
export function includeInAnalytics(): void {
  try {
    localStorage.removeItem(OWNER_EXCLUSION_KEY);
    console.log('✅ You are now included in analytics tracking on this browser.');
  } catch (error) {
    console.error('Failed to remove exclusion flag:', error);
  }
}

export function isAllowed(category: ConsentCategory): boolean {
  if (category === 'essential') return true;

  // If this is the site owner/developer, exclude from analytics/marketing
  if ((category === 'analytics' || category === 'marketing') && isOwnerExcluded()) {
    return false;
  }

  const c = getConsent();
  // No decision yet — deny until explicit opt-in (GDPR default)
  if (!c) return false;
  return !!c[category];
}

// The site does not use marketing cookies. Never opt into them implicitly.
export function acceptAll() {
  setConsent({ analytics: true, marketing: false, functional: getConsent()?.functional ?? false });
}

export function rejectAll() {
  setConsent({ analytics: false, marketing: false, functional: false });
}

export function hasDecision(): boolean {
  return !!getConsent();
}
