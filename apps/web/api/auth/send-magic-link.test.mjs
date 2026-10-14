import { afterEach, describe, expect, it } from "bun:test"

const originalAuthUrl = process.env.NEXT_PUBLIC_AUTH_URL
const originalFetch = globalThis.fetch
process.env.NEXT_PUBLIC_AUTH_URL = "https://auth.example/"

const { sendMagicLink } = await import("./send-magic-link.ts")

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalAuthUrl === undefined) delete process.env.NEXT_PUBLIC_AUTH_URL
  else process.env.NEXT_PUBLIC_AUTH_URL = originalAuthUrl
})

describe("sendMagicLink", () => {
  it("normalizes email and posts to the auth service with credentials", async () => {
    let request
    globalThis.fetch = async (url, init) => {
      request = { url: String(url), init }
      return new Response(null, { status: 204 })
    }

    await sendMagicLink({ email: " Person@Example.com ", callbackURL: "http://localhost:35000/" })

    expect(request.url).toBe("https://auth.example/api/v1/auth/sign-in/magic-link")
    expect(request.init.credentials).toBe("include")
    expect(JSON.parse(request.init.body)).toEqual({
      email: "person@example.com",
      callbackURL: "http://localhost:35000/",
    })
  })

  it("surfaces rate limits and rejects blank addresses", async () => {
    globalThis.fetch = async () => new Response(null, { status: 429 })

    await expect(
      sendMagicLink({ email: "person@example.com", callbackURL: "http://localhost:35000/" }),
    ).rejects.toThrow("Too many attempts. Try again shortly.")
    await expect(
      sendMagicLink({ email: "  ", callbackURL: "http://localhost:35000/" }),
    ).rejects.toThrow("Enter your email address.")
  })
})
