import { z } from "zod"

import { loadConfig } from "../lib/load-config"
import type { AuthConfig, Environment } from "./_types"
import { environment } from "./env"

const betterAuthSchema = z
  .object({
    ENVIRONMENT: z.string().trim().min(1).default("development"),
    BETTER_AUTH_SECRET: z.string().trim().min(32),
    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_COOKIE_DOMAIN: z
      .string()
      .trim()
      .toLowerCase()
      .optional()
      .transform((value) => value || undefined),
  })
  .superRefine((values, context) => {
    const domain = values.BETTER_AUTH_COOKIE_DOMAIN
    const hostname = new URL(values.BETTER_AUTH_URL).hostname

    if (values.ENVIRONMENT === "production" && !domain) {
      context.addIssue({
        code: "custom",
        path: ["BETTER_AUTH_COOKIE_DOMAIN"],
        message: "Required in production so the web and auth hosts share the session cookie",
      })
    }

    if (domain && domain !== hostname && !hostname.endsWith(`.${domain}`)) {
      context.addIssue({
        code: "custom",
        path: ["BETTER_AUTH_COOKIE_DOMAIN"],
        message: "Must be the auth service hostname or one of its parent domains",
      })
    }
  })

export function loadBetterAuthConfig(env: Environment = environment): AuthConfig {
  const values = loadConfig(betterAuthSchema, env)

  return {
    cookieDomain: values.BETTER_AUTH_COOKIE_DOMAIN,
    secret: values.BETTER_AUTH_SECRET,
    url: values.BETTER_AUTH_URL.replace(/\/$/, ""),
  }
}
