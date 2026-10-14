import { authRequest } from "./client"
import { toKarimlaSession, type KarimlaSession } from "@/lib/auth/session-user"

export async function getSession(): Promise<KarimlaSession | null> {
  const response = await authRequest("/get-session")

  if (!response.ok) return null
  return toKarimlaSession(await response.json().catch(() => null))
}
