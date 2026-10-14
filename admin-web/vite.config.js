import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Project root aliases
      "~": new URL("./src", import.meta.url).pathname,
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  server: {
    port: Number(process.env.VITE_DEV_PORT) || 5174,
    host: "localhost",
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
