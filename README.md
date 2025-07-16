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


## ✨ Features Overview

### 🖥️ Portfolio & Projects
- **Interactive Project Gallery:** Browse, filter, and explore detailed case studies with live demos, tech tags, and source links.
- **Tech Stack Marquee:** Animated, visually rich display of all technologies used.
- **Project Detail Pages:** Each project features a dedicated page with full descriptions, tech stack, images, and links.
- **Smart Tagging:** Filter projects by technology or category.
- **Real-Time Updates:** Projects and content are updated instantly via the admin portal.

### 📚 Blog & Content Platform
- **Rich Markdown Support:** Write posts with images, code blocks, math, and more.
- **Syntax Highlighting:** Beautiful code rendering for technical articles.
- **Estimated Read Time:** Automatic calculation and display for each post.
- **Topic Tagging & Search:** Organize and find articles by topic or keyword.
- **SEO-Optimized:** Meta tags, Open Graph, Twitter Cards, and schema.org for discoverability.

### 🔄 Real-Time Integrations
- **Spotify Now Playing:** See what Imad is listening to, powered by Supabase Edge Functions.
- **Newsletter Popup:** Smart, non-intrusive subscription with backend storage.
- **Contact Form:** Reliable messaging via Formspree API.
- **Live Notifications:** Real-time toast notifications for user actions and admin events.

### 🎨 User Experience & Design
- **Animated Interactions:** Custom click sparks, subtle background effects, and micro-animations.
- **Responsive & Accessible:** Fully mobile-optimized and WCAG-compliant.
- **Performance-First:** Fast load times, code-splitting, and efficient resource use.

### 🛡️ Secure Admin Portal
- **Authentication:** Secure login with Supabase Auth (email/password).
- **Role-Based Access:** Only authorized users can access admin features.
- **Content Management:** Add, edit, and delete blog posts and projects in real time.
- **Project & Blog CRUD:** Full create, update, and delete for all content.
- **Session Management:** Auto-logout and session refresh for security.
- **Analytics Dashboard:** (Planned) View site metrics and visitor insights.
- **Backup & Recovery:** (Planned) Automated data protection.


#### 🛠️ Admin Portal Demo

See the admin experience in action:

<video src="doc/admin_demo.mov" controls width="800" style="max-width:100%;border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,0.12)"></video>

If the video does not play in your markdown viewer, [download and watch the full demo (admin_demo.mov)](doc/admin_demo.mov).

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