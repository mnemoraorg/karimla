const REQUEST_TIMEOUT_MS = 10_000

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:35080" : undefined)

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export function apiUrl(path: string): string {
  if (!apiBaseUrl) throw new Error("The API is unavailable.")

  return `${apiBaseUrl.replace(/\/$/, "")}/api/v1${path.startsWith("/") ? path : `/${path}`}`
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    const headers = new Headers(init.headers)
    if (init.body && !headers.has("content-type")) {
      headers.set("content-type", "application/json")
    }
    response = await fetch(apiUrl(path), {
      ...init,
      credentials: "include",
      headers,
      signal: init.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    throw new Error("The API is unavailable. Try again shortly.")
  }

  const envelope = (await response.json().catch(() => null)) as ApiEnvelope<T> | null
  if (!response.ok || !envelope || !envelope.success) {
    throw new ApiError(response.status, envelope?.message ?? "The request could not be completed.")
  }
  return envelope.data
}
