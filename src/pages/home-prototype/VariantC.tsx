import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { resolveImageUrl } from '@/lib/image-utils';
import type { PostSummary, ProjectSummary } from '@/types/content';
import { facts, identity, timeline } from './data';

const focus =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-100 rounded-sm';
const kicker = 'text-xs font-medium uppercase tracking-widest text-amber-300';

function Media({ project, className }: { project: ProjectSummary; className: string }) {
  const src = resolveImageUrl(project.image_url);
  if (src) {
    return (
      <img
        src={src}
        alt={project.title}
        loading="lazy"
        className={`${className} w-full rounded-md border border-zinc-800 object-cover`}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={`${className} flex w-full items-end rounded-md border border-zinc-800 bg-zinc-900 p-4`}
    >
      <span className="line-clamp-3 text-2xl font-semibold leading-tight text-zinc-700">
        {project.title}
      </span>
    </div>
  );
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function VariantC({
  projects,
  posts,
}: {
  projects: ProjectSummary[];
  posts: PostSummary[];
}) {
  const lead = projects[0];
  const rest = projects.slice(1, 4);
  const links = [
    { label: 'CV', href: identity.resume },
    { label: 'GitHub', href: identity.github },
    { label: 'LinkedIn', href: identity.linkedin },
    { label: 'Email', href: `mailto:${identity.email}` },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 pt-20 text-zinc-300">
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <header className="flex flex-col gap-4 border-b border-zinc-800 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm text-zinc-100">
              <span className="font-semibold">{identity.name}</span>
              <span className="text-zinc-500">
                {' '}
                / {identity.role}, {identity.orgShort}
              </span>
            </p>
            <p className="mt-1 text-sm text-zinc-400">{identity.oneLiner}</p>
          </div>
          <nav aria-label="Profile links">
            <ul className="flex gap-5 text-sm">
              {links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className={`text-zinc-300 underline-offset-4 hover:text-white hover:underline ${focus}`}
                    {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main>
          {lead && (
            <section aria-labelledby="lead-title" className="py-10 lg:py-14">
              <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                <Link
                  to={`/projects/${lead.id}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="lg:col-span-7"
                >
                  <Media project={lead} className="aspect-video" />
                </Link>
                <div className="lg:col-span-5">
                  <p className={kicker}>Featured case study</p>
                  <h1
                    id="lead-title"
                    className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-zinc-50 lg:text-4xl"
                  >
                    {lead.title}
                  </h1>
                  {lead.description && (
                    <p className="mt-4 leading-relaxed text-zinc-400">{lead.description}</p>
                  )}
                  {!!lead.tech_tags?.length && (
                    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
                      {lead.tech_tags.slice(0, 4).map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  )}
                  <Link
                    to={`/projects/${lead.id}`}
                    className={`mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-50 hover:underline underline-offset-4 ${focus}`}
                  >
                    Read the case study <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </section>
          )}

          {rest.length > 0 && (
            <section aria-label="More case studies" className="border-t border-zinc-800 py-10">
              <div className="mb-6 flex items-baseline justify-between">
                <h2 className={kicker}>More work</h2>
                <Link to="/projects" className={`text-sm text-zinc-400 hover:text-white ${focus}`}>
                  All projects
                </Link>
              </div>
              <ul className="grid gap-8 md:grid-cols-3">
                {rest.map((p) => (
                  <li key={p.id}>
                    <Link to={`/projects/${p.id}`} className={`group block ${focus}`}>
                      <Media project={p} className="aspect-video" />
                      <h3 className="mt-4 text-lg font-semibold leading-snug text-zinc-100 group-hover:underline underline-offset-4">
                        {p.title}
                      </h3>
                      {p.description && (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-400">
                          {p.description}
                        </p>
                      )}
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm text-zinc-300">
                        Read more <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {facts.length > 0 && (
            <section aria-label="Proof" className="border-y border-zinc-800 py-8">
              <dl className="grid gap-8 sm:grid-cols-2 xl:grid-cols-5 xl:gap-0">
                {facts.map((f) => (
                  <div key={f.label} className="xl:border-l xl:border-zinc-800 xl:px-5 xl:first:border-l-0 xl:first:pl-0">
                    <dt className="order-2 text-xs font-medium uppercase tracking-widest text-zinc-500">
                      {f.label}
                    </dt>
                    <dd className="mt-2 text-xl font-semibold leading-snug text-zinc-50">
                      {f.value}
                    </dd>
                    <dd className="mt-2 line-clamp-3 text-xs leading-relaxed text-zinc-500">
                      {f.detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {posts.length > 0 && (
            <section aria-label="Writing" className="py-10">
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className={kicker}>Writing</h2>
                <Link to="/blogs" className={`text-sm text-zinc-400 hover:text-white ${focus}`}>
                  All posts
                </Link>
              </div>
              <ul className="divide-y divide-zinc-800">
                {posts.slice(0, 5).map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/blogs/${p.slug}`}
                      className={`group grid gap-1 py-4 md:grid-cols-12 md:gap-6 ${focus}`}
                    >
                      <time
                        dateTime={p.published_date}
                        className="text-xs uppercase tracking-widest text-zinc-500 md:col-span-2 md:pt-1.5"
                      >
                        {fmt(p.published_date)}
                      </time>
                      <div className="md:col-span-10">
                        <h3 className="text-xl font-semibold leading-snug text-zinc-100 group-hover:underline underline-offset-4">
                          {p.title}
                        </h3>
                        {p.excerpt && (
                          <p className="mt-1 line-clamp-1 text-sm text-zinc-400">{p.excerpt}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-label="Experience" className="border-t border-zinc-800 pt-6">
            <div className="flex flex-col gap-3 text-sm md:flex-row md:items-baseline md:justify-between">
              <ul className="flex flex-col gap-2 md:flex-row md:gap-8">
                {timeline.map((t) => (
                  <li key={t.when}>
                    <span className="block text-xs uppercase tracking-widest text-zinc-500">
                      {t.when}
                    </span>
                    <span className="text-zinc-300">{t.what}</span>
                  </li>
                ))}
              </ul>
              <Link to="/about" className={`text-zinc-400 hover:text-white ${focus}`}>
                About
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
