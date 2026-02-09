import { Link } from 'react-router-dom';
import { Cookie as CookieIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsCoarsePointer } from '@/hooks/useIsCoarsePointer';

interface FooterProps {
  onOpenCookiePrefs: () => void;
}

const Footer = ({ onOpenCookiePrefs }: FooterProps) => {
  const isCoarsePointer = useIsCoarsePointer();

  return (
    <>
      <footer className="mt-0 border-t border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            {/* Brand */}
            <div className="text-center md:text-left">
              <p className="text-sm text-white/60 max-w-md">
                Applied research notes, projects, and architecture work in multimodal industrial AI.
              </p>
            </div>

            {/* Cookie Preferences Button */}
            {!isCoarsePointer && (
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  className="inline-flex h-auto items-center gap-2 rounded-none border-0 bg-transparent px-0 py-0 text-sm text-white/75 hover:bg-transparent hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                  onClick={onOpenCookiePrefs}
                  aria-label="Manage cookie preferences"
                  title="Manage cookies"
                >
                  <CookieIcon className="w-4 h-4" />
                  <span>Cookies</span>
                </Button>
              </div>
            )}
          </div>

          <div className="mt-8 text-center text-xs text-white/50">
            <Link to="/admin" className="hover:text-white transition-colors" aria-label="Admin">
              ©
            </Link>
            &nbsp;{new Date().getFullYear()} imadlab. All rights reserved.
          </div>
        </div>
      </footer>

      {isCoarsePointer && (
        <Button
          variant="ghost"
          className="fixed z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/8 p-0 text-white shadow-lg backdrop-blur transition-all focus-enhanced hover:border-primary/50 hover:bg-primary/30 hover:shadow-[0_0_22px_rgba(148,163,255,0.55)]"
          style={{
            left: 'calc(env(safe-area-inset-left, 0px) + 2rem)',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)',
          }}
          onClick={onOpenCookiePrefs}
          aria-label="Manage cookie preferences"
          title="Manage cookies"
        >
          <CookieIcon className="w-5 h-5" />
        </Button>
      )}
    </>
  );
};

export default Footer;
