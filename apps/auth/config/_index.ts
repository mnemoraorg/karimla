import { loadAppConfig } from "./app"
import { loadBetterAuthConfig } from "./better-auth"
import { loadCorsConfig } from "./cors"
import { loadDatabaseConfig } from "./db"
import { loadEmailConfig } from "./email"

export const config = {
  app: loadAppConfig(),
  auth: loadBetterAuthConfig(),
  cors: loadCorsConfig(),
  database: loadDatabaseConfig(),
  email: loadEmailConfig(),
}
