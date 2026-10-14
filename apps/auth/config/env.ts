import { z } from "zod"

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(35081),
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().trim().min(32),
  BETTER_AUTH_URL: z.url(),
  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:35000"),
})

export interface AuthConfig {
  port: number
  databaseUrl: string
  secret: string
  baseUrl: string
  allowedOrigins: string[]
}

export function loadAuthConfig(env: Record<string, string | undefined>): AuthConfig {
  const values = schema.parse(env)

  return {
    port: values.PORT,
    databaseUrl: values.DATABASE_URL,
    secret: values.BETTER_AUTH_SECRET,
    baseUrl: values.BETTER_AUTH_URL.replace(/\/$/, ""),
    allowedOrigins: values.CORS_ALLOWED_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  }
}
