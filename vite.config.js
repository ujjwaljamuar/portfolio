import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

const githubPagesSpaFallback = () => ({
  name: "github-pages-spa-fallback",
  closeBundle() {
    copyFileSync(resolve("dist/index.html"), resolve("dist/404.html"));
  },
});

export default defineConfig({
  plugins: [react(), githubPagesSpaFallback()],
  base: "/portfolio",
});
