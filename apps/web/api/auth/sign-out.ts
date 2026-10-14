import { authRequest } from "./client"

export async function signOut(): Promise<void> {
  const response = await authRequest("/sign-out", { method: "POST" })

  if (!response.ok) throw new Error("We couldn't sign you out. Please try again.")
}
