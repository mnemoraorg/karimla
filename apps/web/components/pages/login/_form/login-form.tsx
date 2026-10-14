"use client"

import { useState } from "react"
import type * as React from "react"

import { Button } from "@packages/ui-w/shared/button/button"
import { LoginField } from "@/components/pages/login/_fields/login-field"

export function LoginForm(): React.ReactElement {
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setMessage("")
    setError("")
    setIsSubmitting(true)

    try {
      const email = new FormData(event.currentTarget).get("email")
      const authUrl =
        process.env.NEXT_PUBLIC_AUTH_URL ??
        (process.env.NODE_ENV === "development" ? "http://localhost:35081" : undefined)

      if (typeof email !== "string" || !authUrl) throw new Error("Invalid sign-in request")

      const response = await fetch(`${authUrl}/api/v1/auth/sign-in/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          callbackURL: new URL("/", window.location.origin).toString(),
        }),
      })

      if (!response.ok) throw new Error("Could not send sign-in link")
      setMessage("Check your email for a sign-in link.")
    } catch {
      setError("We couldn’t send your sign-in link. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleEmailSubmit}>
      <LoginField />
      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Sending link…" : "Send sign-in link"}
      </Button>
      {message && (
        <p className="text-muted-foreground text-center text-sm" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="text-destructive text-center text-sm" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
