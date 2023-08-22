// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: [],
      name: "brpc",
      // the proper extensions will be added
      fileName: "brpc",
    },
  },
});
