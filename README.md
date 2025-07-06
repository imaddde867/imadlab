# imadlab: My Digital Canvas & Data Engineering Portfolio

Welcome to **imadlab**, my personal website and blog, meticulously crafted to showcase my journey and expertise as a Data Engineer and AI/ML Professional. This platform is a dynamic space where I share my projects, insights, and experiences in transforming raw data into actionable intelligence.

## ✨ Features

-   **Cutting-Edge Frontend**: Built with [React](https://react.dev/) for a dynamic user interface, powered by [Vite](https://vitejs.dev/) for lightning-fast development and builds.
-   **Sleek & Modern Design**: Styled with [Tailwind CSS](https://tailwindcss.com/) for highly customizable and responsive designs, ensuring a seamless experience across all devices.
-   **Modular UI Components**: Leverages [shadcn/ui](https://ui.shadcn.com/) for beautiful, accessible, and reusable UI components, accelerating development and maintaining design consistency.
-   **Robust Backend Integration**: Seamlessly connected with [Supabase](https://supabase.com/) for a powerful, open-source backend that handles database management, authentication, and more.
-   **Comprehensive Content Sections**: Dedicated sections for:
    -   **Projects**: A detailed portfolio showcasing my data engineering and AI/ML projects, complete with descriptions, tech stacks, and links to repositories.
    -   **Blog**: A space for sharing articles, tutorials, and thoughts on data science, machine learning, and software development.
    -   **Contact**: An interactive form to connect with me for collaborations or inquiries.
-   **Optimized for Performance**: Engineered for speed and efficiency, providing a smooth browsing experience.

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

Before you begin, ensure you have the following installed:

-   [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
-   [npm](https://www.npmjs.com/) (Node Package Manager)
-   [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/imaddde867/imadlab.git
    cd imadlab
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

### Supabase Setup

This project relies on Supabase for its backend.

1.  **Initialize Supabase locally**:
    ```bash
    supabase init
    ```

2.  **Link to your Supabase project**:
    ```bash
    supabase link --project-ref your-project-ref
    ```
    (Replace `your-project-ref` with your actual Supabase project reference, found in your Supabase dashboard settings.)

3.  **Apply database migrations**:
    ```bash
    supabase db push
    ```
    This will apply the necessary table schemas (for `posts` and `projects`) to your Supabase project.

4.  **Generate TypeScript types for Supabase**:
    ```bash
    supabase gen types typescript --project-id "your-project-id" --schema public > src/integrations/supabase/types.ts
    ```
    (Replace `your-project-id` with your actual Supabase project ID, found in your Supabase dashboard settings.)

### Development

Start the local development server:

```bash
npm run dev
```

Visit [http://localhost:8080](http://localhost:8080) in your browser. The application will automatically reload as you make changes.

### Build

To build the project for production:

```bash
npm run build
```

The optimized production build will be generated in the `dist/` directory.

### Lint

To lint the codebase and ensure code quality:

```bash
npm run lint
```

## 🌐 Deployment

This project can be easily deployed to various static hosting services. For continuous deployment, you can configure GitHub Actions (as seen in `.github/workflows/deploy.yml`) to automatically deploy your site on every push to the `main` branch.

## 📂 Project Structure

```
.
├── public/                 # Static assets
├── src/                    # Main source code
│   ├── components/         # Reusable UI and page-specific components
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # Third-party service integrations (e.g., Supabase)
│   │   └── supabase/
│   │       ├── client.ts   # Supabase client initialization
│   │       └── types.ts    # Auto-generated Supabase TypeScript types
│   ├── lib/                # Utility functions
│   ├── pages/              # Top-level page components (e.g., Index, Projects, Blog)
│   ├── App.tsx             # Main application component and routing
│   ├── main.tsx            # Entry point for React application
│   └── index.css           # Global styles and TailwindCSS imports
├── supabase/               # Supabase CLI configuration and database migrations
│   ├── config.toml         # Supabase project configuration
│   └── migrations/         # SQL migration files for database schema
├── .github/                # GitHub Actions workflows
│   └── workflows/
│       └── deploy.yml      # Workflow for continuous deployment
├── package.json            # Project dependencies and scripts
├── tailwind.config.ts      # Tailwind CSS configuration
├── vite.config.ts          # Vite build tool configuration
└── README.md               # Project README (this file)
```

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.