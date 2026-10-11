import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { PostSummary, ProjectSummary } from '@/types/content';
import { identity, facts, timeline } from './data';

const link =
  'text-blue-700 underline decoration-blue-700/30 underline-offset-4 hover:decoration-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 rounded-sm';

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

const Heading = ({ children }: { children: string }) => (
  <h2 className="mb-5 text-xs font-medium uppercase tracking-wider text-neutral-500">{children}</h2>
);

export default function VariantA({
  projects,
  posts,
}: {
  projects: ProjectSummary[];
  posts: PostSummary[];
}) {
  const selected = projects.slice(0, 4);
  return (
    <div className="min-h-screen bg-[#f7f6f2] pt-14 text-[17px] leading-relaxed text-neutral-900">
      <main className="mx-auto max-w-[680px] px-5 pb-24 pt-14 sm:pt-20">
        <header className="mb-16">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{identity.name}</h1>
          <p className="mt-2 text-neutral-600">
            {identity.role}, {identity.org}
          </p>
          <p className="mt-6">{identity.oneLiner}</p>
          <p className="mt-6 flex flex-wrap gap-x-5 gap-y-1">
            <a href={identity.resume} className={link}>CV (PDF)</a>
            <a href={identity.github} className={link}>GitHub</a>
            <a href={identity.linkedin} className={link}>LinkedIn</a>
            <a href={`mailto:${identity.email}`} className={link}>Email</a>
          </p>
        </header>

        {facts.length > 0 && (
          <section className="mb-16">
            <Heading>Evidence</Heading>
            <dl className="divide-y divide-neutral-300 border-y border-neutral-300">
              {facts.map((f) => (
                <div key={f.label} className="py-4 sm:grid sm:grid-cols-[7rem_1fr] sm:gap-6">
                  <dt className="text-xs font-medium uppercase tracking-wider text-neutral-500 sm:pt-1.5">
                    {f.label}
                  </dt>
                  <dd className="mt-1 sm:mt-0">
                    <p className="font-medium">{f.value}</p>
                    <p className="mt-1 text-[15px] leading-snug text-neutral-600">{f.detail}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {selected.length > 0 && (
          <section className="mb-16">
            <Heading>Selected work</Heading>
            <ul className="space-y-7">
              {selected.map((p) => (
                <li key={p.id}>
                  <Link to={`/projects/${p.id}`} className={`${link} font-medium`}>
                    {p.title}
                  </Link>
                  {p.description && <p className="mt-1 text-neutral-700">{p.description}</p>}
                  {p.tech_tags && p.tech_tags.length > 0 && (
                    <p className="mt-1 text-sm text-neutral-500">{p.tech_tags.slice(0, 4).join(', ')}</p>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-7">
              <Link to="/projects" className={`${link} inline-flex items-center gap-1`}>
                All projects <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </p>
          </section>
        )}

        {posts.length > 0 && (
          <section className="mb-16">
            <Heading>Writing</Heading>
            <ul className="space-y-3">
              {posts.map((p) => (
                <li key={p.id} className="sm:flex sm:items-baseline sm:justify-between sm:gap-6">
                  <Link to={`/blogs/${p.slug}`} className={link}>
                    {p.title}
                  </Link>
                  <time dateTime={p.published_date} className="block text-sm text-neutral-500 sm:shrink-0">
                    {fmt(p.published_date)}
                  </time>
                </li>
              ))}
            </ul>
            <p className="mt-6">
              <Link to="/blogs" className={`${link} inline-flex items-center gap-1`}>
                All writing <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </p>
          </section>
        )}

        {timeline.length > 0 && (
          <section>
            <Heading>Experience</Heading>
            <ul className="space-y-3">
              {timeline.map((t) => (
                <li key={t.when} className="sm:grid sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <span className="block text-sm text-neutral-500 sm:pt-0.5">{t.when}</span>
                  <span>{t.what}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6">
              <Link to="/about" className={`${link} inline-flex items-center gap-1`}>
                About <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
