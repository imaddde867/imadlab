import { useState, useEffect } from 'react';

const techStack = [
  { name: 'Python', icon: '🐍', url: 'https://www.python.org/' },
  { name: 'JavaScript', icon: '🟨', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
  { name: 'SQL', icon: '🗃️', url: 'https://en.wikipedia.org/wiki/SQL' },
  { name: 'Apache Airflow', icon: '🌊', url: 'https://airflow.apache.org/' },
  { name: 'Kafka', icon: '📡', url: 'https://kafka.apache.org/' },
  { name: 'AWS', icon: '☁️', url: 'https://aws.amazon.com/' },
  { name: 'PostgreSQL', icon: '🐘', url: 'https://www.postgresql.org/' },
  { name: 'MongoDB', icon: '🍃', url: 'https://www.mongodb.com/' },
  { name: 'Data Lakes', icon: '🏞️', url: 'https://en.wikipedia.org/wiki/Data_lake' },
  { name: 'Data Warehouses', icon: '🏭', url: 'https://en.wikipedia.org/wiki/Data_warehouse' },
  { name: 'TensorFlow', icon: '🤖', url: 'https://www.tensorflow.org/' },
  { name: 'Scikit-learn', icon: '📈', url: 'https://scikit-learn.org/' },
  { name: 'PyTorch', icon: '🔥', url: 'https://pytorch.org/' },
  { name: 'Docker', icon: '🐳', url: 'https://www.docker.com/' },
  { name: 'Git', icon: '🌳', url: 'https://git-scm.com/' },
  { name: 'CI/CD', icon: '🔄', url: 'https://en.wikipedia.org/wiki/CI/CD' },
  { name: 'FastAPI', icon: '🚀', url: 'https://fastapi.tiangolo.com/' },
  { name: 'Flask', icon: '🍶', url: 'https://flask.palletsprojects.com/' },
  { name: 'MATLAB', icon: '📊', url: 'https://www.mathworks.com/products/matlab.html' },
  { name: 'Deno', icon: '🦕', url: 'https://deno.com/' },
  { name: 'Hono', icon: '🌐', url: 'https://hono.dev/' },
  { name: 'Svelte', icon: '🧡', url: 'https://svelte.dev/' },
];

const TechStack = () => {
  const [visibleTechs, setVisibleTechs] = useState<Set<string>>(new Set());

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
      { threshold: 0.5 }
    );

    const techElements = document.querySelectorAll('[data-tech]');
    techElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tech Stack
          </h2>
          <div className="w-16 h-1 bg-white/40 mx-auto"></div>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {techStack.map((tech, index) => (
            <a
              key={tech.name}
              href={tech.url}
              target="_blank"
              rel="noopener noreferrer"
              data-tech={tech.name}
              className={`
                group relative transition-all duration-500 transform cursor-pointer
                ${visibleTechs.has(tech.name)
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-4 scale-95'
                }
              `}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <div className="relative p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-white/30 transition-all duration-300 flex flex-col items-center justify-center">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300 text-center">
                  {tech.icon}
                </div>
                <div className="text-sm font-medium text-white/80 group-hover:text-white transition-colors duration-300 text-center">
                  {tech.name}
                </div>
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.1] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;