import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import rune from "rune-sdk/vite";
// import { qrcode } from "vite-plugin-qrcode";

// https://vitejs.dev/config/
export default defineConfig({
  base: "", // Makes paths relative
  plugins: [
    // qrcode({}), // only applies in dev mode
    tailwindcss(),
    rune({
      logicPath: path.resolve("./src/logic.ts"),
      minifyLogic: false,
      ignoredDependencies: [],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
