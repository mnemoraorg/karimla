import { betterAuth } from "better-auth"
import { magicLink } from "better-auth/plugins"
import { Kysely, PostgresDialect } from "kysely"
import { Pool } from "pg"

import { config } from "../config/_index"
import { CloudflareEmailSender } from "./mailing/cloudflare-email-sender"

export const database = new Pool({ connectionString: config.database.url })

const authDatabase = new Kysely({ dialect: new PostgresDialect({ pool: database }) })
const emailSender = new CloudflareEmailSender(config.email)

export const auth = betterAuth({
  appName: "Karimla",
  baseURL: config.auth.url,
  basePath: "/api/v1/auth",
  secret: config.auth.secret,
  trustedOrigins: config.cors.allowedOrigins,
  database: { db: authDatabase, type: "postgres", schemaName: "auth" },
  emailAndPassword: { enabled: false },
  plugins: [
    magicLink({
      disableSignUp: false,
      expiresIn: 600,
      storeToken: "hashed",
      sendMagicLink: (data) => emailSender.sendMagicLink(data),
    }),
  ],
})
