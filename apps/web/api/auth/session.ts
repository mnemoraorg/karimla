import { authRequest } from "./client"
import { toYappiSession, type YappiSession } from "@/lib/auth/session-user"

export async function getSession(): Promise<YappiSession | null> {
  const response = await authRequest("/get-session")

  if (!response.ok) return null
  return toYappiSession(await response.json().catch(() => null))
}
