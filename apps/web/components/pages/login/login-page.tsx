"use client"

import type * as React from "react"

import { Button } from "@packages/ui-w/shared/button/button"
import { Input } from "@packages/ui-w/shared/input/input"

export function LoginPage(): React.ReactElement {
  function handleEmailSubmit(event: React.SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault()
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-center py-6">
        <p className="text-sm font-medium">Karimla by Mnemora</p>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="flex w-full max-w-xs flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-xl font-semibold">Did someone just say karimla?</h1>
            <p className="text-muted-foreground text-sm">
              Log in to count every chilly outburst with your friends
            </p>
          </div>

          <form className="flex w-full flex-col gap-4" onSubmit={handleEmailSubmit}>
            <Input
              aria-label="Email"
              autoComplete="email"
              className="w-full"
              id="email"
              name="email"
              nativeInput
              placeholder="Enter your email"
              required
              size="lg"
              spellCheck={false}
              type="email"
            />
            <Button className="w-full" type="submit">
              Continue with Email
            </Button>
          </form>

          <p className="text-muted-foreground text-sm">
            Don&apos;t have an account?{" "}
            <a className="text-primary" href="#">
              Sign up
            </a>
          </p>
        </div>
      </div>

      <footer className="text-muted-foreground flex items-center justify-center gap-6 py-6 text-sm">
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">Cookies</a>
      </footer>
    </div>
  )
}
