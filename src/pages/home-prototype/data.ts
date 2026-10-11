// PROTOTYPE (throwaway): shared data for the homepage variants on `/?variant=`.
// Question: what should an evidence-first, employer-first homepage look like?
// Delete this folder once a variant wins and is rebuilt properly in Index.tsx.
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { POST_SUMMARY_SELECT, PROJECT_LIST_SELECT } from '@/lib/content-selects';
import type { PostSummary, ProjectSummary } from '@/types/content';

export const useHomeData = () => {
  const projects = useQuery({
    queryKey: ['prototype-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(PROJECT_LIST_SELECT)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ProjectSummary[];
    },
  });
  const posts = useQuery({
    queryKey: ['prototype-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(POST_SUMMARY_SELECT)
        .order('published_date', { ascending: false });
      if (error) throw error;
      return data as PostSummary[];
    },
  });
  return { projects: projects.data ?? [], posts: posts.data ?? [] };
};

// Verified, already-public facts (copied from /about). Variants must not add or change numbers.
export const identity = {
  name: 'Imad Eddine El Mouss',
  shortName: 'Imad',
  role: 'Research Engineer',
  org: 'CoRe, Turku University of Applied Sciences',
  orgShort: 'CoRe, Turku UAS',
  location: 'Turku, Finland',
  oneLiner:
    'I build on-premises industrial AI systems and the evaluation that shows whether they work.',
  degree: 'B.Eng., thesis graded 5/5',
  email: 'imadeddine200507@gmail.com',
  github: 'https://github.com/imaddde867',
  linkedin: 'https://www.linkedin.com/in/imad-eddine-e-986741262',
  resume: '/Resume.pdf',
};

export type Fact = { label: string; value: string; detail: string };

export const facts: Fact[] = [
  {
    label: 'Platform',
    value: '200 events/s, 0% loss, 10 ms p99',
    detail:
      'Architect and principal developer of AIOP, the on-premises event-driven AI platform behind CoRe\'s industrial pilots (Python, NATS JetStream, Docker, FastAPI). Reproducible stress audits.',
  },
  {
    label: 'Patent',
    value: 'EPO application, filed 10 Apr 2026',
    detail:
      'Named inventor (one of three): adaptive digital content generation based on multimodal data. Applicant: Turku UAS.',
  },
  {
    label: 'Funding',
    value: 'EUR 6.98M Horizon Europe',
    detail:
      'Contributed to the planning of Sensor4Food (HORIZON-CL4), a 21-partner consortium coordinated by Turku UAS (2026-2030).',
  },
  {
    label: 'Pilots',
    value: 'TeoÄly (ERDF) and ADINO (Business Finland)',
    detail: 'Delivering partner pilots across two funded programmes, ten industrial partners in ADINO.',
  },
  {
    label: 'Leadership',
    value: '20+ applied-AI R&D projects',
    detail: "Technical lead for the group's student engineering portfolio across a rotating intern cohort.",
  },
];

export const timeline = [
  { when: 'Jan 2026 to present', what: 'Research Engineer, CoRe (Turku UAS)' },
  { when: 'Apr 2025 to Aug 2025', what: 'Applied AI Intern, CoRe' },
  { when: 'Feb 2025 to Jun 2025', what: 'Research Intern, AIS (Turku UAS)' },
];
