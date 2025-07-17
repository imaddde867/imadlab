import { useState, useEffect, useRef } from "react";
import { ExternalLink, Info } from "lucide-react";

// Import tech logos
import {
  SiPython,
  SiJavascript,
  SiPostgresql,
  SiMongodb,
  SiTensorflow,
  SiPytorch,
  SiScikitlearn,
  SiDocker,
  SiGit,
  SiApacheairflow,
  SiApachekafka,
  SiAmazon,
  SiFastapi,
  SiFlask,
  SiDeno,
  SiSvelte,
  SiGithubactions,
} from "react-icons/si";
import { TbSql, TbDatabase, TbDatabaseImport, TbMath } from "react-icons/tb";
import { HiOutlineGlobeAlt } from "react-icons/hi2";

interface TechItem {
  name: string;
  icon: React.ReactNode;
  url: string;
  category: string;
  description: string;
}

const techStack: TechItem[] = [
  {
    name: "Python",
    icon: <SiPython className="w-8 h-8 text-[#3776AB]" />,
    url: "https://www.python.org/",
    category: "Languages",
    description:
      "Versatile programming language for data science and backend development",
  },
  {
    name: "JavaScript",
    icon: <SiJavascript className="w-8 h-8 text-[#F7DF1E]" />,
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    category: "Languages",
    description: "Dynamic language for web development and modern applications",
  },
  {
    name: "SQL",
    icon: <TbSql className="w-8 h-8 text-[#4479A1]" />,
    url: "https://en.wikipedia.org/wiki/SQL",
    category: "Languages",
    description:
      "Standard language for managing and querying relational databases",
  },
  {
    name: "Apache Airflow",
    icon: <SiApacheairflow className="w-8 h-8 text-[#017CEE]" />,
    url: "https://airflow.apache.org/",
    category: "Data Engineering",
    description:
      "Platform for developing, scheduling, and monitoring workflows",
  },
  {
    name: "Kafka",
    icon: <SiApachekafka className="w-8 h-8 text-white" />,
    url: "https://kafka.apache.org/",
    category: "Data Engineering",
    description: "Distributed streaming platform for real-time data pipelines",
  },
  {
    name: "AWS",
    icon: <SiAmazon className="w-8 h-8 text-[#FF9900]" />,
    url: "https://aws.amazon.com/",
    category: "Cloud",
    description: "Comprehensive cloud computing platform and services",
  },
  {
    name: "PostgreSQL",
    icon: <SiPostgresql className="w-8 h-8 text-[#336791]" />,
    url: "https://www.postgresql.org/",
    category: "Databases",
    description: "Advanced open-source relational database system",
  },
  {
    name: "MongoDB",
    icon: <SiMongodb className="w-8 h-8 text-[#47A248]" />,
    url: "https://www.mongodb.com/",
    category: "Databases",
    description: "Document-oriented NoSQL database for modern applications",
  },
  {
    name: "Data Lakes",
    icon: <TbDatabaseImport className="w-8 h-8 text-[#2C8EBB]" />,
    url: "https://en.wikipedia.org/wiki/Data_lake",
    category: "Data Engineering",
    description:
      "Storage repository for structured and unstructured data at scale",
  },
  {
    name: "Data Warehouses",
    icon: <TbDatabase className="w-8 h-8 text-[#FF6C37]" />,
    url: "https://en.wikipedia.org/wiki/Data_warehouse",
    category: "Data Engineering",
    description: "Central repository for integrated data from multiple sources",
  },
  {
    name: "TensorFlow",
    icon: <SiTensorflow className="w-8 h-8 text-[#FF6F00]" />,
    url: "https://www.tensorflow.org/",
    category: "AI/ML",
    description: "Open-source machine learning framework by Google",
  },
  {
    name: "Scikit-learn",
    icon: <SiScikitlearn className="w-8 h-8 text-[#F7931E]" />,
    url: "https://scikit-learn.org/",
    category: "AI/ML",
    description:
      "Machine learning library for Python with simple and efficient tools",
  },
  {
    name: "PyTorch",
    icon: <SiPytorch className="w-8 h-8 text-[#EE4C2C]" />,
    url: "https://pytorch.org/",
    category: "AI/ML",
    description: "Deep learning framework with dynamic neural networks",
  },
  {
    name: "Docker",
    icon: <SiDocker className="w-8 h-8 text-[#2496ED]" />,
    url: "https://www.docker.com/",
    category: "DevOps",
    description:
      "Platform for developing, shipping, and running applications in containers",
  },
  {
    name: "Git",
    icon: <SiGit className="w-8 h-8 text-[#F05032]" />,
    url: "https://git-scm.com/",
    category: "DevOps",
    description: "Distributed version control system for tracking code changes",
  },
  {
    name: "CI/CD",
    icon: <SiGithubactions className="w-8 h-8 text-[#2088FF]" />,
    url: "https://en.wikipedia.org/wiki/CI/CD",
    category: "DevOps",
    description:
      "Continuous integration and deployment practices for software delivery",
  },
  {
    name: "FastAPI",
    icon: <SiFastapi className="w-8 h-8 text-[#009688]" />,
    url: "https://fastapi.tiangolo.com/",
    category: "Frameworks",
    description: "Modern, fast web framework for building APIs with Python",
  },
  {
    name: "Flask",
    icon: <SiFlask className="w-8 h-8 text-white" />,
    url: "https://flask.palletsprojects.com/",
    category: "Frameworks",
    description: "Lightweight WSGI web application framework for Python",
  },
  {
    name: "MATLAB",
    icon: <TbMath className="w-8 h-8 text-[#0076A8]" />,
    url: "https://www.mathworks.com/products/matlab.html",
    category: "Languages",
    description:
      "Programming platform for engineering and scientific computing",
  },
  {
    name: "Deno",
    icon: <SiDeno className="w-8 h-8 text-white" />,
    url: "https://deno.com/",
    category: "Runtime",
    description: "Secure runtime for JavaScript and TypeScript",
  },
  {
    name: "Hono",
    icon: <HiOutlineGlobeAlt className="w-8 h-8 text-[#00E6DE]" />,
    url: "https://hono.dev/",
    category: "Frameworks",
    description: "Ultrafast web framework for the edge",
  },
  {
    name: "Svelte",
    icon: <SiSvelte className="w-8 h-8 text-[#FF3E00]" />,
    url: "https://svelte.dev/",
    category: "Frameworks",
    description:
      "Cybernetically enhanced web apps with compile-time optimizations",
  },
];

