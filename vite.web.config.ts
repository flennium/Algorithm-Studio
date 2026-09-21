import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1];

export default defineConfig({
  root: resolve("src/renderer"),
  base: repository ? `/${repository}/` : "/",
  resolve: {
    alias: {
      "@renderer": resolve("src/renderer/src"),
      "@language": resolve("src/language"),
    },
  },
  plugins: [react(), tailwindcss()],
  build: {
    outDir: resolve("dist-web"),
    emptyOutDir: true,
  },
  server: {
    port: 4318,
    strictPort: true,
  },
});
