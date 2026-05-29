import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  server: {
    // for local `npm run dev` only — production goes through nginx
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
});
