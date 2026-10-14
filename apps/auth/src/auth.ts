import { betterAuth } from "better-auth"
import { emailOTP } from "better-auth/plugins"
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
  user: {
    fields: {
      createdAt: "created_at",
      emailVerified: "email_verified",
      updatedAt: "updated_at",
    },
  },
  session: {
    fields: {
      createdAt: "created_at",
      expiresAt: "expires_at",
      ipAddress: "ip_address",
      updatedAt: "updated_at",
      userAgent: "user_agent",
      userId: "user_id",
    },
  },
  account: {
    fields: {
      accessToken: "access_token",
      accessTokenExpiresAt: "access_token_expires_at",
      accountId: "account_id",
      createdAt: "created_at",
      idToken: "id_token",
      providerId: "provider_id",
      refreshToken: "refresh_token",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      updatedAt: "updated_at",
      userId: "user_id",
    },
  },
  verification: {
    fields: {
      createdAt: "created_at",
      expiresAt: "expires_at",
      updatedAt: "updated_at",
    },
  },
  emailAndPassword: { enabled: false },
  plugins: [
    emailOTP({
      allowedAttempts: 3,
      disableSignUp: false,
      expiresIn: 600,
      otpLength: 6,
      sendVerificationOnSignUp: true,
      storeOTP: "hashed",
      sendVerificationOTP: (data) => emailSender.sendVerificationOtp(data),
    }),
  ],
})
