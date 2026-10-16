import { authRequest, RateLimitedError, readRetryAfterSeconds } from "./client"

export async function sendLoginOtp(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail) throw new Error("Enter your email address.")

  const response = await authRequest("/email-otp/send-verification-otp", {
    body: JSON.stringify({ email: normalizedEmail, type: "sign-in" }),
    headers: { "content-type": "application/json" },
    method: "POST",
  })

  if (response.ok) return
  if (response.status === 429) throw new RateLimitedError(readRetryAfterSeconds(response))

  throw new Error("We couldn't send a code. Check your email and try again.")
}
