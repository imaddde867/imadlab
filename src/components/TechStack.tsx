import { useState, useEffect, useRef } from "react";
import { ExternalLink, Info, ChevronDown, ChevronUp } from "lucide-react";
import SectionHeader from '@/components/SectionHeader';

// Import tech logos
import {
  SiPython,
  SiTypescript,
  SiPostgresql,
  SiPytorch,
  SiScikitlearn,
  SiDocker,
  SiGit,
  SiApacheairflow,
  SiApachekafka,
  SiApachespark,
  SiAmazon,
  SiFastapi,
  SiNextdotjs,
  SiGithubactions,
  SiPandas,
  SiInfluxdb,
  SiNodedotjs,
  SiMlflow,
  SiKeycloak,
  SiGrafana,
  SiApachepulsar,
  SiMqtt,
  SiTensorflow,
  SiNumpy,
  SiOpencv,
  SiStreamlit,
  SiLeaflet,
  SiApacheparquet,
  SiAmazons3,
} from "react-icons/si";
import { TbSql, TbMapPin, TbLock, TbContainer, TbDatabase } from "react-icons/tb";
import { SiHuggingface } from "react-icons/si";

interface TechItem {
  name: string;
  icon: React.ReactNode;
  url: string;
  category: string;
  description: string;
}

