import React from 'react';
import Seo from '@/components/Seo';
import { Link } from 'react-router-dom';
import { ArrowLeft, Github, Linkedin, Mail } from 'lucide-react';
import Stars from '@/components/Stars';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const About = () => {
  return (
    <div className="relative min-h-screen bg-black text-white py-24 px-4 overflow-hidden">
      <Stars />
      <div className="absolute inset-0 opacity-20 animate-subtle-flicker" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/3 left-0 w-full h-px bg-white"></div>
        <div className="absolute top-2/3 left-0 w-2/3 h-px bg-white"></div>
        <div className="absolute left-1/4 top-0 w-px h-full bg-white"></div>
        <div className="absolute right-1/3 top-0 w-px h-2/3 bg-white"></div>
      </div>
      <Seo
        title="About Imad Eddine"
        description="Learn more about Imad Eddine El Mouss, a Data Engineer and AI enthusiast."
      />
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Hey — I’m <span className="text-white/80">Imad Eddine El Mouss</span>.
              </h1>
              <p className="text-lg text-white/70">
                I'm a <span className="font-semibold text-white">Data Engineering and AI student</span> in Finland, but I see myself as a lifelong learner and problem-solver. I'm passionate about turning data into useful and impactful solutions.
              </p>
            </div>
            <Separator className="bg-white/20" />
            <div>
              <h2 className="text-3xl font-bold mb-4">My Work</h2>
              <p className="text-lg text-white/70">
                I enjoy working at the intersection of data, software, and intelligence. As a Research Assistant at the <a href="https://www.turkuamk.fi/palvelu/autonomisten-ja-alykkaiden-jarjestelmien-laboratorio/" target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:underline">Autonomous Intelligent Systems (AIS) Lab</a>, I built data pipelines using tools like <span className="font-semibold text-white">Airflow</span>, <span className="font-semibold text-white">InfluxDB</span>, and <span className="font-semibold text-white">PostgreSQL</span>. This experience taught me the value of clean architecture and clear communication in both research and production environments.
              </p>
            </div>
            <Separator className="bg-white/20" />
            <div>
              <h2 className="text-3xl font-bold mb-4">My Philosophy</h2>
              <p className="text-lg text-white/70">
                My purpose is to build <span className="font-semibold text-white">enduring, transformative technology</span> that leaves a lasting meaningful and practical impact. I aim to craft systems, products, or frameworks that <span className="font-semibold text-white">empower, simplify, and enlighten</span>, solving real human problems with solutions that are not flashy or temporary, but <span className="font-semibold text-white">foundational</span>, serving as a starting point for others long after I'm gone.
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
                  <a href="https://www.linkedin.com/in/imad-eddine-el-mouss-986741262/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-white/80 hover:text-white transition-colors">
                    <Linkedin className="w-4 h-4 mr-2" />
                    Imad Eddine El Mouss
                  </a>
                </div>
              </CardContent>
            </Card>
            <p className="text-center text-white/60">Thanks for stopping by,</p>
            <p className="text-center text-lg font-semibold">— Imad</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
