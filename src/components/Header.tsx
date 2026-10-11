import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { PRIMARY_NAV_ITEMS } from '@/lib/navigation';
import { prefetchRoute } from '@/lib/routePrefetch';
import { useIsCoarsePointer } from '@/hooks/useIsCoarsePointer';

// Aligned to the same 44rem column as every page, so the name sits above the content.
const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const isCoarsePointer = useIsCoarsePointer();

  useEffect(() => {
    const onScroll = () => {
      const nextScrolled = window.scrollY > 8;
      setScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const maybePrefetch = (path: string) => {
    if (!isCoarsePointer) prefetchRoute(path);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-200 ${
        scrolled ? 'border-white/10 bg-black/85 backdrop-blur' : 'border-transparent bg-black'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-[44rem] items-center justify-between px-5">
        <Link to="/" className="font-display text-[17px] font-semibold text-white focus-enhanced">
          Imad Eddine El Mouss
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-6 text-[15px]">
          {PRIMARY_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onPointerEnter={() => maybePrefetch(item.path)}
              onFocus={() => maybePrefetch(item.path)}
              className={({ isActive }) =>
                `transition-colors focus-enhanced ${
                  isActive ? 'text-white' : 'text-white/60 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
