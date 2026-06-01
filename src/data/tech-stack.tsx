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
  SiFlask,
} from 'react-icons/si';
import { TbSql, TbMapPin, TbLock, TbContainer, TbDatabase, TbBrain } from 'react-icons/tb';
import { SiHuggingface } from 'react-icons/si';

export interface TechItem {
  name: string;
  icon: React.ReactNode;
  url: string;
  category: string;
  description: string;
}

export const techStack: TechItem[] = [
  // === CORE STACK (10-14 tools) ===

  // Languages
  {
    name: 'Python',
    icon: <SiPython className="w-8 h-8 text-[#3776AB]" />,
    url: 'https://www.python.org/',
    category: 'Languages',
    description: 'Primary language for data engineering, ML/AI, and backend development',
  },
  {
    name: 'SQL',
    icon: <TbSql className="w-8 h-8 text-[#4479A1]" />,
    url: 'https://en.wikipedia.org/wiki/SQL',
    category: 'Languages',
    description: 'Essential for data engineering and database operations',
  },

  // Streaming & Ingestion
  {
    name: 'Apache Pulsar',
    icon: <SiApachepulsar className="w-8 h-8 text-[#188FFF]" />,
    url: 'https://pulsar.apache.org/',
    category: 'Streaming & Ingestion',
    description:
      'Multi-tenant, geo-replicated messaging and streaming platform for real-time data pipelines',
  },
  {
    name: 'MQTT',
    icon: <SiMqtt className="w-8 h-8 text-[#660066]" />,
    url: 'https://mqtt.org/',
    category: 'Streaming & Ingestion',
    description: 'Lightweight messaging protocol for IoT and edge devices',
  },

  // Orchestration
  {
    name: 'Apache Airflow',
    icon: <SiApacheairflow className="w-8 h-8 text-[#017CEE]" />,
    url: 'https://airflow.apache.org/',
    category: 'Orchestration',
    description: 'Workflow orchestration for data pipelines and ML operations',
  },

  // Storage & Databases
  {
    name: 'PostgreSQL',
    icon: <SiPostgresql className="w-8 h-8 text-[#336791]" />,
    url: 'https://www.postgresql.org/',
    category: 'Storage & Databases',
    description: 'Advanced relational database with geospatial and time-series support',
  },
  {
    name: 'PostGIS',
    icon: <TbMapPin className="w-8 h-8 text-[#336791]" />,
    url: 'https://postgis.net/',
    category: 'Storage & Databases',
    description: 'Geospatial extension for PostgreSQL supporting location-based analytics',
  },
  {
    name: 'InfluxDB',
    icon: <SiInfluxdb className="w-8 h-8 text-[#22ADF6]" />,
    url: 'https://www.influxdata.com/',
    category: 'Storage & Databases',
    description: 'Time-series database for sensor data, metrics, and IoT workloads',
  },

  // DataFrames & Features
  {
    name: 'Pandas',
    icon: <SiPandas className="w-8 h-8 text-[#150458]" />,
    url: 'https://pandas.pydata.org/',
    category: 'DataFrames & Features',
    description: 'Core library for data manipulation, transformation, and feature engineering',
  },

  // APIs & Services
  {
    name: 'FastAPI',
    icon: <SiFastapi className="w-8 h-8 text-[#009688]" />,
    url: 'https://fastapi.tiangolo.com/',
    category: 'APIs & Services',
    description: 'Modern Python framework for building production ML/data APIs',
  },
  {
    name: 'Flask',
    icon: <SiFlask className="w-8 h-8 text-white" />,
    url: 'https://flask.palletsprojects.com/',
    category: 'APIs & Services',
    description: 'Lightweight Python framework for legacy services and utilities',
  },

  // ML & Deep Learning
  {
    name: 'PyTorch',
    icon: <SiPytorch className="w-8 h-8 text-[#EE4C2C]" />,
    url: 'https://pytorch.org/',
    category: 'ML & Deep Learning',
    description: 'Deep learning framework for neural networks and LLM fine-tuning',
  },
  {
    name: 'scikit-learn',
    icon: <SiScikitlearn className="w-8 h-8 text-[#F7931E]" />,
    url: 'https://scikit-learn.org/',
    category: 'ML & Deep Learning',
    description: 'Classical ML library for classification, regression, and clustering',
  },

  // LLM & AI Tooling
  {
    name: 'llama.cpp',
    icon: <TbBrain className="w-8 h-8 text-[#4A90E2]" />,
    url: 'https://github.com/ggerganov/llama.cpp',
    category: 'LLM & AI Tooling',
    description: 'Efficient local inference for LLaMA and other LLMs',
  },
  {
    name: 'Hugging Face',
    icon: <SiHuggingface className="w-8 h-8 text-[#FFD21E]" />,
    url: 'https://huggingface.co/',
    category: 'LLM & AI Tooling',
    description: 'Transformers, tokenizers, and model hub for NLP/LLM workflows',
  },
  {
    name: 'Whisper',
    icon: <TbBrain className="w-8 h-8 text-[#10a37f]" />,
    url: 'https://github.com/openai/whisper',
    category: 'LLM & AI Tooling',
    description: 'Automatic speech recognition (ASR) for audio transcription',
  },
  {
    name: 'EasyOCR',
    icon: <TbBrain className="w-8 h-8 text-[#FF6B6B]" />,
    url: 'https://github.com/JaidedAI/EasyOCR',
    category: 'LLM & AI Tooling',
    description: 'Optical character recognition for document processing',
  },

  // MLOps
  {
    name: 'MLflow',
    icon: <SiMlflow className="w-8 h-8 text-[#0194E2]" />,
    url: 'https://mlflow.org/',
    category: 'MLOps',
    description: 'Experiment tracking, model registry, and ML lifecycle management',
  },
  {
    name: 'Docker',
    icon: <SiDocker className="w-8 h-8 text-[#2496ED]" />,
    url: 'https://www.docker.com/',
    category: 'MLOps',
    description: 'Containerization for reproducible ML environments and deployment',
  },
  {
    name: 'GitHub Actions',
    icon: <SiGithubactions className="w-8 h-8 text-[#2088FF]" />,
    url: 'https://github.com/features/actions',
    category: 'MLOps',
    description: 'CI/CD automation for model training, testing, and deployment',
  },

  // Auth & Security
  {
    name: 'Keycloak',
    icon: <SiKeycloak className="w-8 h-8 text-[#008AAF]" />,
    url: 'https://www.keycloak.org/',
    category: 'Auth & Security',
    description: 'Identity and access management for securing data/ML services',
  },

  // === ADDITIONAL TOOLS & EXPLORING ===

  // Big Data & Analytics
  {
    name: 'Apache Spark',
    icon: <SiApachespark className="w-8 h-8 text-[#E25A1C]" />,
    url: 'https://spark.apache.org/',
    category: 'Additional Tools',
    description: 'Large-scale data processing (used in academic projects)',
  },
  {
    name: 'Apache Kafka',
    icon: <SiApachekafka className="w-8 h-8 text-white" />,
    url: 'https://kafka.apache.org/',
    category: 'Additional Tools',
    description: 'Distributed streaming platform (exploring)',
  },

  // Cloud & Infrastructure
  {
    name: 'AWS',
    icon: <SiAmazon className="w-8 h-8 text-[#FF9900]" />,
    url: 'https://aws.amazon.com/',
    category: 'Additional Tools',
    description: 'Basic compute and storage (EC2, S3)',
  },
  {
    name: 'S3 Storage',
    icon: <SiAmazons3 className="w-8 h-8 text-[#569A31]" />,
    url: 'https://aws.amazon.com/s3/',
    category: 'Additional Tools',
    description: 'Object storage for data lakes and model artifacts',
  },

  // Web & Application Development
  {
    name: 'TypeScript',
    icon: <SiTypescript className="w-8 h-8 text-[#3178C6]" />,
    url: 'https://www.typescriptlang.org/',
    category: 'Additional Tools',
    description: 'Type-safe JavaScript for web applications (see SisuSpeak project)',
  },
  {
    name: 'Next.js',
    icon: <SiNextdotjs className="w-8 h-8 text-white" />,
    url: 'https://nextjs.org/',
    category: 'Additional Tools',
    description: 'React framework (used in portfolio and SisuSpeak)',
  },
  {
    name: 'Node.js',
    icon: <SiNodedotjs className="w-8 h-8 text-[#339933]" />,
    url: 'https://nodejs.org/',
    category: 'Additional Tools',
    description: 'JavaScript runtime for web tooling',
  },

  // Additional ML/AI Libraries
  {
    name: 'TensorFlow',
    icon: <SiTensorflow className="w-8 h-8 text-[#FF6F00]" />,
    url: 'https://www.tensorflow.org/',
    category: 'Additional Tools',
    description: 'Alternative deep learning framework',
  },
  {
    name: 'NumPy',
    icon: <SiNumpy className="w-8 h-8 text-[#013243]" />,
    url: 'https://numpy.org/',
    category: 'Additional Tools',
    description: 'Numerical computing foundation for scientific Python',
  },
  {
    name: 'OpenCV',
    icon: <SiOpencv className="w-8 h-8 text-[#5C3EE8]" />,
    url: 'https://opencv.org/',
    category: 'Additional Tools',
    description: 'Computer vision library for image processing',
  },

  // Visualization & Monitoring
  {
    name: 'Grafana',
    icon: <SiGrafana className="w-8 h-8 text-[#F46800]" />,
    url: 'https://grafana.com/',
    category: 'Additional Tools',
    description: 'Dashboard and monitoring for data pipelines',
  },
  {
    name: 'Streamlit',
    icon: <SiStreamlit className="w-8 h-8 text-[#FF4B4B]" />,
    url: 'https://streamlit.io/',
    category: 'Additional Tools',
    description: 'Rapid prototyping for ML demos and data apps',
  },
  {
    name: 'Leaflet',
    icon: <SiLeaflet className="w-8 h-8 text-[#199900]" />,
    url: 'https://leafletjs.com/',
    category: 'Additional Tools',
    description: 'Interactive maps for geospatial visualizations',
  },

  // Data Formats & Storage
  {
    name: 'Parquet',
    icon: <SiApacheparquet className="w-8 h-8 text-[#50ABF1]" />,
    url: 'https://parquet.apache.org/',
    category: 'Additional Tools',
    description: 'Columnar storage for efficient data lakes',
  },
  {
    name: 'Arrow',
    icon: <TbDatabase className="w-8 h-8 text-[#E95420]" />,
    url: 'https://arrow.apache.org/',
    category: 'Additional Tools',
    description: 'In-memory columnar data format',
  },

  // HPC & Containers
  {
    name: 'Slurm',
    icon: <TbContainer className="w-8 h-8 text-[#0078D7]" />,
    url: 'https://slurm.schedmd.com/',
    category: 'Additional Tools',
    description: 'HPC workload manager for distributed training',
  },
  {
    name: 'Apptainer',
    icon: <TbContainer className="w-8 h-8 text-[#7C4DFF]" />,
    url: 'https://apptainer.org/',
    category: 'Additional Tools',
    description: 'Container runtime for HPC environments',
  },

  // Privacy & Security
  {
    name: 'TenSEAL',
    icon: <TbLock className="w-8 h-8 text-[#00ACC1]" />,
    url: 'https://github.com/OpenMined/TenSEAL',
    category: 'Additional Tools',
    description: 'Homomorphic encryption for privacy-preserving ML',
  },
  {
    name: 'Differential Privacy',
    icon: <TbLock className="w-8 h-8 text-[#9C27B0]" />,
    url: 'https://en.wikipedia.org/wiki/Differential_privacy',
    category: 'Additional Tools',
    description: 'Privacy-preserving data analysis techniques',
  },

  // Version Control (implicit in all projects)
  {
    name: 'Git',
    icon: <SiGit className="w-8 h-8 text-[#F05032]" />,
    url: 'https://git-scm.com/',
    category: 'Additional Tools',
    description: 'Version control system',
  },
];

export const categories = [
  'All',
  'Languages',
  'Streaming & Ingestion',
  'Orchestration',
  'Storage & Databases',
  'DataFrames & Features',
  'APIs & Services',
  'ML & Deep Learning',
  'LLM & AI Tooling',
  'MLOps',
  'Auth & Security',
  'Additional Tools',
];
