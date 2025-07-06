import Hero from '@/components/Hero';
import Projects from '@/components/Projects';
import TechStack from '@/components/TechStack';
import Marquee from '@/components/Marquee';

import Contact from '@/components/Contact';
import HomeBackground from '@/components/HomeBackground';

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <HomeBackground />
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
      
      <Contact />
    </div>
  );
};

export default Index;
