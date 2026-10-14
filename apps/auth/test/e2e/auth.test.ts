import { describe, expect, it } from "vitest"
import { betterAuth } from "better-auth"
import { memoryAdapter } from "better-auth/adapters/memory"
import { magicLink } from "better-auth/plugins"

const authOrigin = "http://localhost:35081"
const appOrigin = "http://localhost:35000"

describe("magic-link sign-in", () => {
  it("creates a user and session from a one-time email link", async () => {
    let sentUrl = ""
    const auth = betterAuth({
      appName: "Karimla",
      baseURL: authOrigin,
      basePath: "/api/v1/auth",
      secret: "test-secret-that-is-at-least-32-characters-long",
      trustedOrigins: [appOrigin],
      database: memoryAdapter({ user: [], session: [], account: [], verification: [] }),
      emailAndPassword: { enabled: false },
      plugins: [
        magicLink({
          disableSignUp: false,
          sendMagicLink: async ({ url }) => {
            sentUrl = url
          },
        }),
      ],
    })

    const requestLink = await auth.handler(
      new Request(`${authOrigin}/api/v1/auth/sign-in/magic-link`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "new@example.com", callbackURL: appOrigin }),
      }),
    )

    expect(requestLink.status).toBe(200)
    expect(sentUrl).toContain("/api/v1/auth/magic-link/verify?")

    const verifyLink = await auth.handler(new Request(sentUrl))

    expect(verifyLink.status).toBe(302)
    expect(new URL(verifyLink.headers.get("location")!).origin).toBe(appOrigin)
    expect(verifyLink.headers.get("set-cookie")).toContain("better-auth.session_token")
  })
})
