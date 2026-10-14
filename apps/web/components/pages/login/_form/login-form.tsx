"use client"

import type * as React from "react"

import { Button } from "@packages/ui-w/shared/button/button"
import { LoginField } from "@/components/pages/login/_fields/login-field"

export function LoginForm(): React.ReactElement {
  function handleEmailSubmit(event: React.SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault()
  }

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleEmailSubmit}>
      <LoginField />
      <Button className="w-full" type="submit">
        Continue with Email
      </Button>
    </form>
  )
}
