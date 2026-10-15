import { afterEach, describe, expect, it } from "bun:test"

const originalApiUrl = process.env.NEXT_PUBLIC_API_URL
const originalFetch = globalThis.fetch
process.env.NEXT_PUBLIC_API_URL = "https://api.example/"

const { listGroups, createGroup, joinGroup, getGroup, incrementMember, decrementMember } =
  await import("../../../api/groups.ts")

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalApiUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL
  else process.env.NEXT_PUBLIC_API_URL = originalApiUrl
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
})
