import { writeFile } from "node:fs/promises"

import { getMigrations } from "better-auth/db/migration"

import { auth, database } from "../src/auth"

const schemaPath = new URL("./schema.sql", import.meta.url)

async function main(): Promise<void> {
  const generate = process.argv.includes("--generate")

  try {
    if (!generate) await database.query("create schema if not exists auth")

    const migration = await getMigrations(auth.options, { throwOnUnsafe: !generate })

    if (generate) {
      await writeFile(schemaPath, `${await migration.compileMigrations()}\n`)
      return
    }

    await migration.runMigrations()
  } finally {
    await database.end()
  }
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message.trim() : ""
    console.error(
      `BetterAuth migration failed: ${message || "check PostgreSQL connectivity and auth configuration"}`,
    )
    process.exitCode = 1
  })
}
