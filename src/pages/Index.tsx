import Hero from '@/components/Hero';
import Projects from '@/components/Projects';
import TechStack from '@/components/TechStack';
import Marquee from '@/components/Marquee';
import Seo from '@/components/Seo';
import BlogFeed from '@/components/BlogFeed';
import Contact from '@/components/Contact';

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Seo
        title="Home"
        description="Welcome to the portfolio of Imad Eddine Elmouss, a Data Engineer and AI/ML professional. Explore projects, articles, and insights on data science, machine learning, and software engineering."
      />
      <Hero />
      <Projects />
      <TechStack />
      <div className="my-24">
        <Marquee
          words={[
            "Data Engineering",
            "AI Innovation",
            "Machine Learning",
            "LLM Fine-tuning",
            "AWS Cloud",
            "Real-time Analytics",
            "Recommendation Systems",
            "MLOps",
            "Computer Vision",
            "Predictive Analytics",
            "ETL Pipelines",
            "Microservices",
            "Production-grade AI",
            "Scalable Solutions",
            "Business Intelligence",
            "Deep Learning",
            "Data Architecture",
            "Streaming Analytics",
            "Cloud-native",
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
