import { authRequest } from "./client"

export async function updateUserName(name: string): Promise<void> {
  const fullName = name.trim()
  if (!fullName) throw new Error("Enter your full name.")

  const response = await authRequest("/update-user", {
    body: JSON.stringify({ name: fullName }),
    headers: { "content-type": "application/json" },
    method: "POST",
  })

  if (!response.ok) throw new Error("We couldn't save your name. Please try again.")
}
