import { describe, expect, it } from "vitest"
import { betterAuth } from "better-auth"
import { memoryAdapter } from "better-auth/adapters/memory"
import { emailOTP } from "better-auth/plugins"

const authOrigin = "http://localhost:35081"

describe("email OTP sign-in", () => {
  it("creates a user and session from a one-time email code", async () => {
    let sentOtp = ""
    const auth = betterAuth({
      appName: "Karimla",
      baseURL: authOrigin,
      basePath: "/api/v1/auth",
      secret: "test-secret-that-is-at-least-32-characters-long",
      database: memoryAdapter({ user: [], session: [], account: [], verification: [] }),
      emailAndPassword: { enabled: false },
      plugins: [
        emailOTP({
          disableSignUp: false,
          sendVerificationOnSignUp: true,
          storeOTP: "hashed",
          sendVerificationOTP: async ({ otp }) => {
            sentOtp = otp
          },
        }),
      ],
    })

    const requestCode = await auth.handler(
      new Request(`${authOrigin}/api/v1/auth/email-otp/send-verification-otp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "new@example.com", type: "sign-in" }),
      }),
    )

    expect(requestCode.status).toBe(200)
    expect(sentOtp).toMatch(/^\d{6}$/)

    const signIn = await auth.handler(
      new Request(`${authOrigin}/api/v1/auth/sign-in/email-otp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "new@example.com", name: "new@example.com", otp: sentOtp }),
      }),
    )
    const session = await signIn.json()

    expect(signIn.status).toBe(200)
    expect(session.user.email).toBe("new@example.com")
    expect(typeof session.user.id).toBe("string")
    expect(signIn.headers.get("set-cookie")).toContain("better-auth.session_token")
  })
})
