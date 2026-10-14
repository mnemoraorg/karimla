"use client"

import { useEffect, useState } from "react"
import type * as React from "react"

import { useSendLoginOtp } from "@/hooks/api/auth/use-send-otp"
import { useSignInWithOtp } from "@/hooks/api/auth/use-sign-in"

import { Button } from "@packages/ui-w/shared/button/button"
import { LoginField } from "@/components/pages/login/_fields/login-field"
import { OtpField } from "@/components/pages/login/_fields/otp-field"

type LoginStep = "email" | "code"

const PENDING_EMAIL_KEY = "karimla.pending-email"

function readPendingEmail(): string | null {
  if (new URLSearchParams(window.location.search).get("step") !== "verify") return null

  const email = window.sessionStorage.getItem(PENDING_EMAIL_KEY)
  return email ? email : null
}

function showVerifyStep(): void {
  window.history.replaceState(null, "", "?step=verify")
}

function showEmailStep(): void {
  window.history.replaceState(null, "", window.location.pathname)
}

export function LoginForm(): React.ReactElement {
  const sendOtp = useSendLoginOtp()
  const signIn = useSignInWithOtp()
  const [step, setStep] = useState<LoginStep>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const pendingEmail = readPendingEmail()
    if (pendingEmail) {
      setEmail(pendingEmail)
      setStep("code")
    }
  }, [])

  function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    setError("")
    signIn.reset()

    const address = new FormData(event.currentTarget).get("email")
    if (typeof address !== "string" || !address.trim()) {
      setError("Enter your email address.")
      return
    }

    sendOtp.mutate(address, {
      onSuccess: () => {
        const normalizedEmail = address.trim().toLowerCase()
        window.sessionStorage.setItem(PENDING_EMAIL_KEY, normalizedEmail)
        showVerifyStep()
        setEmail(normalizedEmail)
        setOtp("")
        setStep("code")
      },
      onError: (requestError) => setError(requestError.message),
    })
  }

  function handleOtpSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (otp.length !== 6) return

    signIn.mutate(
      { email, otp },
      {
        onSuccess: () => {
          window.sessionStorage.removeItem(PENDING_EMAIL_KEY)
          window.location.replace("/")
        },
        onError: (requestError) => setError(requestError.message),
      },
    )
  }

  function handleResendCode(): void {
    if (sendOtp.isPending || signIn.isPending) return
    setError("")
    sendOtp.mutate(email, {
      onError: (requestError) => setError(requestError.message),
    })
  }

  function useDifferentEmail(): void {
    sendOtp.reset()
    signIn.reset()
    window.sessionStorage.removeItem(PENDING_EMAIL_KEY)
    showEmailStep()
    setError("")
    setOtp("")
    setStep("email")
  }

  if (step === "code") {
    return (
      <div className="flex w-full flex-col gap-4">
        <p className="text-muted-foreground text-center text-sm">
          We sent a 6-digit code to <span className="text-foreground">{email}</span>.
        </p>
        <form className="flex w-full flex-col gap-4" onSubmit={handleOtpSubmit}>
          <OtpField disabled={signIn.isPending} onChange={setOtp} value={otp} />
          <Button className="w-full" disabled={otp.length !== 6 || signIn.isPending} type="submit">
            {signIn.isPending ? "Verifying…" : "Verify and continue"}
          </Button>
        </form>
        {error && (
          <p className="text-destructive text-center text-sm" role="alert">
            {error}
          </p>
        )}
        <div className="flex items-center justify-center gap-4 text-sm">
          <button
            className="text-muted-foreground hover:text-foreground"
            disabled={sendOtp.isPending || signIn.isPending}
            onClick={handleResendCode}
            type="button"
          >
            {sendOtp.isPending ? "Sending…" : "Resend code"}
          </button>
          <button
            className="text-muted-foreground hover:text-foreground"
            onClick={useDifferentEmail}
            type="button"
          >
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleEmailSubmit}>
      <LoginField />
      <Button className="w-full" disabled={sendOtp.isPending} type="submit">
        {sendOtp.isPending ? "Sending code…" : "Send code"}
      </Button>
      {error && (
        <p className="text-destructive text-center text-sm" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
