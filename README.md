# imadlab: Imad Eddine El mouss's Data Engineering & AI Portfolio


![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat-square&logo=vite&logoColor=FFD62E)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white)

**Website:** [imadlab.me](https://imadlab.me)  
**Author:** Imad Eddine El mouss — Data Engineer, AI/ML Professional, Student

---

Welcome to **imadlab**, a cutting-edge portfolio and technical blog platform designed for data engineering, AI, and machine learning professionals. This isn't just another static portfolio—it's a dynamic, real-time ecosystem featuring advanced integrations, secure content management, and optimized discoverability.

## 🚀 Quick Navigation
- [🌐 Live Site](https://imadlab.me)
- [📂 Projects](https://imadlab.me/projects)
- [📝 Blog](https://imadlab.me/blogs)
- [📧 Contact](https://imadlab.me#contact)
- [⚡ GitHub Repo](https://github.com/imaddde867/imadlab)

## ✨ Core Features

### 🎯 Dynamic Portfolio System
- **Interactive Project Showcase**: Comprehensive case studies with live demos and detailed technical breakdowns
- **Smart Tagging System**: Technology-based filtering and categorization
- **Real-time Updates**: Content managed through secure admin portal

### 📚 Technical Blog Platform
- **Rich Content Management**: Articles with multimedia support, syntax highlighting, and estimated read times
- **Advanced Categorization**: Topic-based organization with search functionality
- **SEO-Optimized**: Structured data and meta optimization for maximum discoverability

### 🔄 Real-Time integrations
- **🎵 Spotify Now Playing**: Live music status via Supabase Edge Functions
- **📧 Newsletter System**: Smart popup subscription with backend storage
- **📞 Contact Integration**: Reliable messaging through Formspree API
- **🔔 Live Notifications**: Real-time updates across the platform

### 🎨 Modern User Experience
- **Animated Interactions**: Custom click effects, smooth transitions, and engaging micro-animations
- **Responsive Design**: Optimized for all devices and screen sizes
- **Performance First**: Fast loading times and efficient resource management
- **Accessibility Compliant**: WCAG guidelines adherence

### 🛡️ Secure Admin Portal
- **Authentication System**: Secure login with role-based access control
- **Content Management**: Real-time editing and publishing capabilities
- **Analytics Dashboard**: Performance metrics and visitor insights
- **Backup & Recovery**: Automated data protection

### 🔍 SEO & AI Optimization
- **Rich Meta Tags**: Open Graph, Twitter Cards, and comprehensive SEO tags
- **Schema.org Integration**: Structured data for enhanced search visibility
- **LLM-Friendly**: Optimized content structure for AI model understanding
- **Sitemap & Robots**: Automated search engine optimization

## 🛠️ Technology Stack

<div align="center">

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **UI Components** | shadcn/ui, Radix UI, Lucide Icons |
| **State Management** | React Query, React Hook Form |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| **Integrations** | Spotify Web API, Formspree, Newsletter API |
| **CI/CD** | GitHub Actions, Automated Deployment |
| **Hosting** | Static hosting (GitHub Pages/Vercel/Netlify) |

</div>

## 🏗️ Project Architecture

```
imadlab/
├── 📁 public/                 # Static assets & metadata
├── 📁 src/                    # Application source code
│   ├── 📁 components/         # Reusable UI components
│   ├── 📁 hooks/              # Custom React hooks
│   ├── 📁 integrations/       # Third-party service integrations
│   ├── 📁 lib/                # Utility functions & helpers
│   ├── 📁 pages/              # Page components & routing
│   ├── 📄 App.tsx             # Main application component
│   ├── 📄 main.tsx            # React application entry point
│   └── 📄 index.css           # Global styles & Tailwind imports
├── 📁 supabase/               # Database schema & migrations
├── 📁 .github/                # CI/CD workflows & templates
├── 📄 package.json            # Dependencies & scripts
├── 📄 tailwind.config.ts      # Tailwind CSS configuration
├── 📄 vite.config.ts          # Vite build configuration
└── 📄 README.md               # Project documentation
```

## 🚀 Getting Started

### Prerequisites

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=node.js&logoColor=white)
![npm](https://img.shields.io/badge/npm-latest-CB3837?style=flat-square&logo=npm&logoColor=white)
![Supabase CLI](https://img.shields.io/badge/Supabase_CLI-latest-3ECF8E?style=flat-square&logo=supabase&logoColor=white)

### Installation

```bash
# Clone the repository
git clone https://github.com/imaddde867/imadlab.git
cd imadlab

# Install dependencies
npm install
```

### Supabase Configuration

```bash
# Initialize Supabase
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Push database schema
supabase db push

# Generate TypeScript types
supabase gen types typescript --project-id "your-project-id" --schema public > src/integrations/supabase/types.ts
```

### Development Server

```bash
# Start development server
npm run dev

# Server will be available at http://localhost:8080
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality

```bash
# Run linter
npm run lint

# Run type checking
npm run type-check
```

## 🌍 Deployment

The project is configured for seamless deployment across multiple platforms:

- **GitHub Pages**: Automated via GitHub Actions
- **Vercel**: One-click deployment with optimized performance
- **Netlify**: Continuous deployment with form handling
- **Custom Hosting**: Static file generation for any hosting provider

## 🎯 Key Highlights

- **🔄 Real-time Data**: Live Spotify integration and dynamic content updates
- **🛡️ Security First**: Authentication, input validation, and secure API endpoints
- **📱 Mobile Optimized**: Responsive design with touch-friendly interactions
- **⚡ Performance**: Optimized bundle size and lazy loading
- **🎨 Modern UI**: Contemporary design with smooth animations
- **🔍 SEO Ready**: Comprehensive optimization for search engines and AI models

## 📊 Project Stats

![GitHub last commit](https://img.shields.io/github/last-commit/imaddde867/imadlab?style=flat-square&logo=git&logoColor=white)
![GitHub issues](https://img.shields.io/github/issues/imaddde867/imadlab?style=flat-square&logo=github&logoColor=white)
![GitHub pull requests](https://img.shields.io/github/issues-pr/imaddde867/imadlab?style=flat-square&logo=github&logoColor=white)
![GitHub code size](https://img.shields.io/github/languages/code-size/imaddde867/imadlab?style=flat-square&logo=github&logoColor=white)