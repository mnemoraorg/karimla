import { afterEach, describe, expect, it } from "bun:test"

const originalApiUrl = process.env.NEXT_PUBLIC_AUTH_URL
const originalFetch = globalThis.fetch
process.env.NEXT_PUBLIC_AUTH_URL = "https://auth.example/"

const { getSession } = await import("../../../api/auth/session.ts")
const { signOut } = await import("../../../api/auth/sign-out.ts")

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalApiUrl === undefined) delete process.env.NEXT_PUBLIC_AUTH_URL
  else process.env.NEXT_PUBLIC_AUTH_URL = originalApiUrl
})

describe("getSession", () => {
  it("returns the signed-in user with credentials", async () => {
    let request
    globalThis.fetch = async (url, init) => {
      request = { url: String(url), init }
      return new Response(JSON.stringify({ user: { email: "person@example.com" } }), {
        status: 200,
      })
    }

    await expect(getSession()).resolves.toEqual({ email: "person@example.com", name: null })
    expect(request.url).toBe("https://auth.example/api/v1/auth/get-session")
    expect(request.init.credentials).toBe("include")
  })

  it("returns null without a session", async () => {
    globalThis.fetch = async () => new Response(null, { status: 401 })

    await expect(getSession()).resolves.toBeNull()
  })
})

describe("signOut", () => {
  it("posts to the sign-out endpoint with credentials", async () => {
    let request
    globalThis.fetch = async (url, init) => {
      request = { url: String(url), init }
      return new Response(null, { status: 200 })
    }

    await signOut()
    expect(request.url).toBe("https://auth.example/api/v1/auth/sign-out")
    expect(request.init.method).toBe("POST")
    expect(request.init.credentials).toBe("include")
  })

  it("throws a friendly message on failure", async () => {
    globalThis.fetch = async () => new Response(null, { status: 500 })

    await expect(signOut()).rejects.toThrow("We couldn't sign you out. Please try again.")
  })
})
