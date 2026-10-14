import { authRequest } from "./client"

export type SendMagicLinkInput = {
  email: string
  callbackURL: string
}

export async function sendMagicLink({ email, callbackURL }: SendMagicLinkInput): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail) throw new Error("Enter your email address.")

  const response = await authRequest("/sign-in/magic-link", {
    body: JSON.stringify({ email: normalizedEmail, callbackURL }),
    headers: { "content-type": "application/json" },
    method: "POST",
  })

  if (response.ok) return
  if (response.status === 429) throw new Error("Too many attempts. Try again shortly.")

  throw new Error("We couldn't send a sign-in link. Check your email and try again.")
}
