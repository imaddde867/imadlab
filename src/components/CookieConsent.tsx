import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { acceptAll, rejectAll, setConsent, getConsent } from '@/lib/consent';

declare global {
  interface Window {
    imadlabOpenCookiePrefs?: () => void;
  }
}

interface CookieConsentProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const CookieConsent = ({ isOpen, onOpenChange }: CookieConsentProps) => {
  const [showBanner, setShowBanner] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    const current = getConsent();
    if (!current) {
      setShowBanner(true);
      setAnalyticsAllowed(false);
    } else {
      setAnalyticsAllowed(current.analytics);
    }

    if (typeof window !== 'undefined') {
      window.imadlabOpenCookiePrefs = () => {
        onOpenChange(true);
      };
    }
  }, [onOpenChange]);

  useEffect(() => {
    if (isOpen) {
      const current = getConsent();
      if (current) {
        setAnalyticsAllowed(current.analytics);
      }
    }
  }, [isOpen]);

  const handleAcceptAll = () => {
    acceptAll();
    setAnalyticsAllowed(true);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    rejectAll();
    setAnalyticsAllowed(false);
    setShowBanner(false);
  };

  const handleSavePrefs = () => {
    setConsent({
      analytics: analyticsAllowed,
      marketing: false,
      functional: true,
    });
    setShowBanner(false);
    onOpenChange(false);
  };

  return (
    <>
      {/* Floating compact corner card — stays out of the way */}
      {showBanner && (
        <aside
          className="theme-night-desk fixed bottom-5 right-5 z-50 w-[calc(100%-2.5rem)] sm:w-auto sm:max-w-[360px] rounded-lg border border-white/10 bg-black/95 p-4 shadow-2xl backdrop-blur-md"
          role="region"
          aria-label="Privacy notice"
        >
          <p className="text-[13px] leading-relaxed text-[color:var(--nd-ink-2)]">
            <span className="font-medium text-[color:var(--nd-ink)]">Analytics:</span> I collect
            anonymous visit stats (via Cloudflare). No third-party trackers or ads.{' '}
            <button
              type="button"
              onClick={() => onOpenChange(true)}
              className="nd-link text-[13px] inline cursor-pointer"
            >
              Details
            </button>
          </p>
          <div className="mt-3.5 flex items-center justify-end gap-2 pt-2.5 border-t border-white/10">
            <button
              type="button"
              onClick={handleRejectAll}
              className="px-2.5 py-1 text-xs text-[color:var(--nd-ink-2)] hover:text-[color:var(--nd-ink)] transition-colors focus-enhanced cursor-pointer"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-3 py-1 text-xs font-medium text-[color:var(--nd-ink)] border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-colors focus-enhanced rounded cursor-pointer"
            >
              Allow
            </button>
          </div>
        </aside>
      )}

      {/* Preferences modal matching the site's typography */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="theme-night-desk max-w-md bg-black text-[color:var(--nd-ink)] border border-white/10 p-6 sm:rounded-xl">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-2xl font-semibold text-[color:var(--nd-ink)] tracking-tight">
              Privacy & analytics
            </DialogTitle>
            <DialogDescription className="text-sm text-[color:var(--nd-ink-2)] mt-1">
              This site doesn&apos;t run ads, sell data, or use commercial tracking pixels. Here is
              all that&apos;s stored:
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 divide-y divide-white/10 text-sm">
            {/* Essential */}
            <div className="py-3.5 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="font-medium text-[color:var(--nd-ink)]">Essential storage</p>
                <p className="text-xs text-[color:var(--nd-ink-2)] leading-relaxed">
                  Stores your privacy preferences and session state. Always active.
                </p>
              </div>
              <span className="shrink-0 rounded border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[color:var(--nd-ink-3)]">
                Required
              </span>
            </div>

            {/* Analytics */}
            <div className="py-3.5 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <label
                  htmlFor="consent-analytics"
                  className="font-medium text-[color:var(--nd-ink)] cursor-pointer"
                >
                  Anonymous analytics
                </label>
                <p className="text-xs text-[color:var(--nd-ink-2)] leading-relaxed">
                  Cloudflare Web Analytics and basic page counters to see what content is read. No
                  cross-site tracking or profiling.
                </p>
              </div>
              <button
                id="consent-analytics"
                type="button"
                role="switch"
                aria-checked={analyticsAllowed}
                onClick={() => setAnalyticsAllowed((prev) => !prev)}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors border focus-enhanced cursor-pointer ${
                  analyticsAllowed ? 'bg-white/80 border-white/80' : 'bg-white/20 border-white/20'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black transition-transform ${
                    analyticsAllowed ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              className="px-3 py-1.5 text-xs text-[color:var(--nd-ink-2)] hover:text-[color:var(--nd-ink)] transition-colors focus-enhanced cursor-pointer"
              onClick={() => {
                handleRejectAll();
                onOpenChange(false);
              }}
            >
              Decline all
            </button>
            <button
              type="button"
              className="px-3.5 py-1.5 text-xs font-medium text-[color:var(--nd-ink)] border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-colors focus-enhanced rounded cursor-pointer"
              onClick={handleSavePrefs}
            >
              Save preferences
            </button>
          </div>

          <p className="mt-2 text-xs text-[color:var(--nd-ink-3)]">
            You can update this anytime via the &ldquo;Cookie settings&rdquo; link in the footer.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsent;
