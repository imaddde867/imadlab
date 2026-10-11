import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SEO from '@/components/SEO';
import { EntryList, Page, Section } from '@/components/layout/Page';
import { formatMonth } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { readPrerenderData } from '@/lib/prerender-data';
import { POST_SUMMARY_SELECT, PROJECT_LIST_SELECT } from '@/lib/content-selects';
import type { PostSummary, ProjectSummary } from '@/types/content';

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Imad Eddine',
  url: 'https://imadlab.com',
  jobTitle: 'Research Engineer',
  knowsAbout: [
    'Applied industrial AI',
    'Multimodal data fusion',
    'Procedural knowledge extraction',
    'Privacy-by-Design systems',
    'Edge-to-cloud architecture',
  ],
  sameAs: ['https://github.com/imaddde867', 'https://www.linkedin.com/in/imad-eddine-e-986741262/'],
};

const links = [
  { label: 'Resume', href: '/Resume.pdf' },
  { label: 'GitHub', href: 'https://github.com/imaddde867' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/imad-eddine-e-986741262' },
  { label: 'Email', href: 'mailto:ielmouss867@gmail.com' },
];

const interests = [
  'Multimodal industrial intelligence across sensors, machines, logs, and documents.',
  'Procedural knowledge extraction and knowledge graph construction from industrial documentation.',
  'Applied LLM systems with evaluation that accounts for how they fail.',
  'Edge-to-cloud data and ML system design for real operational environments.',
];

const highlights = [
  {
    label: 'Platform',
    text: 'Architect and principal developer of AIOP (Python, NATS JetStream, Docker, FastAPI). Reproducible stress audits: 200 events/s sustained at 0% loss, 10ms p99 latency (and 75 events/s at 5ms p99).',
  },
  {
    label: 'Patent pending',
    text: 'Named inventor (one of three) on a European patent application filed at the EPO on 10 April 2026: adaptive digital content generation based on multimodal data. Applicant: Turku University of Applied Sciences.',
  },
  {
    label: 'Horizon Europe',
    text: 'Contributed to the planning of Sensor4Food (HORIZON-CL4), a EUR 6.98M, 21-partner European consortium coordinated by Turku UAS, developing photonic sensing and AI for the poultry value chain (2026-2030).',
  },
  {
    label: 'Pilots',
    text: 'Delivering partner pilots across two funded programmes: TeoÄly (ERDF, ~EUR 320k) and ADINO (Business Finland, ten industrial partners).',
  },
];

const experience = [
  { when: 'Jan 2026 to present', what: 'Research Engineer, CoRe (Turku UAS)' },
  { when: 'Apr 2025 to Aug 2025', what: 'Applied AI Intern, CoRe' },
  { when: 'Feb 2025 to Jun 2025', what: 'Research Intern, AIS (Turku UAS)' },
];

const usePrerenderedQuery = <T,>(key: string, queryFn: () => Promise<T[]>) => {
  const initial = useMemo(() => readPrerenderData<T[]>(key), [key]);
  const initialUpdatedAt = useRef<number | undefined>(initial?.length ? Date.now() : undefined);
  return (
    useQuery({
      queryKey: [key, 'home'],
      queryFn,
      initialData: initial?.length ? initial : undefined,
      initialDataUpdatedAt: initialUpdatedAt.current,
      staleTime: 1000 * 60,
    }).data ?? []
  );
};

const Index = () => {
  const projects = usePrerenderedQuery<ProjectSummary>('projects', async () => {
    const { data, error } = await supabase
      .from('projects')
      .select(PROJECT_LIST_SELECT)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as ProjectSummary[];
  });
  const posts = usePrerenderedQuery<PostSummary>('posts', async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(POST_SUMMARY_SELECT)
      .order('published_date', { ascending: false });
    if (error) throw error;
    return data as PostSummary[];
  });

  // The thesis leads the research list, the way an academic CV would order it.
  const research = [...projects]
    .sort((a, b) => Number(b.title.startsWith('IPKE')) - Number(a.title.startsWith('IPKE')))
    .slice(0, 4);

  return (
    <Page>
      <SEO
        title="Home"
        description="Research Engineer at CoRe (Turku UAS) and architect of AIOP, an on-premises event-driven AI platform. I build Privacy-by-Design industrial AI systems that reach deployment and produce auditable decision support."
        keywords="research engineer portfolio, aiop platform, industrial ai systems, multimodal data fusion, procedural knowledge extraction, privacy-by-design ai, edge-to-cloud ai"
        type="website"
        schemaType="WebSite"
        url="https://imadlab.com"
        structuredData={personSchema}
      />
      <header className="pb-10 pt-14">
        <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl text-[color:var(--nd-ink)] md:text-5xl">
              Imad Eddine El Mouss
            </h1>
            <p className="mt-4 text-[color:var(--nd-ink-2)]">
              Research Engineer,{' '}
              <a
                href="https://www.turkuamk.fi/en/research_groups/cognitive-technologies-research-group-core/"
                target="_blank"
                rel="noopener noreferrer"
                className="nd-quiet-link"
              >
                Cognitive Technologies Research Group (CoRe)
              </a>
              ,{' '}
              <a
                href="https://www.turkuamk.fi/en/"
                target="_blank"
                rel="noopener noreferrer"
                className="nd-quiet-link"
              >
                Turku University of Applied Sciences
              </a>
            </p>
          </div>
          <img
            src="/images/imad.jpg"
            alt="Portrait of Imad Eddine El Mouss"
            width={128}
            height={128}
            className="h-24 w-24 shrink-0 rounded-full object-cover sm:h-32 sm:w-32"
          />
        </div>
        <p className="mt-6">
          I am the architect and principal developer of AIOP, the on-premises event-driven AI
          platform designed to become the integration backbone for the group's industrial pilot
          modules. My thesis,{' '}
          <a
            href="https://urn.fi/URN:NBN:fi:amk-2025121235460"
            target="_blank"
            rel="noopener noreferrer"
            className="nd-link"
          >
            Structured Procedural Knowledge Extraction from Industrial Documentation Using LLMs
          </a>{' '}
          (5/5), introduced IPKE, a privacy-preserving pipeline for extracting procedural knowledge
          graphs from safety-critical manuals.
        </p>
        <nav aria-label="Profiles" className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="nd-link"
              {...(l.href.startsWith('http')
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              {l.label}
            </a>
          ))}
        </nav>
      </header>

      <Section title="Research interests">
        <ul className="list-disc space-y-2 pl-5 marker:text-[color:var(--nd-ink-3)]">
          {interests.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </Section>

      {research.length > 0 && (
        <Section title="Research and projects">
          <EntryList
            entries={research.map((p) => ({
              key: p.id,
              to: `/projects/${p.id}`,
              title: p.title,
              description: p.description,
              meta: p.tech_tags?.slice(0, 4).join(', '),
            }))}
          />
          <Link to="/projects" className="nd-link mt-7 inline-block text-sm">
            All projects
          </Link>
        </Section>
      )}

      <Section title="Highlights">
        <dl className="space-y-5">
          {highlights.map((h) => (
            <div key={h.label} className="sm:grid sm:grid-cols-[9rem_1fr] sm:gap-6">
              <dt className="font-medium text-[color:var(--nd-ink)]">{h.label}</dt>
              <dd className="text-[color:var(--nd-ink-2)] [font-variant-numeric:tabular-nums]">
                {h.text}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {posts.length > 0 && (
        <Section title="Writing">
          <ul className="space-y-3">
            {posts.slice(0, 5).map((p) => (
              <li
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <Link to={`/blogs/${p.slug}`} className="nd-link">
                  {p.title}
                </Link>
                <span className="shrink-0 text-sm text-[color:var(--nd-ink-3)] [font-variant-numeric:tabular-nums]">
                  {formatMonth(p.published_date)}
                </span>
              </li>
            ))}
          </ul>
          <Link to="/blogs" className="nd-link mt-7 inline-block text-sm">
            All writing
          </Link>
        </Section>
      )}

      <Section title="Experience">
        <dl className="space-y-3">
          {experience.map((e) => (
            <div key={e.when} className="sm:grid sm:grid-cols-[11rem_1fr] sm:gap-6">
              <dt className="text-sm text-[color:var(--nd-ink-3)] sm:text-base">{e.when}</dt>
              <dd>{e.what}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Contact">
        <p className="text-[color:var(--nd-ink-2)]">
          I'm open to working with research teams and industrial R&D partners on multimodal
          industrial AI, procedural knowledge extraction, and AI systems that have to reach
          deployment.
        </p>
        <a href="mailto:ielmouss867@gmail.com" className="nd-link mt-3 inline-block">
          ielmouss867@gmail.com
        </a>
        <p className="mt-6 text-sm text-[color:var(--nd-ink-3)]">
          Based in Turku, Finland. Languages: Arabic, French, English, Finnish (A2).
        </p>
      </Section>
    </Page>
  );
};

export default Index;
