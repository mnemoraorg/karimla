import { afterEach, describe, expect, it } from "bun:test"

import { setTestEnv } from "../env-test-setup.mjs"

const restoreEnv = setTestEnv()
const originalFetch = globalThis.fetch

const {
  listGroups,
  createGroup,
  joinGroup,
  getGroup,
  sendGroupInvitations,
  incrementMember,
  decrementMember,
} = await import("../../../api/groups.ts")

afterEach(() => {
  globalThis.fetch = originalFetch
  restoreEnv()
})

function envelope(data, status = 200) {
  return new Response(JSON.stringify({ success: true, message: "ok", data }), { status })
}

describe("listGroups", () => {
  it("gets the caller's groups with credentials", async () => {
    let request
    globalThis.fetch = async (url, init) => {
      request = { url: String(url), init }
      return envelope([
        {
          id: "g1",
          name: "Crew",
          phrase: "karimla",
          invite_code: "ABCDEFGH",
          member_count: 1,
          members: [{ user_id: "u1", display_name: "User One", you: true }],
        },
      ])
    }

    await expect(listGroups()).resolves.toMatchObject([
      { id: "g1", member_count: 1, members: [{ user_id: "u1", you: true }] },
    ])
    expect(request.url).toBe("https://api.example/api/v1/groups")
    expect(request.init.credentials).toBe("include")
  })
})

describe("createGroup", () => {
  it("trims and posts the group", async () => {
    let request
    globalThis.fetch = async (url, init) => {
      request = { url: String(url), init }
      return envelope({ id: "g1", name: "Crew", phrase: "karimla", invite_code: "ABCDEFGH" })
    }

    await expect(createGroup({ name: " Crew ", phrase: " karimla " })).resolves.toMatchObject({
      id: "g1",
    })
    expect(request.url).toBe("https://api.example/api/v1/groups")
    expect(JSON.parse(request.init.body)).toEqual({ name: "Crew", phrase: "karimla" })
  })

  it("rejects blank names without a request", async () => {
    globalThis.fetch = async () => {
      throw new Error("fetch should not run")
    }

    await expect(createGroup({ name: "  ", phrase: "karimla" })).rejects.toThrow(
      "Give your group a name and a phrase to count.",
    )
  })
})

describe("joinGroup", () => {
  it("normalizes the code to uppercase", async () => {
    let request
    globalThis.fetch = async (url, init) => {
      request = { url: String(url), init }
      return envelope({ id: "g1" })
    }

    await joinGroup(" abcdefgh ")
    expect(request.url).toBe("https://api.example/api/v1/groups/join")
    expect(JSON.parse(request.init.body)).toEqual({ code: "ABCDEFGH" })
  })

  it("surfaces unknown codes", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ success: false, message: "Not found", data: null }), {
        status: 404,
      })

    await expect(joinGroup("ZZZZ9999")).rejects.toThrow("Not found")
  })
})

describe("group invitations", () => {
  it("posts all recipient emails with credentials", async () => {
    let request
    globalThis.fetch = async (url, init) => {
      request = { url: String(url), init }
      return envelope({ sent_count: 2 })
    }

    await expect(sendGroupInvitations("g1", ["one@example.com", "two@example.com"])).resolves.toBe(
      2,
    )
    expect(request.url).toBe("https://api.example/api/v1/groups/g1/invitations")
    expect(request.init.method).toBe("POST")
    expect(request.init.credentials).toBe("include")
    expect(JSON.parse(request.init.body)).toEqual({
      emails: ["one@example.com", "two@example.com"],
    })
  })

  it("rejects an empty or oversized recipient list without a request", async () => {
    globalThis.fetch = async () => {
      throw new Error("fetch should not run")
    }

    await expect(sendGroupInvitations("g1", [])).rejects.toThrow("Enter up to 10 email addresses")
    await expect(sendGroupInvitations("g1", Array(11).fill("person@example.com"))).rejects.toThrow(
      "Enter up to 10 email addresses",
    )
  })
})

describe("member counting", () => {
  it("posts increment and decrement with credentials", async () => {
    const seen = []
    globalThis.fetch = async (url, init) => {
      seen.push({ url: String(url), init })
      return envelope({ count: 1 })
    }

    await expect(incrementMember("g1", "u1")).resolves.toBe(1)
    await expect(decrementMember("g1", "u1")).resolves.toBe(1)
    expect(seen.map((request) => request.url)).toEqual([
      "https://api.example/api/v1/groups/g1/members/u1/increment",
      "https://api.example/api/v1/groups/g1/members/u1/decrement",
    ])
    for (const request of seen) {
      expect(request.init.method).toBe("POST")
      expect(request.init.credentials).toBe("include")
    }
  })

  it("reads group detail", async () => {
    globalThis.fetch = async () =>
      envelope({ group: { id: "g1" }, members: [{ user_id: "u1", count: 3, you: true }] })

    await expect(getGroup("g1")).resolves.toMatchObject({
      group: { id: "g1" },
      members: [{ user_id: "u1", count: 3, you: true }],
    })
  })

  it("maps transport failures to actionable copy and keeps server messages", async () => {
    globalThis.fetch = async () => {
      throw new TypeError("fetch failed")
    }

    await expect(incrementMember("g1", "u1")).rejects.toThrow(
      "Couldn't reach the counter. Check your connection and try again.",
    )

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          success: false,
          message: "Authentication service temporarily unavailable",
          data: null,
        }),
        { status: 503 },
      )

    await expect(decrementMember("g1", "u1")).rejects.toThrow(
      "The counter service is having trouble. Try again in a moment.",
    )

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ success: false, message: "Could not count", data: null }), {
        status: 400,
      })

    await expect(incrementMember("g1", "u1")).rejects.toThrow("Could not count")
  })
})
