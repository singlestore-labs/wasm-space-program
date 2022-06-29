import react from "@vitejs/plugin-react";
import jotaiDebugLabel from "jotai/babel/plugin-debug-label";
import jotaiReactRefresh from "jotai/babel/plugin-react-refresh";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsConfigPaths(),
    react({
      babel: {
        plugins: ["@emotion/babel-plugin", jotaiDebugLabel, jotaiReactRefresh],
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 512,
    rollupOptions: {
      output: {
        manualChunks: {
          pixi: ["pixi.js"],
          react: [
            "react",
            "react-dom",
            "react-markdown",
            "react-router-dom",
            "rooks",
            "@inlet/react-pixi",
          ],
        },
      },
    },
  },
});
