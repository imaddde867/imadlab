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
          // Separate React core libraries for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            // Split heavy libraries separately to avoid terser issues
            if (id.includes('mermaid')) {
              return 'mermaid';
            }
            if (id.includes('highlight.js')) {
              return 'highlight';
            }
            if (id.includes('katex')) {
              return 'katex';
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
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Use esbuild minification instead of terser (faster and no circular dependency issues)
    minify: 'esbuild',
    // Set reasonable chunk size
    chunkSizeWarningLimit: 600,
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
});
