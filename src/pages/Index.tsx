
import Hero from '@/components/Hero';
import Projects from '@/components/Projects';
import TechStack from '@/components/TechStack';
import BlogFeed from '@/components/BlogFeed';
import Contact from '@/components/Contact';

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Hero />
      <Projects />
      <TechStack />
      <BlogFeed />
      <Contact />
    </div>
  );
};

export default Index;
