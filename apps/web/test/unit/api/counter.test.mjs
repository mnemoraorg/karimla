import { afterEach, describe, expect, it } from "bun:test"

const originalApiUrl = process.env.NEXT_PUBLIC_API_URL
const originalFetch = globalThis.fetch
process.env.NEXT_PUBLIC_API_URL = "https://api.example/"

const { getCounter, incrementCounter } = await import("../../../api/counter.ts")

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalApiUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL
  else process.env.NEXT_PUBLIC_API_URL = originalApiUrl
})

function envelope(data, status = 200) {
  return new Response(JSON.stringify({ success: true, message: "ok", data }), { status })
}

describe("getCounter", () => {
  it("unwraps the count from the envelope with credentials", async () => {
    let request
    globalThis.fetch = async (url, init) => {
      request = { url: String(url), init }
      return envelope({ count: 41 })
    }

    await expect(getCounter()).resolves.toBe(41)
    expect(request.url).toBe("https://api.example/api/v1/counter")
    expect(request.init.credentials).toBe("include")
  })

  it("throws the service message on failure", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ success: false, message: "Unauthorized", data: null }), {
        status: 401,
      })

    await expect(getCounter()).rejects.toThrow("Unauthorized")
  })
})

describe("incrementCounter", () => {
  it("posts to the increment endpoint and returns the new count", async () => {
    let request
    globalThis.fetch = async (url, init) => {
      request = { url: String(url), init }
      return envelope({ count: 42 })
    }

    await expect(incrementCounter()).resolves.toBe(42)
    expect(request.url).toBe("https://api.example/api/v1/counter/increment")
    expect(request.init.method).toBe("POST")
  })
})
