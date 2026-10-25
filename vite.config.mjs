/// <reference types="vitest/config" />

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { playwright } from "@vitest/browser-playwright";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  base: "/Inforgiy_Web/",
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      filename: "dist_stats/treemap.html",
      template: "treemap",
      gzipSize: true
    }),
    visualizer({
      filename: "dist_stats/flamegraph.html",
      template: "flamegraph",
      open: true,
      gzipSize: true
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/config/test-setup.js",
    coverage: {
      provider: "istanbul",
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      exclude: ["src/**/*.stories.{js,jsx,ts,tsx}"]
    }
  }
});
