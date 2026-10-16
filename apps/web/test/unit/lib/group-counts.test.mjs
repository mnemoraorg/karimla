import { describe, expect, it } from "bun:test"

const { withMemberCountAdjusted } = await import("../../../lib/group-counts.ts")

const detail = {
  group: { id: "g1", name: "Crew", phrase: "karimla", invite_code: "ABCDEFGH" },
  members: [
    { user_id: "u1", display_name: "User One", count: 3, you: true },
    { user_id: "u2", display_name: "User Two", count: 0, you: false },
  ],
}

describe("withMemberCountAdjusted", () => {
  it("applies the tap to the right member and leaves the rest alone", () => {
    const next = withMemberCountAdjusted(detail, "u1", 1)

    expect(next?.members.find((member) => member.user_id === "u1")?.count).toBe(4)
    expect(next?.members.find((member) => member.user_id === "u2")?.count).toBe(0)
    expect(detail.members.find((member) => member.user_id === "u1")?.count).toBe(3)
  })

  it("floors a decrement at zero like the service", () => {
    const next = withMemberCountAdjusted(detail, "u2", -1)

    expect(next?.members.find((member) => member.user_id === "u2")?.count).toBe(0)
  })

  it("passes through missing data and unknown members", () => {
    expect(withMemberCountAdjusted(undefined, "u1", 1)).toBeUndefined()

    const next = withMemberCountAdjusted(detail, "nobody", 1)

    expect(next?.members.map((member) => member.count)).toEqual([3, 0])
  })
})
