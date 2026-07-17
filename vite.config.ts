import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// GitHub Pages serves this project under /salamat/.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/salamat/" : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}))
