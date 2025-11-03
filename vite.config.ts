import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Keep React ecosystem together to avoid dependency issues
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            // Split heavy libraries separately (lazy-loaded)
            if (id.includes('mermaid')) {
              return 'mermaid';
            }
            if (id.includes('highlight.js')) {
              return 'highlight';
            }
            if (id.includes('katex')) {
              return 'katex';
            }
            // Markdown processing libraries
            if (id.includes('remark') || id.includes('rehype') || id.includes('react-markdown')) {
              return 'markdown';
            }
            // UI libraries
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            // Supabase and query libraries
            if (id.includes('@supabase') || id.includes('@tanstack')) {
              return 'data-vendor';
            }
            // Remaining node_modules
            return 'vendor';
          }
        },
      },
    },
    // Use esbuild minification (faster and more reliable)
    minify: 'esbuild',
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
  },
});
