import { describe, expect, it } from "bun:test"

const { toYappiSession } = await import("../../../lib/auth/session-user.ts")

describe("toYappiSession", () => {
  it("returns the email and name from a session payload", () => {
    expect(toYappiSession({ user: { email: "person@example.com", name: "Person" } })).toEqual({
      email: "person@example.com",
      name: "Person",
    })
  })

  it("returns null without a usable email", () => {
    expect(toYappiSession(null)).toBeNull()
    expect(toYappiSession({})).toBeNull()
    expect(toYappiSession({ user: { email: 42 } })).toBeNull()
    expect(toYappiSession({ user: { email: "person@example.com" } })).toEqual({
      email: "person@example.com",
      name: null,
    })
  })
})