const categories = [
  "All",
  "Languages",
  "Data Engineering",
  "AI/ML",
  "Cloud",
  "Databases",
  "DevOps",
  "Frameworks",
  "Runtime",
];

const TechStack = () => {
  const [visibleTechs, setVisibleTechs] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const filteredTechStack =
    selectedCategory === "All"
      ? techStack
      : techStack.filter((tech) => tech.category === selectedCategory);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const techName = entry.target.getAttribute("data-tech");
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

    const techElements = document.querySelectorAll("[data-tech]");
    techElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [filteredTechStack]);

  const handleMouseEnter = (tech: TechItem, event: React.MouseEvent) => {
    setHoveredTech(tech.name);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleMouseLeave = () => {
    setHoveredTech(null);
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
            Technologies and tools I use to build scalable data solutions and
            modern applications
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
                  ? "bg-white/20 text-white shadow-lg scale-105"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white/90"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Tech grid with SVG icons */}
        <div className="flex justify-center">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 md:gap-4 max-w-5xl">
            {filteredTechStack.map((tech, index) => {
              const isVisible = visibleTechs.has(tech.name);

              return (
                <div
                  key={tech.name}
                  data-tech={tech.name}
                  className={`
                    group relative transition-all duration-500 transform cursor-pointer
                    ${
                      isVisible
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-8 scale-95"
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
                    <div
                      className="
                      relative p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10
                      hover:scale-105 hover:shadow-lg hover:shadow-white/5 hover:bg-white/10 hover:border-white/20
                      transition-all duration-300 flex flex-col items-center justify-center
                      aspect-square
                    "
                    >
                      {/* SVG Icon */}
                      <div className="flex items-center justify-center h-10 mb-2 group-hover:scale-110 transition-transform duration-300">
                        {tech.icon}
                      </div>

                      {/* Name text */}
                      <div className="text-xs font-medium text-white/80 group-hover:text-white transition-colors duration-300 text-center leading-tight px-1">
                        {tech.name}
                      </div>

                      {/* Subtle external link indicator */}
                      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-50 transition-all duration-300">
                        <ExternalLink className="w-2.5 h-2.5 text-white/40" />
                      </div>

                      {/* Clean hover glow */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced tooltip */}
        {hoveredTech && (
          <div
            ref={tooltipRef}
            className="fixed z-50 pointer-events-none transition-all duration-200"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="bg-black/90 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-2xl max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-white/60" />
                <span className="font-semibold text-white text-sm">
                  {techStack.find((t) => t.name === hoveredTech)?.name}
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                {techStack.find((t) => t.name === hoveredTech)?.description}
              </p>
              <div className="mt-2 text-xs text-white/50">
                Category:{" "}
                {techStack.find((t) => t.name === hoveredTech)?.category}
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