const techStack: TechItem[] = [
  // Languages
  {
    name: "Python",
    icon: <SiPython className="w-8 h-8 text-[#3776AB]" />,
    url: "https://www.python.org/",
    category: "Languages",
    description:
      "Versatile programming language for data science and backend development",
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
    name: "TypeScript",
    icon: <SiTypescript className="w-8 h-8 text-[#3178C6]" />,
    url: "https://www.typescriptlang.org/",
    category: "Languages",
    description: "Typed superset of JavaScript for scalable applications",
  },
  // Data Engineering
  {
    name: "Apache Airflow",
    icon: <SiApacheairflow className="w-8 h-8 text-[#017CEE]" />,
    url: "https://airflow.apache.org/",
    category: "Data Engineering",
    description:
      "Platform for developing, scheduling, and monitoring workflows",
  },
  {
    name: "Apache Spark",
    icon: <SiApachespark className="w-8 h-8 text-[#E25A1C]" />,
    url: "https://spark.apache.org/",
    category: "Data Engineering",
    description: "Unified analytics engine for large-scale data processing",
  },
  {
    name: "Apache Kafka",
    icon: <SiApachekafka className="w-8 h-8 text-white" />,
    url: "https://kafka.apache.org/",
    category: "Data Engineering",
    description: "Distributed streaming platform for real-time data pipelines",
  },
  // AI/ML
  {
    name: "PyTorch",
    icon: <SiPytorch className="w-8 h-8 text-[#EE4C2C]" />,
    url: "https://pytorch.org/",
    category: "AI/ML",
    description: "Deep learning framework with dynamic neural networks",
  },
  {
    name: "scikit-learn",
    icon: <SiScikitlearn className="w-8 h-8 text-[#F7931E]" />,
    url: "https://scikit-learn.org/",
    category: "AI/ML",
    description:
      "Machine learning library for Python with simple and efficient tools",
  },
  {
    name: "Pandas",
    icon: <SiPandas className="w-8 h-8 text-[#150458]" />,
    url: "https://pandas.pydata.org/",
    category: "AI/ML",
    description: "Data manipulation and analysis library for Python",
  },
  {
    name: "Hugging Face",
    icon: <SiHuggingface className="w-8 h-8 text-[#FFD21E]" />,
    url: "https://huggingface.co/",
    category: "AI/ML",
    description: "Platform for machine learning models and datasets",
  },
  {
    name: "llama.cpp",
    icon: <SiPython className="w-8 h-8 text-[#3776AB]" />,
    url: "https://github.com/ggerganov/llama.cpp",
    category: "AI/ML",
    description: "Inference of LLaMA models in pure C/C++",
  },
  // Web & APIs
  {
    name: "FastAPI",
    icon: <SiFastapi className="w-8 h-8 text-[#009688]" />,
    url: "https://fastapi.tiangolo.com/",
    category: "Web & APIs",
    description: "Modern, fast web framework for building APIs with Python",
  },
  {
    name: "Next.js",
    icon: <SiNextdotjs className="w-8 h-8 text-white" />,
    url: "https://nextjs.org/",
    category: "Web & APIs",
    description: "React framework for production-grade applications",
  },
  // Databases
  {
    name: "PostgreSQL",
    icon: <SiPostgresql className="w-8 h-8 text-[#336791]" />,
    url: "https://www.postgresql.org/",
    category: "Databases",
    description: "Advanced open-source relational database system",
  },
  {
    name: "PostGIS",
    icon: <TbMapPin className="w-8 h-8 text-[#336791]" />,
    url: "https://postgis.net/",
    category: "Databases",
    description: "Spatial database extension for PostgreSQL",
  },
  {
    name: "InfluxDB",
    icon: <SiInfluxdb className="w-8 h-8 text-[#22ADF6]" />,
    url: "https://www.influxdata.com/",
    category: "Databases",
    description: "Time series database for metrics and events",
  },
  {
    name: "Grafana",
    icon: <SiGrafana className="w-8 h-8 text-[#F46800]" />,
    url: "https://grafana.com/",
    category: "Databases",
    description: "Analytics and monitoring platform for visualizing data",
  },
  // Cloud & Containers
  {
    name: "AWS",
    icon: <SiAmazon className="w-8 h-8 text-[#FF9900]" />,
    url: "https://aws.amazon.com/",
    category: "Cloud & Containers",
    description: "Comprehensive cloud computing platform and services",
  },
  {
    name: "Docker",
    icon: <SiDocker className="w-8 h-8 text-[#2496ED]" />,
    url: "https://www.docker.com/",
    category: "Cloud & Containers",
    description:
      "Platform for developing, shipping, and running applications in containers",
  },
  // MLOps
  {
    name: "MLflow",
    icon: <SiMlflow className="w-8 h-8 text-[#0194E2]" />,
    url: "https://mlflow.org/",
    category: "MLOps",
    description: "Platform for managing the ML lifecycle",
  },
  {
    name: "GitHub Actions",
    icon: <SiGithubactions className="w-8 h-8 text-[#2088FF]" />,
    url: "https://github.com/features/actions",
    category: "MLOps",
    description:
      "Automate workflows and CI/CD pipelines",
  },
  {
    name: "Git",
    icon: <SiGit className="w-8 h-8 text-[#F05032]" />,
    url: "https://git-scm.com/",
    category: "MLOps",
    description: "Distributed version control system for tracking code changes",
  },
  // Security
  {
    name: "Keycloak",
    icon: <SiKeycloak className="w-8 h-8 text-[#008AAF]" />,
    url: "https://www.keycloak.org/",
    category: "Security",
    description: "Open-source identity and access management solution",
  },
  // Runtime
  {
    name: "Node.js",
    icon: <SiNodedotjs className="w-8 h-8 text-[#339933]" />,
    url: "https://nodejs.org/",
    category: "Runtime",
    description: "JavaScript runtime built on Chrome's V8 engine",
  },
  // Additional Tools - Messaging & Streaming
  {
    name: "Apache Pulsar",
    icon: <SiApachepulsar className="w-8 h-8 text-[#188FFF]" />,
    url: "https://pulsar.apache.org/",
    category: "Additional Tools",
    description: "Distributed messaging and streaming platform",
  },
  {
    name: "MQTT",
    icon: <SiMqtt className="w-8 h-8 text-[#660066]" />,
    url: "https://mqtt.org/",
    category: "Additional Tools",
    description: "Lightweight messaging protocol for IoT",
  },
  // Additional Tools - AI/ML Libraries
  {
    name: "TensorFlow",
    icon: <SiTensorflow className="w-8 h-8 text-[#FF6F00]" />,
    url: "https://www.tensorflow.org/",
    category: "Additional Tools",
    description: "Open-source machine learning framework by Google",
  },
  {
    name: "NumPy",
    icon: <SiNumpy className="w-8 h-8 text-[#013243]" />,
    url: "https://numpy.org/",
    category: "Additional Tools",
    description: "Fundamental package for scientific computing with Python",
  },
  {
    name: "OpenCV",
    icon: <SiOpencv className="w-8 h-8 text-[#5C3EE8]" />,
    url: "https://opencv.org/",
    category: "Additional Tools",
    description: "Computer vision and machine learning software library",
  },
  // Additional Tools - Visualization & UI
  {
    name: "Streamlit",
    icon: <SiStreamlit className="w-8 h-8 text-[#FF4B4B]" />,
    url: "https://streamlit.io/",
    category: "Additional Tools",
    description: "Framework for building data apps in Python",
  },
  {
    name: "Leaflet",
    icon: <SiLeaflet className="w-8 h-8 text-[#199900]" />,
    url: "https://leafletjs.com/",
    category: "Additional Tools",
    description: "JavaScript library for interactive maps",
  },
  // Additional Tools - Data Formats & Storage
  {
    name: "Parquet",
    icon: <SiApacheparquet className="w-8 h-8 text-[#50ABF1]" />,
    url: "https://parquet.apache.org/",
    category: "Additional Tools",
    description: "Columnar storage format for big data",
  },
  {
    name: "Arrow",
    icon: <TbDatabase className="w-8 h-8 text-[#E95420]" />,
    url: "https://arrow.apache.org/",
    category: "Additional Tools",
    description: "Cross-language platform for in-memory data",
  },
  {
    name: "S3 Storage",
    icon: <SiAmazons3 className="w-8 h-8 text-[#569A31]" />,
    url: "https://aws.amazon.com/s3/",
    category: "Additional Tools",
    description: "Object storage service for the cloud",
  },
  // Additional Tools - HPC & Containers
  {
    name: "Slurm",
    icon: <TbContainer className="w-8 h-8 text-[#0078D7]" />,
    url: "https://slurm.schedmd.com/",
    category: "Additional Tools",
    description: "Workload manager for HPC clusters",
  },
  {
    name: "Apptainer",
    icon: <TbContainer className="w-8 h-8 text-[#7C4DFF]" />,
    url: "https://apptainer.org/",
    category: "Additional Tools",
    description: "Container platform for secure HPC environments",
  },
  // Additional Tools - Privacy & Security
  {
    name: "TenSEAL",
    icon: <TbLock className="w-8 h-8 text-[#00ACC1]" />,
    url: "https://github.com/OpenMined/TenSEAL",
    category: "Additional Tools",
    description: "Library for homomorphic encryption on tensors",
  },
  {
    name: "Differential Privacy",
    icon: <TbLock className="w-8 h-8 text-[#9C27B0]" />,
    url: "https://en.wikipedia.org/wiki/Differential_privacy",
    category: "Additional Tools",
    description: "Privacy-preserving data analysis techniques",
  },
];

