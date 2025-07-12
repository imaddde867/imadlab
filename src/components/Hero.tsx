import { useState, useEffect } from 'react';
import { ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import DecryptedText from './DecryptedText';
import Stars from './Stars';

const Hero = () => {
  

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Stars />
      {/* Navigation */}
      <nav className="absolute top-8 right-8 z-20">
        <div className="flex gap-6">
          <Link 
            to="/projects" 
            className="text-white/70 hover:text-white transition-colors font-medium"
          >
            Projects
          </Link>
          <Link 
            to="/blogs" 
            className="text-white/70 hover:text-white transition-colors font-medium"
          >
            Blogs
          </Link>
          <Link
            to="/about"
            className="text-white/70 hover:text-white transition-colors font-medium"
          >
            About
          </Link>
        </div>
      </nav>

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

      <div className="relative z-10 max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 items-center min-h-screen">
        {/* Main content - asymmetrically placed */}
        <div className="lg:col-span-8 lg:col-start-2 space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none tracking-tight">
              Hi, I'm{' '}
              <span className="relative inline-block">
                Imad
                <div className="absolute -inset-2 bg-white/5 blur-xl rounded-full animate-pulse"></div>
              </span>
              .
            </h1>
            
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white/90 ml-4 lg:ml-12">
              Data Engineering &{' '}
              <span className="relative">
                AI Innovator
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-white/60 to-transparent"></div>
              </span>
            </h2>
          </div>

          <div className="ml-8 lg:ml-24 space-y-6">
            <div>
              <DecryptedText
                text="I'm a passionate data engineer and AI innovator, dedicated to building"
                speed={15}
                sequential
                animateOn="view"
                className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed"
                parentClassName="block"
                encryptedClassName="text-white/40"
              />
              <DecryptedText
                text="intelligent systems that transform raw data into actionable insights."
                speed={15}
                sequential
                animateOn="view"
                delay={500}
                className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed"
                parentClassName="block"
                encryptedClassName="text-white/40"
              />
              <DecryptedText
                text="I specialize in scalable architectures and cutting-edge AI solutions."
                speed={15}
                sequential
                animateOn="view"
                delay={1000}
                className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed"
                parentClassName="block"
                encryptedClassName="text-white/40"
              />
            </div>
            <button 
                onClick={scrollToProjects}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/20 rounded-full text-lg font-semibold transition-all duration-300 hover:bg-white/10 hover:border-white/40 hover:scale-105"
              >
                <span>See My Work</span>
                <ArrowDown className="w-5 h-5 transition-transform group-hover:translate-y-1" />
                <div className="absolute inset-0 rounded-full bg-white/5 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </button>
          </div>
        </div>

        {/* Floating accent element */}
        <div className="hidden lg:block lg:col-span-3 lg:col-start-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border border-white/20 animate-spin-slow">
              <div className="absolute inset-4 rounded-full border border-white/10"></div>
              <div className="absolute inset-8 rounded-full bg-white/5"></div>
            </div>
            <div className="absolute -top-8 -right-8 w-4 h-4 bg-white rounded-full animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-2 h-2 bg-white/60 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
