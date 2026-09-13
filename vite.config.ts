/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import { buildInfoDefine } from "./build-info";

// https://vitejs.dev/config/
export default defineConfig({
  // Vite 8 switched to Rolldown and made CJS default-import interop "consistent"
  // (default = full module.exports), which breaks CJS deps that use the
  // `exports.default` + `__esModule` pattern without an ESM build. Restore the
  // pre-Vite-8 behavior to match the rest of the apps.
  legacy: {
    inconsistentCjsInterop: true,
  },
  // Version and commit, so a bug report can name the build it came from.
  define: buildInfoDefine(),
  test: {
    environment: "jsdom",
    setupFiles: ["fake-indexeddb/auto", "src/test/before.ts"],
    teardownTimeout: 10000,
    // Has to clear the 10s `asyncUtilTimeout` set in src/test/before.ts, or a
    // slow wait dies here first and reports a timeout instead of naming the
    // element it never found.
    testTimeout: 20000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Bare specifier rather than a relative path so TypeScript resolves it
      // through the ambient declarations in src/foliate-js.d.ts. A relative
      // import would hit file resolution and fail under `allowJs: false`.
      "foliate-js": path.resolve(__dirname, "./src/vendor/foliate-js"),
    },
  },
  plugins: [
    // Each route becomes its own chunk, so opening the app parses the shell and
    // the route being visited -- not both viewers and every plugin screen. The
    // service worker still precaches every chunk, so this changes when code is
    // parsed rather than how much is eventually downloaded.
    //
    // Must come before the react plugin: it rewrites route files and has to see
    // them before JSX is transformed. The build fails loudly if reordered.
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    VitePWA({
      // "autoUpdate" bakes skipWaiting/clientsClaim into the generated sw.js, so a
      // client stuck on a stale precached index.html recovers on its own. Under
      // "prompt" the only way to activate a waiting worker was for the page to post
      // SKIP_WAITING — impossible when the stale build is what failed to boot.
      registerType: "autoUpdate",
      workbox: {
        // The default patterns skip `.mjs`, which left public/pdf.worker.mjs
        // out of the precache: ebooks opened offline and PDFs didn't.
        globPatterns: ["**/*.{js,mjs,css,html,wasm}"],
        // Set above the current build rather than to it. The pdf worker
        // (~1.9MB) sits just under workbox's 2MiB default, and workbox drops an
        // oversized asset with only a warning -- so an upgrade that crossed it
        // would install and then fail offline.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // The precached shell is keyed as index.html. "/" is not a precache
        // entry, so a fallback bound to it had nothing to serve: `/` itself
        // loaded offline, but every deep link failed to the browser error page.
        navigateFallback: "/index.html",
        // public/ holds real pages the app shell must never answer for:
        // pluginframe.html is the iframe every plugin runs in, ui.html backs
        // the plugin options screen.
        navigateFallbackDenylist: [/\.html$/, /\.html\?/],
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

  // Unique port per app in ~/projects/webapps; strictPort so a collision fails
  // loudly instead of drifting to the next free port.
  server: {
    port: 3004,
    strictPort: true,
    open: true,
  },
  preview: {
    port: 4004,
    strictPort: true,
  },
});
