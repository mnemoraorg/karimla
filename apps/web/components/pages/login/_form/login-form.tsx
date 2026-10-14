"use client"

import { useState } from "react"
import type * as React from "react"

import { Button } from "@packages/ui-w/shared/button/button"
import { LoginField } from "@/components/pages/login/_fields/login-field"
import { useSendMagicLink } from "@/hooks/api/auth/use-send-magic-link"

export function LoginForm(): React.ReactElement {
  const sendMagicLink = useSendMagicLink()
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    setMessage("")
    setError("")
    sendMagicLink.reset()

    const email = new FormData(event.currentTarget).get("email")
    if (typeof email !== "string") {
      setError("Enter your email address.")
      return
    }

    sendMagicLink.mutate(
      {
        email,
        callbackURL: new URL("/", window.location.origin).toString(),
      },
      {
        onSuccess: () => setMessage("Check your email for a sign-in link."),
        onError: (requestError) => setError(requestError.message),
      },
    )
  }

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleEmailSubmit}>
      <LoginField />
      <Button className="w-full" disabled={sendMagicLink.isPending} type="submit">
        {sendMagicLink.isPending ? "Sending link…" : "Send sign-in link"}
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
