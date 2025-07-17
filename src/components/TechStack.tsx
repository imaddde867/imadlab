import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Info } from 'lucide-react';

interface TechItem {
  name: string;
  icon: string;
  url: string;
  category: string;
  description: string;
}

const techStack: TechItem[] = [
  { name: 'Python', icon: '🐍', url: 'https://www.python.org/', category: 'Languages', description: 'Versatile programming language for data science and backend development' },
  { name: 'JavaScript', icon: '🟨', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', category: 'Languages', description: 'Dynamic language for web development and modern applications' },
  { name: 'SQL', icon: '🗃️', url: 'https://en.wikipedia.org/wiki/SQL', category: 'Languages', description: 'Standard language for managing and querying relational databases' },
  { name: 'Apache Airflow', icon: '🌊', url: 'https://airflow.apache.org/', category: 'Data Engineering', description: 'Platform for developing, scheduling, and monitoring workflows' },
  { name: 'Kafka', icon: '📡', url: 'https://kafka.apache.org/', category: 'Data Engineering', description: 'Distributed streaming platform for real-time data pipelines' },
  { name: 'AWS', icon: '☁️', url: 'https://aws.amazon.com/', category: 'Cloud', description: 'Comprehensive cloud computing platform and services' },
  { name: 'PostgreSQL', icon: '🐘', url: 'https://www.postgresql.org/', category: 'Databases', description: 'Advanced open-source relational database system' },
  { name: 'MongoDB', icon: '🍃', url: 'https://www.mongodb.com/', category: 'Databases', description: 'Document-oriented NoSQL database for modern applications' },
  { name: 'Data Lakes', icon: '🏞️', url: 'https://en.wikipedia.org/wiki/Data_lake', category: 'Data Engineering', description: 'Storage repository for structured and unstructured data at scale' },
  { name: 'Data Warehouses', icon: '🏭', url: 'https://en.wikipedia.org/wiki/Data_warehouse', category: 'Data Engineering', description: 'Central repository for integrated data from multiple sources' },
  { name: 'TensorFlow', icon: '🤖', url: 'https://www.tensorflow.org/', category: 'AI/ML', description: 'Open-source machine learning framework by Google' },
  { name: 'Scikit-learn', icon: '📈', url: 'https://scikit-learn.org/', category: 'AI/ML', description: 'Machine learning library for Python with simple and efficient tools' },
  { name: 'PyTorch', icon: '🔥', url: 'https://pytorch.org/', category: 'AI/ML', description: 'Deep learning framework with dynamic neural networks' },
  { name: 'Docker', icon: '🐳', url: 'https://www.docker.com/', category: 'DevOps', description: 'Platform for developing, shipping, and running applications in containers' },
  { name: 'Git', icon: '🌳', url: 'https://git-scm.com/', category: 'DevOps', description: 'Distributed version control system for tracking code changes' },
  { name: 'CI/CD', icon: '🔄', url: 'https://en.wikipedia.org/wiki/CI/CD', category: 'DevOps', description: 'Continuous integration and deployment practices for software delivery' },
  { name: 'FastAPI', icon: '🚀', url: 'https://fastapi.tiangolo.com/', category: 'Frameworks', description: 'Modern, fast web framework for building APIs with Python' },
  { name: 'Flask', icon: '🍶', url: 'https://flask.palletsprojects.com/', category: 'Frameworks', description: 'Lightweight WSGI web application framework for Python' },
  { name: 'MATLAB', icon: '📊', url: 'https://www.mathworks.com/products/matlab.html', category: 'Languages', description: 'Programming platform for engineering and scientific computing' },
  { name: 'Deno', icon: '🦕', url: 'https://deno.com/', category: 'Runtime', description: 'Secure runtime for JavaScript and TypeScript' },
  { name: 'Hono', icon: '🌐', url: 'https://hono.dev/', category: 'Frameworks', description: 'Ultrafast web framework for the edge' },
  { name: 'Svelte', icon: '🧡', url: 'https://svelte.dev/', category: 'Frameworks', description: 'Cybernetically enhanced web apps with compile-time optimizations' },
];

const categories = ['All', 'Languages', 'Data Engineering', 'AI/ML', 'Cloud', 'Databases', 'DevOps', 'Frameworks', 'Runtime'];

const TechStack = () => {
  const [visibleTechs, setVisibleTechs] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const filteredTechStack = selectedCategory === 'All' 
    ? techStack 
    : techStack.filter(tech => tech.category === selectedCategory);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const techName = entry.target.getAttribute('data-tech');
            if (techName) {
              setTimeout(() => {
                setVisibleTechs((prev) => new Set([...prev, techName]));
              }, Math.random() * 300);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    const techElements = document.querySelectorAll('[data-tech]');
    techElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [filteredTechStack]);

  const handleMouseEnter = (tech: TechItem, event: React.MouseEvent) => {
    setHoveredTech(tech.name);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleMouseLeave = () => {
    setHoveredTech(null);
  };

  const getCategoryDotColor = (category: string) => {
    const colors = {
      'Languages': 'bg-blue-500',
      'Data Engineering': 'bg-green-500',
      'AI/ML': 'bg-purple-500',
      'Cloud': 'bg-cyan-500',
      'Databases': 'bg-orange-500',
      'DevOps': 'bg-red-500',
      'Frameworks': 'bg-yellow-500',
      'Runtime': 'bg-pink-500',
    };
    return colors[category as keyof typeof colors] || 'bg-white/60';
  };

  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Tech Stack
          </h2>
          <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto">
            Technologies and tools I use to build scalable data solutions and modern applications
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-white/60 to-white/20 mx-auto"></div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-white/20 text-white shadow-lg scale-105'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white/90'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Tech grid with improved responsive layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
          {filteredTechStack.map((tech, index) => {
            const isVisible = visibleTechs.has(tech.name);
            const dotColorClass = getCategoryDotColor(tech.category);
            
            return (
              <div
                key={tech.name}
                data-tech={tech.name}
                className={`
                  group relative transition-all duration-500 transform cursor-pointer
                  ${isVisible
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-8 scale-95'
                  }
                `}
                style={{ transitionDelay: `${index * 50}ms` }}
                onMouseEnter={(e) => handleMouseEnter(tech, e)}
                onMouseLeave={handleMouseLeave}
              >
                <a
                  href={tech.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  <div className="
                    relative p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10
                    hover:scale-110 hover:shadow-2xl hover:shadow-white/10 hover:bg-white/10 hover:border-white/20
                    transition-all duration-300 flex flex-col items-center justify-center
                    min-h-[120px]
                  ">
                    {/* Colored category dot - always visible */}
                    <div className="absolute top-3 right-3">
                      <div className={`w-3 h-3 rounded-full ${dotColorClass} shadow-lg`}></div>
                    </div>
                    
                    {/* Icon with enhanced animation */}
                    <div className="text-3xl md:text-4xl mb-3 group-hover:scale-125 transition-transform duration-300 filter group-hover:drop-shadow-lg">
                      {tech.icon}
                    </div>
                    
                    {/* Name with better typography */}
                    <div className="text-xs md:text-sm font-semibold text-white/90 group-hover:text-white transition-colors duration-300 text-center leading-tight">
                      {tech.name}
                    </div>
                    
                    {/* External link indicator */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <ExternalLink className="w-3 h-3 text-white/60" />
                    </div>
                    
                    {/* Enhanced glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>
                </a>
              </div>
            );
          })}
        </div>

        {/* Enhanced tooltip */}
        {hoveredTech && (
          <div
            ref={tooltipRef}
            className="fixed z-50 pointer-events-none transition-all duration-200"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="bg-black/90 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-2xl max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-white/60" />
                <span className="font-semibold text-white text-sm">
                  {techStack.find(t => t.name === hoveredTech)?.name}
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                {techStack.find(t => t.name === hoveredTech)?.description}
              </p>
              <div className="mt-2 text-xs text-white/50">
                Category: {techStack.find(t => t.name === hoveredTech)?.category}
              </div>
              {/* Tooltip arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TechStack;