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
        description="Learn more about Imad Eddine El Mouss, a Data Engineer, AI/ML professional, and lifelong learner."
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
                Hey — I’m <span className="text-white/80">Imad Eddine</span>.
              </h1>
              <p className="text-lg text-white/70">
                A curious mind, a builder at heart, and someone who finds meaning in turning data into something useful, human, and impactful.
              </p>
            </div>
            <Separator className="bg-white/20" />
            <div>
              <h2 className="text-3xl font-bold mb-4">The Work I Care About</h2>
              <p className="text-lg text-white/70 mb-4">
                I study <span className="font-semibold text-white">Data Engineering & Artificial Intelligence</span> in Finland, but more than a student, I see myself as a lifelong learner and problem solver. I love the process of figuring things out — whether it’s designing an ETL pipeline, integrating systems, or learning how machines can understand the world just a little bit better.
              </p>
              <p className="text-lg text-white/70">
                I recently worked as a <span className="font-semibold text-white">Research Assistant</span> at the <span className="font-semibold text-white">Autonomous Intelligent Systems (AIS) Lab</span>, where I built data pipelines for sensor platforms, handled integrations with tools like <span className="font-semibold text-white">Airflow, InfluxDB, MinIO, PostgreSQL</span>, and automated processes to help researchers gain better visibility into their data. It was hands-on, complex, and sometimes messy — and I loved every part of it. It taught me the importance of system thinking, clean architecture, and clear communication when working in research and production environments.
              </p>
            </div>
            <Separator className="bg-white/20" />
            <div>
              <h2 className="text-3xl font-bold mb-4">Who I Am, Beyond the Code</h2>
              <p className="text-lg text-white/70 mb-4">
                I’m not just here to build — I’m here to understand, to create with purpose, and to leave behind something meaningful. I believe in:
              </p>
              <ul className="list-disc list-inside text-lg text-white/70 space-y-2">
                <li><span className="font-semibold text-white">Simplicity</span>, even in complex systems.</li>
                <li><span className="font-semibold text-white">Consistency</span>, over raw genius.</li>
                <li><span className="font-semibold text-white">Kindness and clarity</span>, both in communication and in code.</li>
              </ul>
              <p className="text-lg text-white/70 mt-4">
                Outside of tech, I’m the kind of person who takes long walks by the river, watches people quietly, and thinks about how everything connects. I have big dreams, but I know that real change happens through small, intentional steps — and I try to live by that, every day.
              </p>
            </div>
          </div>
          <div className="space-y-8">
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle>Say Hi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/70">
                  This site is my little corner of the web — a space to share what I’ve learned, what I’m building, and sometimes what I’m still trying to figure out.
                </p>
                <p className="text-white/70">
                  If something here resonates with you, or if you just want to talk tech, ideas, or life — I’d love to hear from you.
                </p>
                <div className="flex flex-col space-y-3">
                  <a href="mailto:imad.mouss@gmail.com" className="inline-flex items-center text-white/80 hover:text-white transition-colors">
                    <Mail className="w-4 h-4 mr-2" />
                    imadlab.me
                  </a>
                  <a href="https://github.com/imaddde867" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-white/80 hover:text-white transition-colors">
                    <Github className="w-4 h-4 mr-2" />
                    imaddde867
                  </a>
                  <a href="https://linkedin.com/in/imad-eddine-el-mouss" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-white/80 hover:text-white transition-colors">
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