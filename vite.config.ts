import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  publicDir: "public",
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(rootDir, "popup.html"),
        background: resolve(rootDir, "src/background.ts")
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]"
      }
    }
  }
});
