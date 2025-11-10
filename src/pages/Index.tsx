import Hero from '@/components/Hero';
import Projects from '@/components/Projects';
import TechStack from '@/components/TechStack';
import Marquee from '@/components/Marquee';
import Seo from '@/components/Seo';
import BlogFeed from '@/components/BlogFeed';
import Contact from '@/components/Contact';
import { Link } from 'react-router-dom';
import { tagToUrl } from '@/lib/tags';

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Seo
        title="Home"
        description="Welcome to the portfolio of Imad Eddine Elmouss, a Data Engineer and AI/ML professional. Explore projects, articles, and insights on data science, machine learning, and software engineering."
        keywords="data engineer portfolio, ai ml engineer, machine learning projects, data science blog, python developer, react developer, portfolio website, tech blog"
        type="website"
        schemaType="WebSite"
      />
      <Hero />

      {/* Start here section (pillar tags) */}
      <section className="section">
        <div className="container-site">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Start here</h2>
          <p className="text-white/60 mb-6">Explore the main themes across my work:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: 'Data Engineering', tag: 'Data Engineering', blurb: 'Pipelines, orchestration, and analytics.' },
              { label: 'Machine Learning', tag: 'Machine Learning', blurb: 'From features to evaluation and ops.' },
              { label: 'LLM Tooling', tag: 'LLM Tooling', blurb: 'Practical tooling and integrations.' },
            ].map((p) => (
              <Link
                key={p.label}
                to={tagToUrl(p.tag)}
                className="group rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{p.label}</span>
                  <span className="text-xs text-white/50">Browse →</span>
                </div>
                <p className="text-sm text-white/60 mt-2">{p.blurb}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
