import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Stars from './Stars';

const Hero = () => {
  

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen -mt-14 pb-14 flex items-center justify-center overflow-hidden">
      <Stars />
      {/* Global header now handles navigation */}

      {/* Subtle ambient glow (reduced intensity) */}
      <div className="absolute inset-0 opacity-10 animate-subtle-flicker" />

      <div className="relative z-10 container-site min-h-[calc(100vh-56px)] flex items-center justify-center">
        {/* Main content - asymmetrically placed */}
        <div className="w-full max-w-4xl mx-auto space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-display text-hierarchy-primary font-black animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s' }}>
              Hi, I'm{' '}
              <span className="relative inline-block">
                <span className="text-brand-gradient">Imad</span>
                <div className="absolute -inset-2 bg-white/10 blur-xl rounded-full animate-pulse opacity-60" />
              </span>
              .
            </h1>
            
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-hierarchy-secondary animate-fade-in-left opacity-0" style={{ animationDelay: '0.3s' }}>
              Data Engineering &{' '}
              <span className="relative text-brand-gradient">AI Innovator</span>
            </h2>
          </div>

          <div className="space-y-6">
            <div className="reading-width mx-auto space-y-4">
              <p className="text-body-large text-hierarchy-tertiary leading-relaxed animate-fade-in-up opacity-0" style={{ animationDelay: '0.5s' }}>
                I'm a passionate data engineer and AI innovator, dedicated to building intelligent systems that transform raw data into actionable insights.
              </p>
            </div>
            <Button
              variant="cta"
              size="pill"
              onClick={scrollToProjects}
              className="group animate-fade-in-scale opacity-0"
              style={{ animationDelay: '0.9s' }}
            >
              <span className="btn-text-primary">See My Work</span>
              <ArrowDown className="w-5 h-5 ml-3 transition-transform group-hover:translate-y-1" />
            </Button>
          </div>
        </div>

        
      </div>
    </section>
  );
};

export default Hero;
