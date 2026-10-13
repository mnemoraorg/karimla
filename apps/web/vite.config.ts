import { defineConfig } from "vite"
import vinext from "vinext"
import { cloudflare } from "@cloudflare/vite-plugin"
import { cdnAdapter } from "@vinext/cloudflare/cache/cdn-adapter"

export default defineConfig({
  clearScreen: false,
  server: {
    port: 34003,
    strictPort: true,
  },
  plugins: [
    vinext({
      cache: { cdn: cdnAdapter() },
    }),
    cloudflare({
      inspectorPort: 9231,
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
})
