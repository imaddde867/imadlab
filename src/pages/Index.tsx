import Hero from '@/components/Hero';
import Projects from '@/components/Projects';
import TechStack from '@/components/TechStack';
import Marquee from '@/components/Marquee';
import SEO from '@/components/SEO';
import BlogFeed from '@/components/BlogFeed';
import Contact from '@/components/Contact';

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
      <TechStack />
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
      <Contact />
    </div>
  );
};

export default Index;
