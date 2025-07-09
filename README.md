# imadlab: Imad Eddine El mouss’s Data Engineering & AI Portfolio

[![Build Status](https://img.shields.io/github/actions/workflow/status/imaddde867/imadlab/deploy.yml?branch=main)](https://github.com/imaddde867/imadlab/actions)
[![MIT License](https://img.shields.io/github/license/imaddde867/imadlab)](LICENSE)

**Website:** [imadlab.me](https://imadlab.me)  
**Author:** Imad Eddine El mouss — Data Engineer, AI/ML Professional, Student

---

Welcome to **imadlab**, the digital portfolio and blog of Imad Eddine El mouss. This site showcases my journey, projects, and expertise in data engineering, artificial intelligence, and machine learning. Here, you’ll find technical articles, project case studies, and resources for data science and software development.

## 🚀 Quick Links
- [Live Site](https://imadlab.me)
- [Projects](https://imadlab.me/projects)
- [Blog](https://imadlab.me/blogs)
- [Contact](https://imadlab.me#contact)
- [GitHub Repo](https://github.com/imaddde867/imadlab)

## ✨ Key Features
- **Dynamic Portfolio:** Showcases data engineering and AI/ML projects with detailed case studies.
- **Technical Blog:** Features articles on data science, AI, and software development.
- **Admin Portal:** Secure content management for blog posts and projects.
- **SEO & LLM Optimization:** Enhanced discoverability and content understanding for search engines and large language models.
- **Modern UI/UX:** Fast, responsive, and accessible user interface.
- **Supabase Integration:** Robust backend for data, authentication, and serverless functions.

## 💡 Features
- **Modern Frontend:** React + Vite for a fast, dynamic UI.
- **Beautiful UI:** Tailwind CSS & [shadcn/ui](https://ui.shadcn.com/) for accessible, consistent design.
- **Backend:** Supabase for database, authentication, API, and **Edge Functions** (e.g., for Spotify Now Playing integration).
- **Content:** Projects, blog, and contact sections.
- **Admin Portal:** Secure, real-time content management for **blog posts and projects**.
- **SEO & LLM Optimized:** Rich meta tags, Schema.org, and sitemap for discoverability on Google, ChatGPT, Grok, and more.
- **Performance:** Optimized for speed and accessibility.

## 🖼️ Showcase
<!-- Optionally add screenshots or GIFs here -->

## 🧠 SEO & LLM Optimization
- Rich meta tags (Open Graph, Twitter, robots, canonical, geo)
- Schema.org JSON-LD for Person, WebSite, Blog, and Article
- Sitemap.xml and robots.txt for search engine crawling
- Entity-rich content and clear structure for LLMs

## 📦 Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions)
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
This command first generates the `sitemap.xml` for SEO purposes, then builds the React application using Vite, and finally copies `dist/index.html` to `dist/404.html` to ensure proper routing for static site hosting.

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

## 🤝 Contributing
Contributions are welcome! If you find a bug or have a feature request, please open an issue or submit a pull request.

## 📞 Contact
- [LinkedIn](https://www.linkedin.com/in/imadlab/)
- [GitHub](https://github.com/imaddde867)
- Email: [contact@imadlab.me](mailto:contact@imadlab.me)

## 📜 License
MIT — see [LICENSE](LICENSE)