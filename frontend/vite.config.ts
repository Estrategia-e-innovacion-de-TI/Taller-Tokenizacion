import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const emptyStub = fileURLToPath(new URL("./src/stubs/empty.ts", import.meta.url));

// GitHub Pages: https://<user>.github.io/Taller-Tokenizacion/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE_PATH || "/Taller-Tokenizacion/",
  resolve: {
    alias: {
      "@stripe/stripe-js": emptyStub,
    },
  },
  optimizeDeps: {
    include: ["@privy-io/react-auth"],
    exclude: ["@stripe/stripe-js"],
  },
});
