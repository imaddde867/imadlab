
import { useState } from 'react';
import { ArrowUp } from 'lucide-react';

const projects = [
  {
    title: 'Spotify AI Music Recommendation',
    tech: 'Python • TensorFlow • Spotify API • Real-time ML',
    description: 'Intelligent music discovery using collaborative filtering and deep learning',
    link: '#',
    featured: true
  },
  {
    title: 'NAVICAST Maritime Intelligence',
    tech: 'AWS • Apache Kafka • Computer Vision • IoT',
    description: 'Real-time maritime traffic analysis and predictive routing',
    link: '#',
    featured: true
  },
  {
    title: 'ClearBox Secure Messaging',
    tech: 'React • Node.js • End-to-End Encryption',
    description: 'Privacy-first communication platform with zero-knowledge architecture',
    link: '#',
    featured: false
  },
  {
    title: 'Sisu-Speak Finnish Tutor',
    tech: 'NLP • React Native • Speech Recognition',
    description: 'AI-powered language learning with personalized pronunciation coaching',
    link: '#',
    featured: false
  }
];

const Projects = () => {
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  return (
    <section id="projects" className="py-24 px-4 relative">
      {/* Section background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 right-0 w-1/3 h-px bg-white"></div>
        <div className="absolute bottom-1/3 left-1/4 w-1/2 h-px bg-white"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section header - asymmetrically placed */}
        <div className="mb-20 ml-8 lg:ml-16">
          <h2 className="text-5xl md:text-7xl font-black mb-4">
            Featured
            <br />
            <span className="ml-8 text-white/60">Projects</span>
          </h2>
          <div className="w-24 h-1 bg-white/40 ml-8"></div>
        </div>

        {/* Asymmetrical project grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {projects.map((project, index) => {
            const isEven = index % 2 === 0;
            const colSpan = project.featured ? 'lg:col-span-7' : 'lg:col-span-5';
            const colStart = isEven 
              ? project.featured ? 'lg:col-start-1' : 'lg:col-start-2'
              : project.featured ? 'lg:col-start-6' : 'lg:col-start-8';

            return (
              <div
                key={index}
                className={`${colSpan} ${colStart} ${
                  index === 0 ? 'lg:mt-0' : 
                  index === 1 ? 'lg:mt-20' : 
                  index === 2 ? 'lg:mt-8' : 'lg:mt-32'
                }`}
                onMouseEnter={() => setHoveredProject(index)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                <div className="group relative">
                  <div 
                    className={`
                      relative p-8 lg:p-12 bg-white/[0.02] border border-white/10 rounded-2xl
                      transition-all duration-500 cursor-pointer
                      ${hoveredProject === index 
                        ? 'bg-white/[0.05] border-white/30 transform -translate-y-2 scale-[1.02]' 
                        : 'hover:bg-white/[0.03] hover:border-white/20'
                      }
                    `}
                  >
                    {/* Glow effect */}
                    <div 
                      className={`
                        absolute inset-0 rounded-2xl transition-opacity duration-500
                        ${hoveredProject === index 
                          ? 'bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.04] opacity-100' 
                          : 'opacity-0'
                        }
                      `}
                    />
                    
                    <div className="relative z-10">
                      {/* Project badge */}
                      {project.featured && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-semibold bg-white/10 rounded-full border border-white/20">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          FEATURED
                        </div>
                      )}

                      <h3 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight">
                        {project.title}
                      </h3>
                      
                      <p className="text-white/60 text-sm font-medium mb-4 tracking-wide">
                        {project.tech}
                      </p>
                      
                      <p className="text-white/80 text-base leading-relaxed mb-8">
                        {project.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <a
                          href={project.link}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white transition-colors group/link"
                        >
                          <span>View Project</span>
                          <ArrowUp className="w-4 h-4 rotate-45 transition-transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
                        </a>
                        
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                          <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                          <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Projects;
