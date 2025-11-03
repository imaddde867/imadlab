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
    // Use esbuild for faster builds (terser was causing .tsx output bug)
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        // Smart chunking strategy for better caching
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React core - changes rarely
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // UI libraries - changes rarely
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            // Markdown and syntax - large but changes rarely
            if (id.includes('react-markdown') || id.includes('highlight.js') || 
                id.includes('rehype') || id.includes('remark') || 
                id.includes('katex') || id.includes('mermaid')) {
              return 'markdown-vendor';
            }
            // Query and routing - changes rarely
            if (id.includes('@tanstack') || id.includes('react-router')) {
              return 'data-vendor';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            // Everything else
            return 'vendor';
          }
        },
        // Optimize asset naming for better caching
        assetFileNames: (assetInfo) => {
          // Only apply to actual assets (fonts, images), not JS/CSS
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i.test(assetInfo.name || '')) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            return `assets/fonts/[name]-[hash][extname]`;
          } else if (/\.css$/i.test(assetInfo.name || '')) {
            return `assets/[name]-[hash][extname]`;
          }
          // For everything else, use default naming
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: (chunkInfo) => {
          // Force .js extension for all chunks, even if source is .tsx
          return 'assets/js/[name]-[hash].js';
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    reportCompressedSize: true,
    cssMinify: true,
  },
});
