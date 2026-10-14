import { describe, expect, it } from "bun:test"

const { cooldownDeadlineFromNow, cooldownRemainingMs, RESEND_COOLDOWN_MS } =
  await import("../../../lib/login.ts")

describe("resend cooldown", () => {
  it("sets the deadline 60s out", () => {
    expect(cooldownDeadlineFromNow(1_000)).toBe(1_000 + RESEND_COOLDOWN_MS)
    expect(RESEND_COOLDOWN_MS).toBe(60_000)
  })

  it("reports remaining time and floors at zero", () => {
    expect(cooldownRemainingMs(61_000, 1_000)).toBe(60_000)
    expect(cooldownRemainingMs(1_000, 61_000)).toBe(0)
  })
})
