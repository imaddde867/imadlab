# imadlab: Imad Labidi’s Data Engineering & AI Portfolio

[![Build Status](https://img.shields.io/github/actions/workflow/status/imaddde867/imadlab/deploy.yml?branch=main)](https://github.com/imaddde867/imadlab/actions)
[![MIT License](https://img.shields.io/github/license/imaddde867/imadlab)](LICENSE)

**Website:** [imadlab.me](https://imadlab.me)  
**Author:** Imad Labidi — Data Engineer, AI/ML Professional, Student

---

Welcome to **imadlab**, the digital portfolio and blog of Imad Labidi. This site showcases my journey, projects, and expertise in data engineering, artificial intelligence, and machine learning. Here, you’ll find technical articles, project case studies, and resources for data science and software development.

## 🚀 Quick Links
- [Live Site](https://imadlab.me)
- [Projects](https://imadlab.me/projects)
- [Blog](https://imadlab.me/blogs)
- [Contact](https://imadlab.me#contact)
- [GitHub Repo](https://github.com/imaddde867/imadlab)

## ✨ Features
- **Modern Frontend:** React + Vite for a fast, dynamic UI
- **Beautiful UI:** Tailwind CSS & [shadcn/ui](https://ui.shadcn.com/) for accessible, consistent design
- **Backend:** Supabase for database, authentication, and API
- **Content:** Projects, blog, and contact sections
- **Admin Portal:** Secure, real-time content management
- **SEO & LLM Optimized:** Rich meta tags, Schema.org, and sitemap for discoverability on Google, ChatGPT, Grok, and more
- **Performance:** Optimized for speed and accessibility

## 🖼️ Showcase
<!-- Optionally add screenshots or GIFs here -->

## 🧠 SEO & LLM Optimization
- Rich meta tags (Open Graph, Twitter, robots, canonical, geo)
- Schema.org JSON-LD for Person, WebSite, Blog, and Article
- Sitemap.xml and robots.txt for search engine crawling
- Entity-rich content and clear structure for LLMs

## 📦 Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Postgres, Auth, Storage)
- **Deployment:** GitHub Actions, GitHub Pages

## 🛠️ Getting Started

### Prerequisites
- Node.js v18+
- npm
- Supabase CLI

### Installation
```bash
git clone https://github.com/imaddde867/imadlab.git
cd imadlab
npm install
```

### Supabase Setup
```bash
supabase init
supabase link --project-ref your-project-ref
supabase db push
supabase gen types typescript --project-id "your-project-id" --schema public > src/integrations/supabase/types.ts
```

### Development
```bash
npm run dev
```
Visit [http://localhost:8080](http://localhost:8080)

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

## 🌐 Deployment
- Static hosting (GitHub Pages, Vercel, Netlify, etc.)
- GitHub Actions for CI/CD (see `.github/workflows/deploy.yml`)

## 📂 Project Structure
```
.  
├── public/                 # Static assets
├── src/                    # Main source code
│   ├── components/         # UI and page components
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # Third-party integrations (Supabase)
│   ├── lib/                # Utilities
│   ├── pages/              # Page components
│   ├── App.tsx             # Main app/routing
│   ├── main.tsx            # React entry point
│   └── index.css           # Global styles
├── supabase/               # Supabase config and migrations
├── .github/                # GitHub Actions workflows
├── package.json            # Dependencies and scripts
├── tailwind.config.ts      # Tailwind config
├── vite.config.ts          # Vite config
└── README.md               # This file
```

## 🤝 Contact
- [LinkedIn](https://www.linkedin.com/in/imadlab/)
- [GitHub](https://github.com/imaddde867)
- Email: [contact@imadlab.me](mailto:contact@imadlab.me)

## 📜 License
MIT — see [LICENSE](LICENSE)