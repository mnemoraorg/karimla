import { describe, expect, it } from "bun:test"

const { toKarimlaSession } = await import("./session-user.ts")

describe("toKarimlaSession", () => {
  it("returns the email and name from a session payload", () => {
    expect(toKarimlaSession({ user: { email: "person@example.com", name: "Person" } })).toEqual({
      email: "person@example.com",
      name: "Person",
    })
  })

  it("returns null without a usable email", () => {
    expect(toKarimlaSession(null)).toBeNull()
    expect(toKarimlaSession({})).toBeNull()
    expect(toKarimlaSession({ user: { email: 42 } })).toBeNull()
    expect(toKarimlaSession({ user: { email: "person@example.com" } })).toEqual({
      email: "person@example.com",
      name: null,
    })
  })
})
