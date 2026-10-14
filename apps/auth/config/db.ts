import { z } from "zod"

import { loadConfig } from "../lib/load-config"
import type { DatabaseConfig, Environment } from "./_types"
import { environment } from "./env"

const databaseSchema = z.object({ DATABASE_URL: z.url() })

export function loadDatabaseConfig(env: Environment = environment): DatabaseConfig {
  return { url: loadConfig(databaseSchema, env).DATABASE_URL }
}
