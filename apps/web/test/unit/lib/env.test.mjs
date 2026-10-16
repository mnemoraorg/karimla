import { afterEach, describe, expect, it } from "bun:test"

import { setTestEnv, testEnvValues as values } from "../env-test-setup.mjs"

const restoreEnv = setTestEnv()

const { env, envSchema } = await import("../../../lib/env.ts")

afterEach(restoreEnv)

describe("web environment", () => {
  it("parses the configured values", () => {
    expect(env.NEXT_PUBLIC_DEBUG).toBe(true)
    expect(env.NEXT_PUBLIC_API_URL_V1).toBe(values.NEXT_PUBLIC_API_URL_V1)
  })

  it("rejects missing or malformed values", () => {
    const missingApiUrl = { ...values, NEXT_PUBLIC_API_URL_V1: undefined }
    const malformedApiUrl = { ...values, NEXT_PUBLIC_API_URL_V1: "http://localhost:35080" }
    const malformedDebug = { ...values, NEXT_PUBLIC_DEBUG: "sometimes" }
    const missingEnvironment = { ...values, NEXT_PUBLIC_ENVIRONMENT: " " }

    expect(envSchema.safeParse(missingApiUrl).success).toBe(false)
    expect(envSchema.safeParse(malformedApiUrl).success).toBe(false)
    expect(envSchema.safeParse(malformedDebug).success).toBe(false)
    expect(envSchema.safeParse(missingEnvironment).success).toBe(false)
  })
})
