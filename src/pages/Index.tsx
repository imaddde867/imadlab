import { lazy, Suspense, type ReactNode } from 'react';
import Hero from '@/components/Hero';
import Projects from '@/components/Projects';
import Marquee from '@/components/Marquee';
import SEO from '@/components/SEO';
import BlogFeed from '@/components/BlogFeed';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const TechStack = lazy(() => import('@/components/TechStack'));
const Contact = lazy(() => import('@/components/Contact'));

type DeferredSectionProps = {
  children: ReactNode;
  minHeightClass?: string;
};

const DeferredSection = ({ children, minHeightClass }: DeferredSectionProps) => {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    rootMargin: '300px',
  });

  return (
    <div ref={ref} className={minHeightClass}>
      {isIntersecting ? (
        <Suspense fallback={<div className="section" aria-hidden="true" />}>{children}</Suspense>
      ) : null}
    </div>
  );
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Imad Eddine',
  url: 'https://imadlab.me',
  jobTitle: 'Research Engineer',
  knowsAbout: [
    'Applied industrial AI',
    'Multimodal data fusion',
    'Procedural knowledge extraction',
    'Privacy-by-Design systems',
    'Edge-to-cloud architecture',
  ],
  sameAs: [
    'https://github.com/imaddde867',
    'https://www.linkedin.com/in/imad-eddine-e-986741262/',
  ],
};

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <SEO
        title="Home"
        description="Research Engineer and internal CTO at CoRe (Turku UAS) building deployable, Privacy-by-Design industrial AI systems for auditable decision support."
        keywords="research engineer portfolio, internal cto applied research, industrial ai systems, multimodal data fusion, procedural knowledge extraction, privacy-by-design ai, edge-to-cloud ai"
        type="website"
        schemaType="WebSite"
        url="https://imadlab.me"
        structuredData={personSchema}
      />
      <Hero />

      <Projects />
      <DeferredSection minHeightClass="min-h-[640px]">
        <TechStack />
      </DeferredSection>
      <div className="my-24">
        <Marquee
          words={[
            'Multimodal Fusion',
            'Procedural Extraction',
            'Knowledge Graphs',
            'Privacy-by-Design',
            'Edge-to-Cloud',
            'Auditable AI',
            'Constraint Coverage',
            'Operational Reliability',
            'Integration Readiness',
            'Evaluation Discipline',
            'Reproducibility',
            'Industrial Deployment',
          ]}
          speed="normal"
        />
      </div>

      <BlogFeed />
      <DeferredSection minHeightClass="min-h-[760px]">
        <Contact />
      </DeferredSection>
    </div>
  );
};

export default Index;
