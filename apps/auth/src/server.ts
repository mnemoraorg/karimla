import { config } from "../config/_index"
import { auth, database } from "./auth"
import { createApp } from "./http"

const app = createApp((request) => auth.handler(request), config.cors)
let shuttingDown = false

export async function startServer() {
  try {
    const tables = await database.query(
      "select table_name from information_schema.tables where table_schema = 'auth' and table_name in ('user', 'session', 'account', 'verification')",
    )
    if (tables.rowCount !== 4) throw new Error("auth schema is not migrated")
    await auth.$context
  } catch {
    throw new Error(
      "PostgreSQL is unavailable or auth tables are missing; run the auth migrations first",
    )
  }

  const server = Bun.serve({ port: config.app.port, fetch: app.fetch })

  const shutdown = async () => {
    if (shuttingDown) return
    shuttingDown = true
    server.stop()
    await database.end()
  }

  process.once("SIGINT", shutdown)
  process.once("SIGTERM", shutdown)
  console.info(`[auth] listening on ${config.auth.url}`)

  return server
}

if (import.meta.main) {
  startServer().catch((error: unknown) => {
    console.error(
      `[auth] could not start: ${error instanceof Error ? error.message : "unknown error"}`,
    )
    process.exitCode = 1
  })
}
