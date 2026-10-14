import { z } from "zod"

import { loadConfig } from "../lib/load-config"
import type { AuthConfig, Environment } from "./_types"
import { environment } from "./env"

const betterAuthSchema = z.object({
  BETTER_AUTH_SECRET: z.string().trim().min(32),
  BETTER_AUTH_URL: z.url(),
})

export function loadBetterAuthConfig(env: Environment = environment): AuthConfig {
  const values = loadConfig(betterAuthSchema, env)

  return {
    secret: values.BETTER_AUTH_SECRET,
    url: values.BETTER_AUTH_URL.replace(/\/$/, ""),
  }
}
