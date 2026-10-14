import { writeFile } from "node:fs/promises"

import { getMigrations } from "better-auth/db/migration"

import { auth, database } from "../src/auth"

const schemaPath = new URL("./schema.sql", import.meta.url)
// Columns created before the snake_case field mappings use BetterAuth's
// camelCase defaults; rename them so the migrated schema matches.
const renameLegacyColumns = `
  do $$
  declare
    column_record record;
    snake_column text;
  begin
    for column_record in
      select table_name, column_name
      from information_schema.columns
      where table_schema = 'auth'
        and column_name ~ '[A-Z]'
    loop
      snake_column := lower(regexp_replace(column_record.column_name, '([A-Z])', '_\\1', 'g'));

      if not exists (
        select 1
        from information_schema.columns
        where table_schema = 'auth'
          and table_name = column_record.table_name
          and column_name = snake_column
      ) then
        execute format(
          'alter table auth.%I rename column %I to %I',
          column_record.table_name,
          column_record.column_name,
          snake_column
        );
      end if;
    end loop;
  end $$;
`

async function main(): Promise<void> {
  const generate = process.argv.includes("--generate")

  try {
    if (!generate) {
      await database.query("create schema if not exists auth")
      await database.query(renameLegacyColumns)
    }

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
