import fs from "fs";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    watch: {
      include: ["src/**"],
      buildDelay: 500,
    },
  },
  plugins: [
    react(),
    viteSingleFile(),
    {
      name: "vite-plugin-html-string",
      closeBundle() {
        const bundle = fs.readFileSync("dist/index.html", "utf8");

        const escaped = JSON.stringify(bundle);
        const js = `export default ${escaped}`;

        fs.writeFileSync("dist/htmlString.ts", js);
      },
    },
  ],
});
