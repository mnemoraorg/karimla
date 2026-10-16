import { describe, expect, it } from "vitest"
import { betterAuth } from "better-auth"
import { memoryAdapter } from "better-auth/adapters/memory"
import { emailOTP } from "better-auth/plugins"

import { rateLimit, signInEmailOtpLimit } from "../../config/rate-limit"

const authOrigin = "http://localhost:35081"

function createAuth(onSendOtp: (otp: string) => void) {
  return betterAuth({
    appName: "Yappi",
    baseURL: authOrigin,
    basePath: "/api/v1/auth",
    secret: "test-secret-that-is-at-least-32-characters-long",
    database: memoryAdapter({ user: [], session: [], account: [], verification: [] }),
    emailAndPassword: { enabled: false },
    // BetterAuth only rate limits in production, so the policy applies here only
    // with it switched on. The rules are the ones the service ships.
    rateLimit: { customRules: rateLimit.customRules, enabled: true },
    plugins: [
      emailOTP({
        disableSignUp: false,
        sendVerificationOnSignUp: true,
        storeOTP: "hashed",
        rateLimit: rateLimit.emailOtpSend,
        sendVerificationOTP: async ({ otp }) => onSendOtp(otp),
      }),
    ],
  })
}

/**
 * The rate limiter counts per client IP and path in process-wide memory, so each
 * test claims its own address instead of sharing one bucket.
 */
function requestCode(ip: string, email: string): Request {
  return new Request(`${authOrigin}/api/v1/auth/email-otp/send-verification-otp`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({ email, type: "sign-in" }),
  })
}

function submitCode(ip: string, email: string, otp: string): Request {
  return new Request(`${authOrigin}/api/v1/auth/sign-in/email-otp`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({ email, name: email, otp }),
  })
}

describe("email OTP sign-in", () => {
  it("creates a user and session from a one-time email code", async () => {
    let sentOtp = ""
    const auth = createAuth((otp) => {
      sentOtp = otp
    })

    const requestCodeResponse = await auth.handler(requestCode("203.0.113.6", "new@example.com"))

    expect(requestCodeResponse.status).toBe(200)
    expect(sentOtp).toMatch(/^\d{6}$/)

    const signIn = await auth.handler(submitCode("203.0.113.6", "new@example.com", sentOtp))
    const session = await signIn.json()

    expect(signIn.status).toBe(200)
    expect(session.user.email).toBe("new@example.com")
    expect(typeof session.user.id).toBe("string")
    expect(signIn.headers.get("set-cookie")).toContain("better-auth.session_token")
  })
})

describe("email OTP rate limits", () => {
  it("spends the minute on sending a code, not on checking one", async () => {
    const ip = "203.0.113.7"
    const email = "typo@example.com"
    let sentOtp = ""
    const auth = createAuth((otp) => {
      sentOtp = otp
    })

    expect((await auth.handler(requestCode(ip, email))).status).toBe(200)

    const resend = await auth.handler(requestCode(ip, email))

    expect(resend.status).toBe(429)
    expect(Number(resend.headers.get("x-retry-after"))).toBeGreaterThan(0)

    // A wrong code, so every attempt is judged by the code and not by the clock.
    const wrongOtp = sentOtp === "000000" ? "000001" : "000000"
    const attempts: number[] = []
    for (let index = 0; index <= signInEmailOtpLimit.max; index += 1) {
      attempts.push((await auth.handler(submitCode(ip, email, wrongOtp))).status)
    }

    expect(attempts.slice(0, signInEmailOtpLimit.max)).not.toContain(429)
    expect(attempts[signInEmailOtpLimit.max]).toBe(429)
  })
})
