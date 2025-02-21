import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import Macros from "unplugin-macros/vite";

export default defineConfig({
  server: { port: 9119 },
  preview: { port: 9120 },
  plugins: [
    Macros(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * 1048576,
      },
    }),
  ],
});
