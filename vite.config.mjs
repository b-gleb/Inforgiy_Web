import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  base: '/Inforgiy_Web/',
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      filename: 'dist_stats/treemap.html',
      template: 'treemap',
      gzipSize: true,
    }),
    visualizer({
      filename: 'dist_stats/flamegraph.html',
      template: 'flamegraph',
      open: true,
      gzipSize: true,
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
})