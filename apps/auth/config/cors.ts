import { z } from "zod"

import { loadConfig } from "../lib/load-config"
import type { CorsConfig, Environment } from "./_types"
import { environment } from "./env"

const corsSchema = z.object({
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:35000")
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.url()).min(1)),
})

export function loadCorsConfig(env: Environment = environment): CorsConfig {
  const values = loadConfig(corsSchema, env)

  return {
    allowedOrigins: values.CORS_ALLOWED_ORIGINS,
    allowedHeaders: ["Content-Type", "Authorization"],
    allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }
}
