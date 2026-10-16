import { describe, expect, it } from "bun:test"

const {
  cooldownDeadlineFromSeconds,
  cooldownRemainingMs,
  RESEND_COOLDOWN_MS,
  RESEND_COOLDOWN_SECONDS,
} = await import("../../../lib/login.ts")

describe("resend cooldown", () => {
  it("falls back to the known 60s window when the service reports none", () => {
    expect(cooldownDeadlineFromSeconds(null, 1_000)).toBe(1_000 + RESEND_COOLDOWN_MS)
    expect(cooldownDeadlineFromSeconds(undefined, 1_000)).toBe(1_000 + RESEND_COOLDOWN_MS)
    expect(RESEND_COOLDOWN_SECONDS).toBe(60)
    expect(RESEND_COOLDOWN_MS).toBe(60_000)
  })

  it("uses the window the service reported", () => {
    expect(cooldownDeadlineFromSeconds(42, 1_000)).toBe(1_000 + 42_000)
  })

  it("reports remaining time and floors at zero", () => {
    expect(cooldownRemainingMs(61_000, 1_000)).toBe(60_000)
    expect(cooldownRemainingMs(1_000, 61_000)).toBe(0)
  })
})
