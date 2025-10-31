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
const CONSENT_MAX_AGE_DAYS = 180; // GDPR-friendly renewal period

type Subscriber = (state: ConsentState) => void;
const subscribers: Subscriber[] = [];

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
const decode = (str: string): ConsentState =>
  JSON.parse(decodeURIComponent(str)) as ConsentState;

export function getConsent(): ConsentState | null {
  try {
    const fromCookie = getCookie(CONSENT_COOKIE);
    const raw = fromCookie || localStorage.getItem(CONSENT_COOKIE);
    if (!raw) return null;
    const parsed = decode(raw) as ConsentState;
    if (!parsed || parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setConsent(next: Omit<ConsentState, 'version' | 'timestamp' | 'essential'> & { essential?: true }) {
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
    console.warn('imadlab: unable to persist consent in localStorage', error);
  }
  setCookie(CONSENT_COOKIE, encoded, CONSENT_MAX_AGE_DAYS);
  subscribers.forEach((cb) => cb(state));
  try {
    window.dispatchEvent(new CustomEvent('imadlab:consentchange', { detail: state }));
  } catch (error) {
    console.warn('imadlab: unable to dispatch consent change event', error);
  }
}

export function onConsentChange(cb: Subscriber) {
  subscribers.push(cb);
  return () => {
    const idx = subscribers.indexOf(cb);
    if (idx >= 0) subscribers.splice(idx, 1);
  };
}

export function isAllowed(category: ConsentCategory): boolean {
  if (category === 'essential') return true;
  const c = getConsent();
  return !!c && !!c[category];
}

export function acceptAll() {
  setConsent({ analytics: true, marketing: true, functional: true });
}

export function rejectAll() {
  setConsent({ analytics: false, marketing: false, functional: false });
}

export async function loadScriptIfConsented(category: ConsentCategory, src: string, attrs: Record<string, string> = {}) {
  if (!isAllowed(category)) return null;
  return new Promise<HTMLScriptElement>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
    s.onload = () => resolve(s);
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
}

export function hasDecision(): boolean {
  return !!getConsent();
}
