import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Stars from './Stars';

const Hero = () => {
  const SHOW_STARFIELD = true;

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen -mt-14 pb-14 flex items-center justify-center overflow-hidden">
      <Stars enableStarfield={SHOW_STARFIELD} />
      {/* Global header now handles navigation */}

      <div className="absolute inset-0 opacity-10 animate-subtle-flicker" />

      <div className="relative z-10 container-site min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="w-full max-w-3xl mx-auto space-y-6 text-center px-4">
          <div className="space-y-3">
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
              className="text-2xl md:text-3xl lg:text-4xl font-semibold text-hierarchy-secondary animate-fade-in-left opacity-0"
              style={{ animationDelay: '0.3s' }}
            >
              3rd-year ICT at TUAS • CoRe lab intern • Founder of SisuSpeak
            </h2>
          </div>

          <div className="space-y-5">
            <div className="reading-width mx-auto">
              <p
                className="text-body-large text-hierarchy-tertiary leading-relaxed animate-fade-in-up opacity-0"
                style={{ animationDelay: '0.5s' }}
              >
                I build end-to-end data and AI systems—from streaming pipelines to deployed models—that turn raw signals into reliable decisions!
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
