import pg from "pg"
import { Kysely, PostgresDialect } from "kysely"

export interface AuthDatabase {
  [key: string]: unknown
}

export function createDatabase(databaseUrl: string): Kysely<AuthDatabase> {
  const pool = new pg.Pool({ connectionString: databaseUrl })

  return new Kysely<AuthDatabase>({
    dialect: new PostgresDialect({ pool }),
  })
}
