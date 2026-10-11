// PROTOTYPE (throwaway): Variant B, evidence console.
import { Link } from 'react-router-dom';
import { ArrowRight, Github, Linkedin, Mail } from 'lucide-react';
import type { PostSummary, ProjectSummary } from '@/types/content';
import { identity, facts, timeline } from './data';

const focus =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400';
const label = 'font-mono text-xs uppercase tracking-widest text-neutral-400';

const Tags = ({ tags }: { tags: string[] | null }) => (
  <span className="flex flex-wrap gap-1.5">
    {(tags ?? []).slice(0, 3).map((t) => (
      <code key={t} className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-xs text-neutral-300">
        {t}
      </code>
    ))}
  </span>
);

const iconLink = `rounded p-2 text-neutral-400 hover:text-white ${focus}`;

export default function VariantB({ projects, posts }: { projects: ProjectSummary[]; posts: PostSummary[] }) {
  const work = projects.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#0b0b0c] pb-24 pt-24 text-neutral-200 md:pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero */}
        <section className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-12">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{identity.name}</h1>
            <p className="mt-3 font-mono text-sm text-neutral-400">
              {identity.role} · {identity.orgShort}
            </p>
            <p className="mt-5 max-w-prose text-lg leading-relaxed text-neutral-200">{identity.oneLiner}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={identity.resume}
                className={`rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 ${focus}`}
              >
                Download CV
              </a>
              <a
                href="#work"
                className={`rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/5 ${focus}`}
              >
                Selected work
              </a>
              <span className="ml-1 flex items-center">
                <a href={identity.github} aria-label="GitHub" className={iconLink} target="_blank" rel="noreferrer">
                  <Github className="h-5 w-5" />
                </a>
                <a href={identity.linkedin} aria-label="LinkedIn" className={iconLink} target="_blank" rel="noreferrer">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href={`mailto:${identity.email}`} aria-label="Email" className={iconLink}>
                  <Mail className="h-5 w-5" />
                </a>
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
            <div className="flex items-center gap-3 border-b border-white/10 px-3 py-2">
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
              </span>
              <span className="font-mono text-xs text-neutral-400">evidence.txt</span>
            </div>
            <div className="p-4 font-mono text-sm">
              <p className="text-neutral-400">
                <span className="text-emerald-400">$</span> cat evidence.txt
              </p>
              <dl className="mt-4 space-y-4">
                {facts.map((f) => (
                  <div key={f.label} className="grid gap-x-3 sm:grid-cols-[7.5rem_1fr]">
                    <dt className="text-emerald-400">{f.label}</dt>
                    <dd className="min-w-0 break-words">
                      <span className="text-white">{f.value}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-neutral-400">{f.detail}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Work */}
        {work.length > 0 && (
          <section id="work" aria-labelledby="work-h" className="mt-20 scroll-mt-24">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 id="work-h" className={label}>
                <span className="text-emerald-400">#</span> Selected work
              </h2>
              <Link to="/projects" className={`inline-flex items-center gap-1 rounded text-sm text-neutral-300 hover:text-white ${focus}`}>
                All projects <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <table className="hidden w-full border-collapse text-left md:table">
              <thead>
                <tr className="border-b border-white/10 font-mono text-xs uppercase tracking-widest text-neutral-400">
                  <th className="py-2 pr-4 font-normal">Project</th>
                  <th className="py-2 pr-4 font-normal">What it is</th>
                  <th className="py-2 pr-4 font-normal">Stack</th>
                  <th className="py-2 font-normal"><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody>
                {work.map((p) => (
                  <tr key={p.id} className="border-b border-white/10 align-top hover:bg-white/[0.03]">
                    <td className="w-1/4 py-4 pr-4 font-medium text-white">
                      <Link to={`/projects/${p.id}`} className={`rounded hover:underline ${focus}`}>
                        {p.title}
                      </Link>
                    </td>
                    <td className="py-4 pr-4 text-sm leading-relaxed text-neutral-300">{p.description}</td>
                    <td className="w-1/4 py-4 pr-4"><Tags tags={p.tech_tags} /></td>
                    <td className="py-4 text-right">
                      <Link to={`/projects/${p.id}`} aria-label={`Open ${p.title}`} className={`inline-block rounded p-1 text-emerald-400 ${focus}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="divide-y divide-white/10 border-y border-white/10 md:hidden">
              {work.map((p) => (
                <li key={p.id} className="py-4">
                  <Link to={`/projects/${p.id}`} className={`block rounded ${focus}`}>
                    <span className="font-medium text-white">{p.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-neutral-300">{p.description}</span>
                  </Link>
                  <div className="mt-2"><Tags tags={p.tech_tags} /></div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Writing */}
        {posts.length > 0 && (
          <section aria-labelledby="writing-h" className="mt-20">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 id="writing-h" className={label}>
                <span className="text-emerald-400">#</span> Writing
              </h2>
              <Link to="/blogs" className={`inline-flex items-center gap-1 rounded text-sm text-neutral-300 hover:text-white ${focus}`}>
                All writing <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {posts.slice(0, 5).map((p) => (
                <li key={p.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-6">
                  <time dateTime={p.published_date} className="shrink-0 font-mono text-sm text-neutral-400 sm:w-28">
                    {p.published_date.slice(0, 10)}
                  </time>
                  <Link to={`/blogs/${p.slug}`} className={`rounded text-white hover:underline ${focus}`}>
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Experience */}
        {timeline.length > 0 && (
          <section aria-labelledby="exp-h" className="mt-20">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 id="exp-h" className={label}>
                <span className="text-emerald-400">#</span> Experience
              </h2>
              <Link to="/about" className={`inline-flex items-center gap-1 rounded text-sm text-neutral-300 hover:text-white ${focus}`}>
                About <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <dl className="divide-y divide-white/10 border-y border-white/10 font-mono text-sm">
              {timeline.map((t) => (
                <div key={t.when} className="grid gap-1 py-3 sm:grid-cols-[14rem_1fr] sm:gap-6">
                  <dt className="text-neutral-400">{t.when}</dt>
                  <dd className="text-white">{t.what}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>
    </div>
  );
}
