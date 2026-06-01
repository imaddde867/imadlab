import { useState, useEffect, useMemo } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { techStack, categories, type TechItem } from '@/data/tech-stack';

const ADDITIONAL_CATEGORY = 'Additional Tools';
const COLLAPSE_THRESHOLD = 24;

const TechStack = () => {
  const [visibleTechs, setVisibleTechs] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expanded, setExpanded] = useState(false);

  const filteredTechStack = useMemo(
    () =>
      selectedCategory === 'All'
        ? techStack.filter((tech) => tech.category !== ADDITIONAL_CATEGORY)
        : techStack.filter((tech) => tech.category === selectedCategory),
    [selectedCategory]
  );

  const displayedTechStack = useMemo(
    () => (expanded ? filteredTechStack : filteredTechStack.slice(0, COLLAPSE_THRESHOLD)),
    [filteredTechStack, expanded]
  );

  useEffect(() => {
    // When the filtered tech stack changes (category toggled),
    // immediately show all filtered techs (no animation reset)
    setVisibleTechs(new Set(filteredTechStack.map((tech) => tech.name)));
    setExpanded(false);
  }, [filteredTechStack]);

  const renderTechCard = (tech: TechItem, index: number) => {
    const isVisible = visibleTechs.has(tech.name);

    return (
      <Tooltip key={tech.name}>
        <TooltipTrigger asChild>
          <div
            data-tech={tech.name}
            className={`group relative transition-all duration-500 transform cursor-pointer ${
              isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <a
              href={tech.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full"
            >
              <div className="relative p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex flex-col items-center justify-center aspect-square">
                <div className="flex items-center justify-center h-10 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {tech.icon}
                </div>
                <div className="text-xs font-medium text-white/80 group-hover:text-white transition-colors duration-300 text-center leading-tight px-1">
                  {tech.name}
                </div>
                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-50 transition-all duration-300">
                  <ExternalLink className="w-2.5 h-2.5 text-white/40" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </a>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-black/90 border-white/20 text-white">
          <p className="font-semibold text-sm mb-1">{tech.name}</p>
          <p className="text-xs text-white/70 leading-relaxed">{tech.description}</p>
          <p className="text-xs text-white/50 mt-1">Category: {tech.category}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <section className="section relative">
      <div className="container-site">
        <SectionHeader
          align="center"
          title={<span className="text-brand-gradient">Tech Stack</span>}
          description={<>Tools I use day to day for data and AI</>}
        />

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={isActive}
                onClick={() => setSelectedCategory(category)}
                className={`inline-flex items-center gap-2 rounded-full border backdrop-blur-sm px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                  isActive
                    ? 'bg-white text-black border-white/90 shadow-[0_8px_24px_rgba(255,255,255,0.15)]'
                    : 'bg-white/5 text-white/80 border-white/15 hover:bg-white/10 hover:text-white hover:border-white/25'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Tech grid */}
        <div className="flex justify-center">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 md:gap-4 max-w-5xl">
            {displayedTechStack.map((tech, index) => renderTechCard(tech, index))}
          </div>
        </div>

        {/* Show more/less for long lists */}
        {filteredTechStack.length > COLLAPSE_THRESHOLD && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="group flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <span className="text-sm font-medium text-white/80 group-hover:text-white">
                {expanded ? 'Show less' : 'Show more'}
              </span>
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-white/70 group-hover:text-white" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/70 group-hover:text-white" />
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TechStack;
