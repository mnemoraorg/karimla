import { z } from "zod"

import { loadConfig } from "../lib/load-config"
import type { AppConfig, Environment } from "./_types"
import { environment } from "./env"

const appSchema = z.object({
  ENVIRONMENT: z.string().trim().min(1).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(35081),
})

export function loadAppConfig(env: Environment = environment): AppConfig {
  const values = loadConfig(appSchema, env)

  return { environment: values.ENVIRONMENT, port: values.PORT }
}
