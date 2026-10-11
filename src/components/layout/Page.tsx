import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// One column, one type scale, one section style for every public page.
export const Page = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className="theme-night-desk min-h-screen pt-14">
    <div className={cn('mx-auto max-w-[44rem] px-5 pb-24 text-[17px] leading-relaxed', className)}>
      {children}
    </div>
  </div>
);

export const PageTitle = ({
  title,
  description,
  back,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  back?: { to: string; label: string };
  children?: ReactNode;
}) => (
  <header className="pb-10 pt-14">
    {back && (
      <Link
        to={back.to}
        className="nd-quiet-link mb-6 inline-block text-sm text-[color:var(--nd-ink-3)]"
      >
        ← {back.label}
      </Link>
    )}
    <h1 className="text-4xl text-[color:var(--nd-ink)] md:text-5xl">{title}</h1>
    {description && <p className="mt-4 text-[color:var(--nd-ink-2)]">{description}</p>}
    {children}
  </header>
);

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="border-t border-[color:var(--nd-line)] py-10">
    <h2 className="mb-6 font-sans text-xs font-medium uppercase tracking-[0.14em] text-[color:var(--nd-ink-3)]">
      {title}
    </h2>
    {children}
  </section>
);

export type Entry = {
  key: string;
  to: string;
  title: string;
  description?: string | null;
  meta?: string;
};

// Title, one-paragraph summary, then a muted meta line: the same entry everywhere.
export const EntryList = ({ entries }: { entries: Entry[] }) => (
  <ul className="space-y-7">
    {entries.map((e) => (
      <li key={e.key}>
        <Link to={e.to} className="nd-link font-display text-lg">
          {e.title}
        </Link>
        {e.description && <p className="mt-1 text-[color:var(--nd-ink-2)]">{e.description}</p>}
        {e.meta && <p className="mt-1 text-sm text-[color:var(--nd-ink-3)]">{e.meta}</p>}
      </li>
    ))}
  </ul>
);
