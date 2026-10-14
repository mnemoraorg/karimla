const REQUEST_TIMEOUT_MS = 10_000

const authBaseUrl =
  process.env.NEXT_PUBLIC_AUTH_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:35081" : undefined)

export function authUrl(path: string): string {
  if (!authBaseUrl) throw new Error("The authentication service is unavailable.")

  return `${authBaseUrl.replace(/\/$/, "")}/api/v1/auth${path.startsWith("/") ? path : `/${path}`}`
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
