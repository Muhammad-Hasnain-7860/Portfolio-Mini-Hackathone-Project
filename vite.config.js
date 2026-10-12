import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        contact: resolve(root, "contact/index.html"),
        contact: resolve(root, "contact/index.html"),
        info: resolve(root, "info/index.html"),
        works: resolve(root, "works/index.html"),
      },
    },
  },
});
