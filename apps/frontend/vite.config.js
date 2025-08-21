import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/hackathon-2025-content-studio/",
  plugins: [react(), tailwindcss()],
  server: {
    historyApiFallback: true,
    proxy: {
      "/content-studio/api": {
        target: process.env.VITE_DEV_PROXY_TARGET || "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
