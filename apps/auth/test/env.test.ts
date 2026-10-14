import { describe, expect, it } from "vitest"

import { loadAuthConfig } from "../config/env"

const validEnv = {
  DATABASE_URL: "postgres://karimla:karimla@localhost:5432/karimla",
  BETTER_AUTH_SECRET: "x".repeat(32),
  BETTER_AUTH_URL: "http://localhost:35081",
}

describe("loadAuthConfig", () => {
  it("defaults the port and the web origin", () => {
    const config = loadAuthConfig(validEnv)

    expect(config.port).toBe(35081)
    expect(config.allowedOrigins).toEqual(["http://localhost:35000"])
    expect(config.baseUrl).toBe("http://localhost:35081")
  })

  it("trims a trailing slash and splits origins", () => {
    const config = loadAuthConfig({
      ...validEnv,
      BETTER_AUTH_URL: "http://localhost:35081/",
      CORS_ALLOWED_ORIGINS: "http://localhost:35000, http://localhost:35001",
    })

    expect(config.baseUrl).toBe("http://localhost:35081")
    expect(config.allowedOrigins).toEqual(["http://localhost:35000", "http://localhost:35001"])
  })

  it("rejects a short secret", () => {
    expect(() => loadAuthConfig({ ...validEnv, BETTER_AUTH_SECRET: "too-short" })).toThrow()
  })

  it("rejects a missing database url", () => {
    const { DATABASE_URL: _unused, ...rest } = validEnv

    expect(() => loadAuthConfig(rest)).toThrow()
  })
})
