import { authRequest } from "./client"

export type SignInWithOtpInput = {
  email: string
  otp: string
}

export async function signInWithOtp({ email, otp }: SignInWithOtpInput): Promise<void> {
  if (otp.length !== 6) throw new Error("Enter the six-digit code from your email.")

  const response = await authRequest("/sign-in/email-otp", {
    body: JSON.stringify({ email, name: email, otp }),
    headers: { "content-type": "application/json" },
    method: "POST",
  })

  if (response.ok) return
  if (response.status === 429) throw new Error("Too many attempts. Try again shortly.")

  throw new Error("That code didn't work. Check it and try again.")
}
