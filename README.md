<div align="center">
  <img src="https://raw.githubusercontent.com/imaddde867/imadlab/refs/heads/master/doc/Hero_section.png" alt="imadlab hero section screenshot" width="800" style="max-width:100%;border-radius:16px;box-shadow:0 2px 16px rgba(0,0,0,0.10);margin-bottom:12px;" />
  <h1>imadlab: A Next-Gen Developer Portfolio</h1>
  <p>Where Data Engineering Meets Cutting-Edge Web Development</p>
</div>

## Overview

imadlab is a production-ready portfolio that shows how I design and operate data-centric web systems. The site combines a React 18 front end with Supabase services, automated publishing flows, and real-time integrations—all tuned for fast performance and clean operations.

**Live Demo:** [imadlab.me](https://imadlab.me) · **Source:** [github.com/imaddde867/imadlab](https://github.com/imaddde867/imadlab)

## Quick Start

```bash
git clone https://github.com/imaddde867/imadlab.git
cd imadlab
npm install
npm run dev
```

## Highlights

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 30px 0;">

### Portfolio Delivery
- Dynamic project filtering and deep-dive case studies
- Cross-platform responsive layouts and design tokens
- Automated sync with GitHub repos and hosted demos

### Publishing Pipeline
- GitHub-Flavored Markdown with KaTeX math, Mermaid diagrams, and syntax highlighting
- Secure admin workflow with previews and staged deploys
- SEO-first rendering (OpenGraph, sitemap, schema.org)

### Real-Time Integrations
<video src="https://raw.githubusercontent.com/imaddde867/imadlab/master/doc/admin_demo.mov" controls width="100%" style="border-radius:12px;"></video>

- **Strava API**: Running stats, activity timelines, and year-over-year trends with smart caching
- **Analytics Dashboard**: Privacy-first tracking with GDPR-compliant consent management
- **Newsletter System**: Queue with retries, unsubscribe handling, and delivery analytics
- **Spotify Now Playing**: Real-time music status via Edge Functions
</div>

## Technology Stack

```mermaid
graph TD
    A[Frontend] --> B[React 18]
    A --> C[TypeScript]
    A --> D[Vite]
    A --> E[Tailwind CSS + shadcn/ui]
    
    F[Backend] --> G[Supabase]
    G --> H[PostgreSQL + RLS]
    G --> I[Auth]
    G --> J[Storage]
    G --> K[Edge Functions]
    
    L[Integrations] --> M[Strava API]
    L --> N[Spotify API]
    L --> O[Formspree]
    L --> P[Resend]
    
    Q[Content] --> R[React Markdown]
    R --> S[GitHub-Flavored Markdown]
    R --> T[KaTeX Math]
    R --> U[Mermaid Diagrams]
    R --> V[Syntax Highlighting]
    
    W[DevOps] --> X[GitHub Actions]
    W --> Y[Vercel/Netlify]
    W --> Z[Automated SEO]
```

## Architecture

```bash
src/
├── components/      # Reusable UI library (shadcn-based + custom)
│   ├── running/     # Strava integration components
│   ├── markdown/    # GFM renderer with math & diagrams
│   └── ui/          # Core design system components
├── hooks/           # Analytics, scroll effects, toast notifications
├── integrations/    # Supabase, Strava, Spotify API clients
├── lib/             # Utilities, caching, consent management
└── pages/           # Route-level views and admin dashboards

supabase/
├── functions/       # Edge Functions (Strava, Spotify, newsletters)
└── migrations/      # Database schema and RLS policies
```

Key patterns:

- **Supabase Edge Functions** proxy external APIs, send newsletters, and track analytics
- **React Query** drives data fetching with intelligent caching and optimistic updates
- **Advanced Markdown** supports GFM, KaTeX equations, Mermaid diagrams, and code highlighting
- **Privacy-First Analytics** with GDPR cookie consent and visitor session tracking
- **Smart Caching** for Strava data with rate limit protection and fallback strategies
- Typed Supabase schemas keep the database and UI in sync
- Automated migrations, linting, and CI guardrails ensure consistency

## Impact

imadlab demonstrates:

- End-to-end ownership of a cloud-native content platform with real-time integrations
- Advanced markdown rendering with mathematical equations, diagrams, and code highlighting
- Privacy-compliant analytics with GDPR cookie consent and visitor tracking
- Robust API integration patterns with smart caching and rate limit handling
- Secure admin tooling with error handling, observability, and email campaign management
- Performance-tuned UX with Lighthouse 95+ scores and responsive design
- Maintainable, extensible architecture suited for production workloads

---

<div align="center" style="margin-top: 40px;">
  <a href="https://imadlab.me">
    <img src="https://img.shields.io/badge/Visit_Live_Site-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Site">
  </a>
  <a href="https://github.com/imaddde867/imadlab">
    <img src="https://img.shields.io/badge/View_Source_Code-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
</div>

<p align="center">
  <a href="https://imadlab.me#contact">Contact</a> ·
  <a href="https://www.linkedin.com/in/imad-eddine-elmouss/">LinkedIn</a> ·
</p>
