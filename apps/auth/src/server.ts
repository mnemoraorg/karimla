import { Hono } from "hono"
import { cors } from "hono/cors"
import { sql } from "kysely"

import { createAuth } from "../config/better-auth"
import { createDatabase } from "../config/db"
import { loadAuthConfig } from "../config/env"

const config = loadAuthConfig(process.env)
const database = createDatabase(config.databaseUrl)
const auth = createAuth({
  secret: config.secret,
  baseUrl: config.baseUrl,
  database,
  trustedOrigins: config.allowedOrigins,
})

const app = new Hono()

app.use(
  "/api/auth/*",
  cors({
    origin: config.allowedOrigins,
    credentials: true,
    allowHeaders: ["Content-Type"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
)

app.all("/api/auth/*", (c) => auth.handler(c.req.raw))

app.get("/health", (c) => c.json({ status: "ok" }))

let shuttingDown = false

async function shutdown(server: { stop: () => void }): Promise<void> {
  if (shuttingDown) return
  shuttingDown = true
  server.stop()
  await database.destroy()
  process.exit(0)
}

try {
  // BetterAuth logs schema problems but keeps serving, so fail fast here instead.
  await sql`select 1`.execute(database)
  await auth.$context
} catch (error) {
  console.error(`[auth] could not start: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
}

const server = Bun.serve({ port: config.port, fetch: app.fetch })

console.log(`[auth] listening on ${config.baseUrl}`)

process.on("SIGINT", () => void shutdown(server))
process.on("SIGTERM", () => void shutdown(server))
