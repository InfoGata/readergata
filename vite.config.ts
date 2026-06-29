/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  // Vite 8 switched to Rolldown and made CJS default-import interop "consistent"
  // (default = full module.exports), which breaks CJS deps that use the
  // `exports.default` + `__esModule` pattern without an ESM build. Restore the
  // pre-Vite-8 behavior to match the rest of the apps.
  legacy: {
    inconsistentCjsInterop: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["fake-indexeddb/auto", "src/test/before.ts"],
    teardownTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    tanstackRouter({ target: "react"}),
    VitePWA({
      registerType: "prompt",
      workbox: {
        navigateFallback: "/",
        navigateFallbackDenylist: [
          /\.html$/,
          /\.html\?/,
          /login_popup\.html/,
        ],
      },
      manifest: {
        short_name: "ReaderGata",
        name: "ReaderGata",
        icons: [
          {
            src: "favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon",
          },
          {
            src: "logo192.png",
            type: "image/png",
            sizes: "192x192",
          },
          {
            src: "logo512.png",
            type: "image/png",
            sizes: "512x512",
          },
        ],
        start_url: ".",
        display: "standalone",
        theme_color: "#000000",
        background_color: "#ffffff",
      },
    }),
  ],

  server: {
    port: 3000,
    open: true,
  },
});
