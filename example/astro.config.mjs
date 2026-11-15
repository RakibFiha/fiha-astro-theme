// @ts-check
import { defineConfig } from "astro/config";

// Example site for the theme's CI and docs. Placeholder content only.
export default defineConfig({
  site: "https://example.com",
  trailingSlash: "ignore",
  build: { format: "directory" },
  compressHTML: false,
});
