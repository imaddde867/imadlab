import Seo from '@/components/Seo';
import { Link } from 'react-router-dom';
import { ArrowLeft, Github, Linkedin, FileText } from 'lucide-react';
import Stars from '@/components/Stars';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const About = () => {
  return (
    <div className="relative min-h-screen bg-black text-white section">
        <Stars />
        <div className="absolute inset-0 opacity-10 animate-subtle-flicker" />
        <Seo
          title="About Imad Eddine"
          description="Learn more about Imad Eddine El Mouss, a Data Engineer and AI enthusiast."
          keywords="about imadlab, imad eddine biography, data engineer experience, ai professional background"
          schemaType="AboutPage"
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' }
          ]}
          tags={['Data Engineer', 'AI Professional', 'Machine Learning']}
        />
        <div className="relative z-10 container-site">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 grid-gap-default">
            <div className="md:col-span-2 space-y-8">
              <div className="pb-8">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
                  Hey — I’m <span className="text-white/90">Imad Eddine</span>.
                </h1>
                <p className="text-xl text-white/70 leading-relaxed">
                  I'm a <span className="font-semibold text-white">Data Engineering and AI student</span> in Finland, but I see myself as a lifelong learner and problem-solver. I'm passionate about turning data into useful and impactful solutions.
                </p>
              </div>
              <div className="py-8">
                <h2 className="text-4xl font-bold mb-4 text-white">My Work</h2>
                <p className="text-lg text-white/70 leading-relaxed">
                  I enjoy working at the intersection of data, software, and intelligence. As a Research Assistant at the <a href="https://www.turkuamk.fi/palvelu/autonomisten-ja-alykkaiden-jarjestelmien-laboratorio/" target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:underline">Autonomous Intelligent Systems (AIS) Lab</a>, I built data pipelines using tools like <span className="font-semibold text-white">Airflow</span>, <span className="font-semibold text-white">InfluxDB</span>, and <span className="font-semibold text-white">PostgreSQL</span>. This experience taught me the value of clean architecture and clear communication in both research and production environments.
                </p>
              </div>
              <div className="pt-8">
                <h2 className="text-4xl font-bold mb-4 text-white">My Philosophy</h2>
                <p className="text-lg text-white/70 leading-relaxed">
                  My purpose is to build <span className="font-semibold text-white">technology that endures</span> — transformative systems that make a real, lasting difference. I want to create tools, products, and frameworks that <span className="font-semibold text-white">empower, simplify, and enlighten</span> — solving human problems not with noise or novelty, but with <span className="font-semibold text-white">substance</span>. My work isn’t meant to dazzle for a moment, but to <span className="font-semibold text-white">lay foundations</span> others can build upon long after I’m gone.
                </p>
              </div>
            </div>
            <div className="space-y-8">
              <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader>
                  <CardTitle>Connect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/70">
                    This site is where I share what I'm learning and building. If you'd like to connect, feel free to reach out.
                  </p>
                  <div className="flex flex-col space-y-3">
                    <a href="https://github.com/imaddde867" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-white/80 hover:text-white transition-colors">
                      <Github className="w-4 h-4 mr-2" />
                      imaddde867
                    </a>
                    <a href="https://www.linkedin.com/in/imad-eddine-e-986741262" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-white/80 hover:text-white transition-colors">
                      <Linkedin className="w-4 h-4 mr-2" />
                      Imad Eddine El Mouss
                    </a>
                  </div>
                </CardContent>
              </Card>
              <div className="flex flex-col items-center space-y-4">
                <p className="text-center text-white/60">Thanks for stopping by,</p>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white/30 transition-all"
                >
                  <a 
                    href="/Resume.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Resume
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default About;
