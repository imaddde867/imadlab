import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Github, Linkedin, Menu, X } from 'lucide-react';
import { PRIMARY_NAV_ITEMS } from '@/lib/navigation';
import { prefetchRoute } from '@/lib/routePrefetch';
import { useIsCoarsePointer } from '@/hooks/useIsCoarsePointer';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isCoarsePointer = useIsCoarsePointer();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const maybePrefetch = (path: string) => {
    if (!isCoarsePointer) {
      prefetchRoute(path);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          scrolled ? 'backdrop-blur-xl bg-black/40 shadow-[0_8px_30px_rgba(0,0,0,0.12)]' : 'backdrop-blur-sm bg-black/20'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 focus-enhanced">
            <span className="inline-block w-2 h-2 rounded-full bg-primary mr-1 animate-blink-purple" />
            <span className="font-semibold tracking-wide text-white/90 hover:text-white transition-colors">imadlab</span>
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="Primary" className="hidden sm:flex items-center gap-6">
            {PRIMARY_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onPointerEnter={() => maybePrefetch(item.path)}
                onFocus={() => maybePrefetch(item.path)}
                className={({ isActive }) =>
                  `relative link-enhanced ${isActive ? 'text-white' : ''}`
                }
              >
                {({ isActive }) => (
                  <span className="inline-flex items-center">
                    {item.label}
                    <span
                      className={`pointer-events-none absolute -bottom-1 left-0 h-[3px] rounded-full transition-all duration-300 ${
                        isActive || location.pathname.startsWith(item.path)
                          ? 'w-full bg-primary/80 shadow-[0_0_18px_rgba(148,163,255,0.55)]'
                          : 'w-0 bg-transparent'
                      }`}
                    />
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Socials */}
            <a
              href="https://github.com/imaddde867"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-enhanced"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/imad-eddine-e-986741262"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-enhanced"
            >
              <Linkedin className="w-4 h-4" />
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              className="sm:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-enhanced"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 sm:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Content */}
          <nav 
            className="relative top-14 bg-black/95 border-b border-white/10 shadow-2xl"
            aria-label="Mobile navigation"
          >
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-1">
              {PRIMARY_NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onPointerEnter={() => maybePrefetch(item.path)}
                  onFocus={() => maybePrefetch(item.path)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-lg text-base font-medium transition-all ${
                      isActive || location.pathname.startsWith(item.path)
                        ? 'bg-white/10 text-white border-l-2 border-white'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
