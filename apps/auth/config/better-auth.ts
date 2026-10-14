import { betterAuth } from "better-auth"
import { emailOTP } from "better-auth/plugins"
import { kyselyAdapter } from "@better-auth/kysely-adapter"
import { Kysely } from "kysely"

import type { AuthDatabase } from "./db"

export interface AuthOptions {
  secret: string
  baseUrl: string
  database: Kysely<AuthDatabase>
  trustedOrigins: string[]
}

export function createAuth({ secret, baseUrl, database, trustedOrigins }: AuthOptions) {
  return betterAuth({
    baseURL: baseUrl,
    secret,
    trustedOrigins,
    // A new email signs up on first code, an existing email signs in. See the login copy.
    emailAndPassword: { enabled: false },
    database: kyselyAdapter(database, { type: "postgres" }),
    plugins: [
      // shortcut: the code is logged instead of emailed until a mail provider exists
      emailOTP({
        sendVerificationOnSignUp: true,
        disableSignUp: false,
        async sendVerificationOTP({ email, otp }) {
          console.log(`[auth] sign-in code for ${email}: ${otp}`)
        },
      }),
    ],
  })
}
