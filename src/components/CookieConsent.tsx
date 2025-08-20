import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie as CookieIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { acceptAll, rejectAll, setConsent, getConsent, ConsentState, hasDecision } from '@/lib/consent';

type Prefs = Pick<ConsentState, 'analytics' | 'marketing' | 'functional'>;

const CookieConsent = () => {
  const [open, setOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({ analytics: false, marketing: false, functional: true });

  useEffect(() => {
    const current = getConsent();
    if (!current) {
      setShowBanner(true);
    } else {
      setPrefs({ analytics: current.analytics, marketing: current.marketing, functional: current.functional });
    }
    // expose global opener for footer or settings link
    try {
      (window as any).imadlabOpenCookiePrefs = () => {
        setOpen(true);
      };
    } catch {}
  }, []);

  const handleAcceptAll = () => {
    acceptAll();
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    rejectAll();
    setShowBanner(false);
  };

  const handleSavePrefs = () => {
    setConsent({ analytics: prefs.analytics, marketing: prefs.marketing, functional: prefs.functional });
    setOpen(false);
    setShowBanner(false);
  };

  const Toggle = ({ id, label, desc, disabled, checked, onChange }: { id: string; label: string; desc: string; disabled?: boolean; checked: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <label htmlFor={id} className="font-medium text-white">{label}</label>
        <p className="text-white/60 text-sm mt-1">{desc}</p>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        disabled={!!disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-enhanced border ${
          disabled ? 'bg-white/10 border-white/10 cursor-not-allowed' : checked ? 'bg-white/80 border-white/80' : 'bg-white/20 border-white/20'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-black transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );

  const decision = hasDecision();

  return (
    <>
      {/* Banner */}
      {showBanner && (
        <div className="fixed inset-x-0 bottom-0 z-50" role="dialog" aria-label="Cookie consent">
          <div className="mx-auto max-w-5xl m-4 rounded-xl border border-white/10 bg-black/70 backdrop-blur px-5 py-4 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <p className="text-white font-semibold mb-1">We value your privacy</p>
                <p className="text-white/70 text-sm leading-relaxed">
                  We use cookies to enhance your browsing experience, provide basic functionality, and to understand traffic. You can accept all, reject non-essential, or manage preferences.
                </p>
              </div>
              <div className="flex gap-2 md:ml-4">
                <Button variant="ghost" className="bg-white/10 hover:bg-white/20 text-white" onClick={() => setOpen(true)}>
                  Manage
                </Button>
                <Button variant="ghost" className="bg-white/5 hover:bg-white/15 text-white" onClick={handleRejectAll}>
                  Reject
                </Button>
                <Button className="bg-white text-black hover:bg-white/90" onClick={handleAcceptAll}>
                  Accept
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-black text-white border border-white/10">
          <DialogHeader>
            <DialogTitle>Cookie preferences</DialogTitle>
            <DialogDescription className="text-white/70">
              Choose which categories of cookies you want to allow. Essential cookies are always on.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 divide-y divide-white/10">
            <Toggle
              id="consent-essential"
              label="Essential"
              desc="Required for basic site functionality, security, and network routing."
              disabled
              checked
              onChange={() => {}}
            />
            <Toggle
              id="consent-functional"
              label="Functional"
              desc="Remember preferences and enhance features (e.g., UI state)."
              checked={prefs.functional}
              onChange={(v) => setPrefs((p) => ({ ...p, functional: v }))}
            />
            <Toggle
              id="consent-analytics"
              label="Analytics"
              desc="Help us understand site usage to improve content and performance."
              checked={prefs.analytics}
              onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
            />
            <Toggle
              id="consent-marketing"
              label="Marketing"
              desc="Personalize content or measure campaign effectiveness."
              checked={prefs.marketing}
              onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" className="bg-white/5 hover:bg-white/15 text-white" onClick={handleRejectAll}>Reject all</Button>
            <Button className="bg-white text-black hover:bg-white/90" onClick={handleSavePrefs}>Save preferences</Button>
          </div>

          <p className="mt-3 text-xs text-white/50">
            You can update your preferences anytime via the “Manage cookies” link in the footer.
          </p>
        </DialogContent>
      </Dialog>

      {/* Persistent manage button (only after a decision) */}
      {!showBanner && decision && (
        <div className="fixed left-4 bottom-4 z-40">
          <Button
            variant="ghost"
            className="bg-white/5 hover:bg-white/15 text-white border border-white/10 rounded-full h-11 w-11 p-0 flex items-center justify-center"
            onClick={() => setOpen(true)}
            aria-label="Manage cookie preferences"
            title="Manage cookies"
          >
            <CookieIcon className="w-5 h-5" />
          </Button>
        </div>
      )}
    </>
  );
};

export default CookieConsent;
