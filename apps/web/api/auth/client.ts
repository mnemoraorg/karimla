import { env } from "@/lib/env"

const REQUEST_TIMEOUT_MS = 10_000
const authBaseUrl = env.NEXT_PUBLIC_AUTH_URL_V1.replace(/\/+$/, "")

export const RETRY_AFTER_HEADER = "X-Retry-After"

/** The auth service answers a `429` with the rate-limit window in seconds. */
export function readRetryAfterSeconds(response: Response): number | null {
  const value = response.headers.get(RETRY_AFTER_HEADER)

  if (!value) return null

  const seconds = Number.parseInt(value, 10)

  return Number.isFinite(seconds) && seconds > 0 ? seconds : null
}

/** Carries the server's rate-limit window so the form can count it down. */
export class RateLimitedError extends Error {
  readonly retryAfterSeconds: number | null

  constructor(retryAfterSeconds: number | null = null) {
    super("Too many attempts. Try again shortly.")
    this.name = "RateLimitedError"
    this.retryAfterSeconds = retryAfterSeconds
  }
}

export function authUrl(path: string): string {
  return `${authBaseUrl}/auth${path.startsWith("/") ? path : `/${path}`}`
}

export async function authRequest(path: string, init: RequestInit = {}): Promise<Response> {
  try {
    return await fetch(authUrl(path), {
      ...init,
      credentials: "include",
      signal: init.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    throw new Error("The authentication service is unavailable. Try again shortly.")
  }
}
