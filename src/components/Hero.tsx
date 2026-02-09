import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Stars from './Stars';

const Hero = () => {
  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Stars />

      <div className="relative z-10 container-site min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="w-full max-w-3xl mx-auto space-y-4 text-center px-4">
          <div className="space-y-2">
            <h1
              className="text-display text-hierarchy-primary font-black animate-fade-in-up opacity-0"
              style={{ animationDelay: '0.1s' }}
            >
              Hi, I'm{' '}
              <span className="relative inline-block">
                <span className="text-brand-gradient">Imad</span>
                <div className="absolute -inset-2 bg-white/10 blur-xl rounded-full animate-pulse opacity-60" />
              </span>
            </h1>

            <h2
              className="text-lg md:text-xl lg:text-2xl font-semibold text-hierarchy-secondary animate-fade-in-left opacity-0"
              style={{ animationDelay: '0.3s' }}
            >
              <span className="block">Research Engineer and internal CTO @ CoRe, Turku UAS</span>
              <span className="block mt-2 text-sm md:text-base lg:text-lg text-hierarchy-tertiary">
                Deployable multimodal industrial AI • Privacy-by-Design • Auditable decision support
              </span>
            </h2>
          </div>

          <div className="space-y-6">
            <Button
              variant="cta"
              size="pill"
              onClick={scrollToProjects}
              className="group animate-fade-in-scale opacity-0"
              style={{ animationDelay: '0.9s' }}
            >
              <span className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-2xl"></span>
              <span className="relative flex items-center">
                <span className="btn-text-primary">See My Work</span>
                <ArrowDown className="w-5 h-5 ml-3 transition-transform group-hover:translate-y-1" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
