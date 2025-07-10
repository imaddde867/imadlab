import React from 'react';
import Seo from '@/components/Seo';

const About = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-16">
      <Seo
        title="About Imad Eddine"
        description="Learn more about Imad Eddine El mouss, a Data Engineer, AI/ML professional, and lifelong learner."
      />
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl font-bold mb-6">About Me</h1>
        <p className="text-lg md:text-xl mb-8 text-white/80">
          Hi, I'm <span className="font-semibold text-white">Imad Eddine El mouss</span> — a passionate Data Engineer, AI/ML professional, and lifelong learner. I specialize in building robust data pipelines, scalable machine learning systems, and impactful software solutions. My journey blends engineering, research, and creativity, with a focus on making data and AI accessible and useful for everyone.
        </p>
        <p className="text-base md:text-lg text-white/70 mb-6">
          I enjoy working at the intersection of data, software, and intelligence. Whether it's designing ETL workflows, deploying ML models, or exploring new technologies, I thrive on solving complex problems and sharing knowledge with the community.
        </p>
        <p className="text-base md:text-lg text-white/70 mb-6">
          This portfolio showcases my projects, blog posts, and experiments in data engineering, machine learning, and software development. Feel free to connect or reach out if you'd like to collaborate or chat about tech, AI, or anything data!
        </p>
        <div className="mt-8">
          <a
            href="mailto:imadeddine.elmouss@gmail.com"
            className="inline-block bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded transition-colors duration-200 font-medium"
          >
            Contact Me
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
