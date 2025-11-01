import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Github, Linkedin } from 'lucide-react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled ? 'backdrop-blur-xl bg-black/40 border-b border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)]' : 'backdrop-blur-sm bg-black/20 border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 focus-enhanced">
          <span className="inline-block w-2 h-2 rounded-full bg-white mr-1" />
          <span className="font-semibold tracking-wide text-white/90 hover:text-white transition-colors">imadlab</span>
        </Link>

        {/* Nav */}
        <nav aria-label="Primary" className="hidden sm:flex items-center gap-6">
          {[
            { to: '/projects', label: 'Projects' },
            { to: '/blogs', label: 'Blogs' },
            { to: '/extras', label: 'Extras' },
            { to: '/about', label: 'About' },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative link-enhanced ${isActive ? 'text-white' : ''}`
              }
            >
              {({ isActive }) => (
                <span className="inline-flex items-center">
                  {item.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-[2px] transition-all ${
                      isActive || location.pathname.startsWith(item.to)
                        ? 'w-full bg-white/70'
                        : 'w-0 bg-transparent'
                    }`}
                  />
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Socials */}
        <div className="flex items-center gap-2">
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
        </div>
      </div>
    </header>
  );
};

export default Header;
