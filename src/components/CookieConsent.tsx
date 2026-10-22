import { useEffect, useState } from 'react';
import { Shield, X } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getConsent, setConsent } from '@/lib/consent';

interface CookieConsentProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const CookieConsent = ({ isOpen, onOpenChange }: CookieConsentProps) => {
  const [showChip, setShowChip] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(false);

  useEffect(() => {
    setShowChip(!getConsent());
  }, []);

  useEffect(() => {
    if (isOpen) setAnalyticsOn(!!getConsent()?.analytics);
  }, [isOpen]);

  const choose = (analytics: boolean) => {
    setConsent({ analytics, marketing: false, functional: true });
    setShowChip(false);
    onOpenChange(false);
  };

  return (
    <>
      {showChip && (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          aria-haspopup="dialog"
          aria-label="Privacy choices"
          className="theme-night-desk fixed bottom-4 right-4 z-50 inline-flex min-h-10 animate-in items-center gap-2 rounded-lg border border-[color:var(--nd-line)] bg-[hsl(var(--card))] px-3 text-sm text-[color:var(--nd-ink-2)] shadow-lg transition-colors fade-in slide-in-from-bottom-1 duration-300 hover:text-[color:var(--nd-ink)] focus-enhanced motion-reduce:animate-none"
        >
          <span className="relative sm:hidden" aria-hidden="true">
            <Shield className="h-4 w-4" strokeWidth={1.75} />
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" />
          </span>
          <span
            aria-hidden="true"
            className="hidden h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] sm:inline-block"
          />
          <span className="hidden sm:inline">Privacy</span>
        </button>
      )}

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="theme-night-desk max-w-sm rounded-lg border border-[color:var(--nd-line)] bg-[hsl(var(--card))] p-6 text-[color:var(--nd-ink)] max-sm:w-[calc(100%-1.5rem)]">
          <DialogClose className="absolute right-4 top-4 rounded p-1 text-[color:var(--nd-ink-3)] transition-colors hover:text-[color:var(--nd-ink)] focus-enhanced cursor-pointer">
            <X className="h-4 w-4" strokeWidth={1.75} />
            <span className="sr-only">Close</span>
          </DialogClose>

          <DialogHeader className="pr-6 text-left">
            <DialogTitle className="font-display text-2xl font-semibold tracking-tight text-[color:var(--nd-ink)]">
              Privacy
            </DialogTitle>
            <DialogDescription className="mt-2 text-[17px] leading-relaxed text-[color:var(--nd-ink-2)]">
              No ads, no trackers. Anonymous analytics is {analyticsOn ? 'on' : 'off'}.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-2 text-[17px]">
            <button type="button" onClick={() => choose(true)} className="nd-link cursor-pointer">
              Allow analytics
            </button>
            <button
              type="button"
              onClick={() => choose(false)}
              className="nd-quiet-link cursor-pointer text-[color:var(--nd-ink-2)]"
            >
              Essential only
            </button>
          </div>

          <p className="mt-4 text-sm text-[color:var(--nd-ink-3)]">
            Change this anytime from the footer.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsent;
