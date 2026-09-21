import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    server: {
      port: 4317,
      strictPort: true,
    },
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
        "@language": resolve("src/language"),
      },
    },
    plugins: [react(), tailwindcss()],
  },
});
