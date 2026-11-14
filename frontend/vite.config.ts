import { vlyPlugin } from "@vly-ai/integrations";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vlyPlugin(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Force a single copy of React across all packages (including vlyPlugin).
    dedupe: ["react", "react/jsx-runtime", "react-dom", "react-dom/client"],
  },
  build: {
    // Enable source maps for better debugging (disable in production if needed)
    sourcemap: false,
    // Optimize chunk splitting using a function to avoid type/overload mismatches
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            // 1. React ecosystem packages
            if (
              id.includes('react/') ||
              id.includes('react-dom/') ||
              id.includes('react-router') ||
              id.includes('react/jsx-runtime') ||
              id.includes('scheduler')
            ) {
              return 'react-vendor';
            }
            // 2. Radix UI component library chunks
            if (id.includes('@radix-ui/')) {
              return 'radix-ui';
            }
            // 3. Heavy optional libraries
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            // 4. Charts library
            if (id.includes('recharts')) {
              return 'charts';
            }
            // 5. Form validation and management
            if (
              id.includes('react-hook-form') ||
              id.includes('@hookform/resolvers') ||
              id.includes('zod')
            ) {
              return 'forms';
            }
            // 6. Default fallback for other third-party packages
            return 'vendor';
          }
        },
        // Optimize chunk size naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit for better chunking
    chunkSizeWarningLimit: 1000,
    // Target modern browsers for better optimization
    target: 'esnext',
    // Minify options - using esbuild
    minify: 'esbuild',
  },
  // Optimize dependencies
  optimizeDeps: {
    entries: ['index.html'],
    include: [
      'react',
      'react/jsx-runtime',
      'react-dom',
      'react-dom/client',
      'react-router',
      'framer-motion',
      '@vly-ai/integrations',
    ],
  },
  // Performance hints & server settings
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
    hmr: {
      overlay: false,
    },
  },
});