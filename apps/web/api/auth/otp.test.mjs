import { afterEach, describe, expect, it } from "bun:test"

const originalAuthUrl = process.env.NEXT_PUBLIC_AUTH_URL
const originalFetch = globalThis.fetch
process.env.NEXT_PUBLIC_AUTH_URL = "https://auth.example/"

const { sendLoginOtp } = await import("./send-otp.ts")
const { signInWithOtp } = await import("./sign-in.ts")

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalAuthUrl === undefined) delete process.env.NEXT_PUBLIC_AUTH_URL
  else process.env.NEXT_PUBLIC_AUTH_URL = originalAuthUrl
})

describe("sendLoginOtp", () => {
  it("normalizes email and posts a sign-in code request with credentials", async () => {
    let request
    globalThis.fetch = async (url, init) => {
      request = { url: String(url), init }
      return new Response(null, { status: 200 })
    }

    await sendLoginOtp(" Person@Example.com ")

    expect(request.url).toBe("https://auth.example/api/v1/auth/email-otp/send-verification-otp")
    expect(request.init.credentials).toBe("include")
    expect(JSON.parse(request.init.body)).toEqual({
      email: "person@example.com",
      type: "sign-in",
    })
  })

  it("surfaces rate limits and rejects blank addresses", async () => {
    globalThis.fetch = async () => new Response(null, { status: 429 })

    await expect(sendLoginOtp("person@example.com")).rejects.toThrow(
      "Too many attempts. Try again shortly.",
    )
    await expect(sendLoginOtp("  ")).rejects.toThrow("Enter your email address.")
  })
})

describe("signInWithOtp", () => {
  it("posts the email and code with credentials", async () => {
    let request
    globalThis.fetch = async (url, init) => {
      request = { url: String(url), init }
      return new Response(null, { status: 200 })
    }

    await signInWithOtp({ email: "person@example.com", otp: "123456" })

    expect(request.url).toBe("https://auth.example/api/v1/auth/sign-in/email-otp")
    expect(request.init.credentials).toBe("include")
    expect(JSON.parse(request.init.body)).toEqual({
      email: "person@example.com",
      name: "person@example.com",
      otp: "123456",
    })
  })

  it("rejects short codes locally and wrong codes from the service", async () => {
    await expect(signInWithOtp({ email: "person@example.com", otp: "123" })).rejects.toThrow(
      "Enter the six-digit code from your email.",
    )

    globalThis.fetch = async () => new Response(null, { status: 400 })

    await expect(signInWithOtp({ email: "person@example.com", otp: "123456" })).rejects.toThrow(
      "That code didn't work. Check it and try again.",
    )
  })
})
