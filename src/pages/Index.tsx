import { lazy, Suspense, type ReactNode } from 'react';
import Hero from '@/components/Hero';
import Projects from '@/components/Projects';
import { useLocation } from 'react-router-dom';
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

// PROTOTYPE (throwaway): dev-only variant preview, remove with src/pages/home-prototype.
const HomePrototype = import.meta.env.DEV
  ? lazy(() => import('./home-prototype/HomePrototype'))
  : null;

const Index = () => {
  const variant = new URLSearchParams(useLocation().search).get('variant');
  if (HomePrototype && variant) {
    return (
      <Suspense fallback={null}>
        <HomePrototype variant={variant} />
      </Suspense>
    );
  }
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <SEO
        title="Home"
        description="Research Engineer at CoRe (Turku UAS) and architect of AIOP, an on-premises event-driven AI platform. I build Privacy-by-Design industrial AI systems that reach deployment and produce auditable decision support."
        keywords="research engineer portfolio, aiop platform, industrial ai systems, multimodal data fusion, procedural knowledge extraction, privacy-by-design ai, edge-to-cloud ai"
        type="website"
        schemaType="WebSite"
        url="https://imadlab.com"
        structuredData={personSchema}
      />
      <Hero />

      <Projects />
      <DeferredSection minHeightClass="min-h-[640px]">
        <TechStack />
      </DeferredSection>
      <BlogFeed />
      <DeferredSection minHeightClass="min-h-[760px]">
        <Contact />
      </DeferredSection>
    </div>
  );
};

export default Index;
