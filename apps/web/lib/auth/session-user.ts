export type KarimlaSession = {
  email: string | null
  name: string | null
}

export function toKarimlaSession(payload: unknown): KarimlaSession | null {
  if (!payload || typeof payload !== "object") return null

  const user =
    "user" in payload && payload.user && typeof payload.user === "object" ? payload.user : null
  if (!user) return null

  const email = "email" in user && typeof user.email === "string" ? user.email : null
  if (!email) return null

  const name = "name" in user && typeof user.name === "string" ? user.name : null
  return { email, name }
}
