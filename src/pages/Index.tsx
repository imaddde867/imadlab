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
  jobTitle: 'Data Engineer',
  knowsAbout: ['Python', 'Apache Pulsar', 'LLMs', 'React', 'Data Engineering'],
  sameAs: [
    'https://github.com/imaddde867',
    'https://linkedin.com/in/imad-eddine-el-mouss-986741262',
  ],
};

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <SEO
        title="Home"
        description="Welcome to the portfolio of Imad Eddine Elmouss, a Data Engineer and AI/ML professional. Explore projects, articles, and insights on data science, machine learning, and software engineering."
        keywords="data engineer portfolio, ai ml engineer, machine learning projects, data science blog, python developer, react developer, portfolio website, tech blog"
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
            'Streaming',
            'Orchestration',
            'Data Modeling',
            'Microservices',
            'Real‑time Analytics',
            'Feature Engineering',
            'Training',
            'Evaluation',
            'MLOps',
            'LLM Tooling',
            'Privacy',
            'Scalability',
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
