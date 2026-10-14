import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { toYappiSession, type YappiSession } from "./session-user"

const authBaseUrl = (
  process.env.NEXT_PUBLIC_AUTH_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:35081" : "")
).replace(/\/$/, "")

async function loadSession(): Promise<YappiSession | null> {
  if (!authBaseUrl) return null

  const cookieHeader = (await cookies()).toString()
  if (!cookieHeader) return null

  try {
    const response = await fetch(`${authBaseUrl}/api/v1/auth/get-session`, {
      cache: "no-store",
      headers: { cookie: cookieHeader },
      signal: AbortSignal.timeout(8_000),
    })
    if (!response.ok) return null

    return toYappiSession(await response.json().catch(() => null))
  } catch {
    return null
  }
}

export async function getYappiSession(): Promise<YappiSession | null> {
  return loadSession()
}

export async function requireYappiSession(): Promise<YappiSession> {
  const session = await loadSession()
  if (!session) redirect("/login")
  return session
}
