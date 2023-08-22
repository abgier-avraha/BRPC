// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: [
        resolve(__dirname, "src/client.ts"),
        resolve(__dirname, "src/server.ts"),
      ],
      name: "brpc",
      // the proper extensions will be added
      fileName: "brpc",
    },
  },
});