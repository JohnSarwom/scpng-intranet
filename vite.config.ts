import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Increase the warning limit to reduce noise in the console
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Configure manual chunks to split the bundle logically
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom'
          ],
          microsoft: [
            '@azure/msal-browser',
            '@azure/msal-react'
          ]
        }
      }
    },
    // Enable source map generation for production builds
    sourcemap: mode !== 'production',
    // Minify the output for production
    minify: mode === 'production'
  }
}));