const categories = [
  "All",
  "Languages",
  "Data Engineering",
  "AI/ML",
  "Web & APIs",
  "Databases",
  "Cloud & Containers",
  "MLOps",
  "Security",
  "Runtime",
];

const TechStack = () => {
  const [visibleTechs, setVisibleTechs] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const ADDITIONAL_CATEGORY = "Additional Tools";

  const filteredTechStack =
    selectedCategory === "All"
      ? techStack.filter((tech) => tech.category !== ADDITIONAL_CATEGORY)
      : techStack.filter((tech) => tech.category === selectedCategory);

  useEffect(() => {
    // When the filtered tech stack changes (category toggled),
    // immediately show all filtered techs (no animation reset)
    setVisibleTechs(new Set(filteredTechStack.map((tech) => tech.name)));
  }, [filteredTechStack]);

  const handleMouseEnter = (tech: TechItem, event: React.MouseEvent) => {
    setHoveredTech(tech.name);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const renderTechCard = (tech: TechItem, index: number) => {
    const isVisible = visibleTechs.has(tech.name);

    return (
      <div
        key={tech.name}
        data-tech={tech.name}
        className={`group relative transition-all duration-500 transform cursor-pointer ${
          isVisible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-95"
        }`}
        style={{ transitionDelay: `${index * 50}ms` }}
        onMouseEnter={(e) => handleMouseEnter(tech, e)}
        onMouseLeave={() => setHoveredTech(null)}
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
    );
  };

  return (
    <section className="section relative">
      <div className="container-site">
        <SectionHeader
          align="center"
          title={<span className="text-brand-gradient">Tech Stack</span>}
          description={
            <>
              Technologies and tools I use to build scalable data solutions and modern applications
            </>
          }
        />

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

        {/* Tech grid */}
        <div className="flex justify-center">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 md:gap-4 max-w-5xl">
            {filteredTechStack.map((tech, index) => renderTechCard(tech, index))}
          </div>
        </div>

        {/* Additional Tools Section - Show toggle when viewing "All" */}
        {selectedCategory === "All" && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setSelectedCategory(ADDITIONAL_CATEGORY)}
              className="group flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <span className="text-sm font-medium text-white/70 group-hover:text-white/90">
                View Additional Tools
              </span>
              <ChevronDown className="w-4 h-4 text-white/70 group-hover:text-white/90" />
            </button>
          </div>
        )}

        {/* Close Additional Tools Section - Show when viewing Additional Tools */}
        {selectedCategory === ADDITIONAL_CATEGORY && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setSelectedCategory("All")}
              className="group flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <span className="text-sm font-medium text-white/70 group-hover:text-white/90">
                Back to Core Stack
              </span>
              <ChevronUp className="w-4 h-4 text-white/70 group-hover:text-white/90" />
            </button>
          </div>
        )}

        {/* Tooltip */}
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
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TechStack;
