import { describe, expect, it, vi } from "vitest"

import type { CorsConfig } from "../../config/_types"
import { createApp } from "../../src/http"

const corsConfig: CorsConfig = {
  allowedOrigins: ["http://localhost:35000"],
  allowedHeaders: ["Content-Type", "Authorization"],
  allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  exposeHeaders: ["X-Retry-After"],
}

describe("auth HTTP app", () => {
  it("serves health without touching BetterAuth", async () => {
    const handler = vi.fn(() => new Response())
    const response = await createApp(handler, corsConfig).request("/health")

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: "UP" })
    expect(handler).not.toHaveBeenCalled()
  })

  it("delegates BetterAuth paths unchanged", async () => {
    const handler = vi.fn((request: Request) =>
      Response.json({ path: new URL(request.url).pathname }),
    )
    const response = await createApp(handler, corsConfig).request(
      "/api/v1/auth/email-otp/send-verification-otp",
      { method: "POST" },
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ path: "/api/v1/auth/email-otp/send-verification-otp" })
    expect(handler).toHaveBeenCalledOnce()
  })

  it("allows credentialed CORS only for configured origins", async () => {
    const app = createApp(() => Response.json({ ok: true }), corsConfig)
    const allowed = await app.request("/health", {
      headers: { Origin: "http://localhost:35000" },
    })
    const blocked = await app.request("/health", {
      headers: { Origin: "https://untrusted.example" },
    })

    expect(allowed.headers.get("access-control-allow-origin")).toBe("http://localhost:35000")
    expect(allowed.headers.get("access-control-allow-credentials")).toBe("true")
    expect(allowed.headers.get("access-control-expose-headers")).toBe("X-Retry-After")
    expect(blocked.headers.get("access-control-allow-origin")).toBeNull()
  })

  it("keeps the rate-limit retry window readable from the web origin", async () => {
    const handler = () =>
      new Response(JSON.stringify({ message: "Too many requests. Please try again later." }), {
        headers: { "X-Retry-After": "42" },
        status: 429,
      })
    const response = await createApp(handler, corsConfig).request(
      "/api/v1/auth/email-otp/send-verification-otp",
      { headers: { Origin: "http://localhost:35000" }, method: "POST" },
    )

    expect(response.status).toBe(429)
    expect(response.headers.get("x-retry-after")).toBe("42")
    expect(response.headers.get("access-control-expose-headers")).toBe("X-Retry-After")
  })
})
