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
            <div className="flex justify-between items-center mb-12">
              <div>
                <h1 className="text-5xl md:text-6xl font-black mb-4">About Me</h1>
                <div className="w-24 h-1 bg-white/40"></div>
              </div>
            </div>
            {/* ...rest of about content here... */}
            <div className="max-w-2xl w-full space-y-6 text-left">
              {/* Add your about text and sections here as before */}
              <p className="text-lg md:text-xl mb-8 text-white/80">
                Hi, I'm <span className="font-semibold text-white">Imad Eddine El mouss</span> — a passionate Data Engineer, AI/ML professional, and lifelong learner. I specialize in building robust data pipelines, scalable machine learning systems, and impactful software solutions. My journey blends engineering, research, and creativity, with a focus on making data and AI accessible and useful for everyone.
              </p>
              <p className="text-base md:text-lg text-white/70 mb-6">
                I enjoy working at the intersection of data, software, and intelligence. Whether it's designing ETL workflows, deploying ML models, or exploring new technologies, I thrive on solving complex problems and sharing knowledge with the community.
              </p>
              <p className="text-base md:text-lg text-white/70 mb-6">
                This portfolio showcases my projects, blog posts, and experiments in data engineering, machine learning, and software development. Feel free to connect or reach out if you'd like to collaborate or chat about tech, AI, or anything data!
              </p>
            </div>
      </div>
    </div>
  );
};

export default About;
