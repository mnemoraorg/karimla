import { env } from "@/lib/env"

const REQUEST_TIMEOUT_MS = 10_000
const authBaseUrl = env.NEXT_PUBLIC_AUTH_URL_V1.replace(/\/+$/, "")

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
