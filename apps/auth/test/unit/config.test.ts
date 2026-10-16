import { describe, expect, it } from "vitest"

import { loadAppConfig } from "../../config/app"
import { loadBetterAuthConfig } from "../../config/better-auth"
import { loadCorsConfig } from "../../config/cors"
import { loadEmailConfig } from "../../config/email"

const validEnv = {
  BETTER_AUTH_SECRET: "x".repeat(32),
  BETTER_AUTH_URL: "http://localhost:35081/",
  CLOUDFLARE_ACCOUNT_ID: "account-id",
  CLOUDFLARE_API_TOKEN: "api-token",
  NO_REPLY_EMAIL: "login@example.com",
}

describe("auth config", () => {
  it("defaults the app port and environment", () => {
    expect(loadAppConfig({})).toEqual({ environment: "development", port: 35081 })
  })

  it("normalizes the BetterAuth URL", () => {
    expect(loadBetterAuthConfig(validEnv).url).toBe("http://localhost:35081")
  })

  it("parses an explicit CORS allowlist", () => {
    expect(
      loadCorsConfig({ CORS_ALLOWED_ORIGINS: "http://localhost:35000, https://karimla.example" })
        .allowedOrigins,
    ).toEqual(["http://localhost:35000", "https://karimla.example"])
  })

  it("requires a strong BetterAuth secret and valid sender address", () => {
    expect(() => loadBetterAuthConfig({ ...validEnv, BETTER_AUTH_SECRET: "short" })).toThrow()
    expect(() => loadEmailConfig({ ...validEnv, NO_REPLY_EMAIL: "invalid" })).toThrow()
  })

  it("leaves the cookie domain unset outside production", () => {
    expect(loadBetterAuthConfig(validEnv).cookieDomain).toBeUndefined()
  })

  it("requires a cookie domain in production", () => {
    expect(() => loadBetterAuthConfig({ ...validEnv, ENVIRONMENT: "production" })).toThrow()
  })

  it("normalizes a parent cookie domain in production", () => {
    const loaded = loadBetterAuthConfig({
      ...validEnv,
      BETTER_AUTH_URL: "https://auth-yappi.mnemora.org",
      BETTER_AUTH_COOKIE_DOMAIN: " Mnemora.org ",
      ENVIRONMENT: "production",
    })

    expect(loaded.cookieDomain).toBe("mnemora.org")
  })

  it("rejects cookie domains the auth hostname does not belong to", () => {
    const env = { ...validEnv, BETTER_AUTH_URL: "https://auth-yappi.mnemora.org" }

    expect(() =>
      loadBetterAuthConfig({ ...env, BETTER_AUTH_COOKIE_DOMAIN: "example.com" }),
    ).toThrow()
    expect(() =>
      loadBetterAuthConfig({ ...env, BETTER_AUTH_COOKIE_DOMAIN: "appi.mnemora.org" }),
    ).toThrow()
  })

  it("accepts the auth hostname itself as the cookie domain", () => {
    expect(
      loadBetterAuthConfig({
        ...validEnv,
        BETTER_AUTH_URL: "https://auth-yappi.mnemora.org",
        BETTER_AUTH_COOKIE_DOMAIN: "auth-yappi.mnemora.org",
      }).cookieDomain,
    ).toBe("auth-yappi.mnemora.org")
  })

  it("uses the no-reply sender and leaves invitations unused", () => {
    expect(loadEmailConfig({ ...validEnv, INVITATION_EMAIL: "invite@example.com" }).from).toBe(
      validEnv.NO_REPLY_EMAIL,
    )
  })

  it("requires Cloudflare email credentials", () => {
    const { CLOUDFLARE_API_TOKEN: _unused, ...missingToken } = validEnv

    expect(() => loadEmailConfig(missingToken)).toThrow()
    expect(() => loadCorsConfig({ CORS_ALLOWED_ORIGINS: " , " })).toThrow()
  })
})
