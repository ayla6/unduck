import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: { port: 9119 },
  preview: { port: 9120 },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
    }),
  ],
});
