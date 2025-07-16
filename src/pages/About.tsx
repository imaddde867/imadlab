import React from 'react';
import Seo from '@/components/Seo';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Stars from '@/components/Stars';

const About = () => {
  return (
    <div className="relative min-h-screen bg-black text-white py-24 px-4 overflow-hidden">
      <Stars />
      {/* Animated background glow */}
      <div 
        className="absolute inset-0 opacity-20 animate-subtle-flicker"
      />
      
      {/* Asymmetrical grid lines */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/3 left-0 w-full h-px bg-white"></div>
        <div className="absolute top-2/3 left-0 w-2/3 h-px bg-white"></div>
        <div className="absolute left-1/4 top-0 w-px h-full bg-white"></div>
        <div className="absolute right-1/3 top-0 w-px h-2/3 bg-white"></div>
      </div>
      <Seo
        title="About Imad Eddine"
        description="Learn more about Imad Eddine El mouss, a Data Engineer, AI/ML professional, and lifelong learner."
      />
          <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-12">
            <div className="mb-8">
              <Link to="/" className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </div>
            <div className="flex flex-col md:flex-row md:items-start gap-12 mb-12">
              <div className="flex-1">
                <h1 className="text-5xl md:text-6xl font-black mb-4">About Me</h1>
                <div className="w-24 h-1 bg-white/40 mb-8"></div>
                <div className="prose prose-invert max-w-none text-white/90 text-lg md:text-xl space-y-6">
                  <p>
                    Hey — I’m <b>Imad Eddine El Mouss</b>.<br/>
                    A curious mind, a builder at heart, and someone who finds meaning in turning data into something useful, human, and impactful.
                  </p>
                  <p>
                    I study <b>Data Engineering & Artificial Intelligence</b> in Finland, but more than a student, I see myself as a <b>lifelong learner and problem solver</b>. I love the process of figuring things out — whether it’s designing an ETL pipeline, integrating systems, or learning how machines can understand the world just a little bit better.
                  </p>
                </div>
              </div>
            </div>
            <div className="max-w-3xl w-full mx-auto space-y-12 text-left">
              <section>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">The Work I Care About</h2>
                <div className="w-16 h-1 bg-white/30 mb-4"></div>
                <p className="text-base md:text-lg text-white/80 mb-4">
                  I’ve always been drawn to that space where data meets software and software meets intelligence. My work often sits at that intersection — blending technical depth with practical solutions.
                </p>
                <p className="text-base md:text-lg text-white/70 mb-4">
                  I recently worked as a <b>Research Assistant</b> at the <b>Autonomous Intelligent Systems (AIS) Lab</b>, where I built data pipelines for sensor platforms, handled integrations with tools like <b>Airflow, InfluxDB, MinIO, PostgreSQL</b>, and automated processes to help researchers gain better visibility into their data. It was hands-on, complex, and sometimes messy — and I loved every part of it. It taught me the importance of <b>system thinking</b>, <b>clean architecture</b>, and <b>clear communication</b> when working in research and production environments.
                </p>
              </section>
              <section>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Who I Am, Beyond the Code</h2>
                <div className="w-16 h-1 bg-white/30 mb-4"></div>
                <p className="text-base md:text-lg text-white/80 mb-4">
                  I’m not just here to build — I’m here to understand, to create with purpose, and to leave behind something meaningful. I believe in:
                </p>
                <ul className="list-disc pl-6 text-white/70 space-y-2 mb-4">
                  <li><b>Simplicity</b>, even in complex systems.</li>
                  <li><b>Consistency</b>, over raw genius.</li>
                  <li><b>Kindness and clarity</b>, both in communication and in code.</li>
                </ul>
                <p className="text-base md:text-lg text-white/70 mb-4">
                  Outside of tech, I’m the kind of person who takes long walks by the river, watches people quietly, and thinks about how everything connects. I have big dreams, but I know that real change happens through small, intentional steps — and I try to live by that, every day.
                </p>
              </section>
              <section>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Say Hi</h2>
                <div className="w-16 h-1 bg-white/30 mb-4"></div>
                <p className="text-base md:text-lg text-white/80 mb-4">
                  This site is my little corner of the web — a space to share what I’ve learned, what I’m building, and sometimes what I’m still trying to figure out.
                </p>
                <p className="text-base md:text-lg text-white/80 mb-4">
                  If something here resonates with you, or if you just want to talk tech, ideas, or life — I’d love to hear from you.
                </p>
                <ul className="list-none pl-0 text-white/90 space-y-2 mb-4">
                  <li><b>imadlab.me</b></li>
                  <li><b>GitHub:</b> <a href="https://github.com/imaddde867" className="underline hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">imaddde867</a></li>
                  <li><b>LinkedIn:</b> <a href="https://linkedin.com/in/imad-eddine-el-mouss" className="underline hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">Imad Eddine El Mouss</a></li>
                </ul>
                <p className="text-base md:text-lg text-white/80 mt-8">Thanks for stopping by,<br/><b>— Imad</b></p>
              </section>
            </div>
      </div>
    </div>
  );
};

export default About;
