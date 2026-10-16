"use client"

import { useEffect, useState } from "react"
import type * as React from "react"

import { RateLimitedError } from "@/api/auth/client"
import { useSendLoginOtp } from "@/hooks/api/auth/use-send-otp"
import { useSignInWithOtp } from "@/hooks/api/auth/use-sign-in"
import {
  cooldownDeadlineFromSeconds,
  cooldownRemainingMs,
  PENDING_LOGIN_EMAIL_KEY,
  RESEND_DEADLINE_KEY,
} from "@/lib/login"

import { Button } from "@packages/ui-w/shared/button/button"
import { LoginField } from "@/components/pages/login/_field/login-field"
import { OtpField } from "@/components/pages/login/_field/otp-field"

type LoginStep = "email" | "code"

function readPendingEmail(): string | null {
  if (new URLSearchParams(window.location.search).get("step") !== "verify") return null

  const email = window.sessionStorage.getItem(PENDING_LOGIN_EMAIL_KEY)
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
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [resendUntil, setResendUntil] = useState(0)
  const [verifyUntil, setVerifyUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const resendMs = cooldownRemainingMs(resendUntil, now)
  const verifyMs = cooldownRemainingMs(verifyUntil, now)

  useEffect(() => {
    setResendUntil(Number(window.localStorage.getItem(RESEND_DEADLINE_KEY)) || 0)

    const pendingEmail = readPendingEmail()
    if (pendingEmail) {
      setEmail(pendingEmail)
      setStep("code")
    }
  }, [])

  useEffect(() => {
    if (resendUntil <= now && verifyUntil <= now) return

    const timeout = window.setTimeout(() => setNow(Date.now()), 1000)
    return () => window.clearTimeout(timeout)
  }, [resendUntil, verifyUntil, now])

  function armResendCooldown(retryAfterSeconds: number | null = null): void {
    const until = cooldownDeadlineFromSeconds(retryAfterSeconds)
    window.localStorage.setItem(RESEND_DEADLINE_KEY, String(until))
    setNow(Date.now())
    setResendUntil(until)
  }

  function armVerifyCooldown(retryAfterSeconds: number | null = null): void {
    setNow(Date.now())
    setVerifyUntil(cooldownDeadlineFromSeconds(retryAfterSeconds))
  }

  function handleResendError(requestError: Error): void {
    if (requestError instanceof RateLimitedError) {
      armResendCooldown(requestError.retryAfterSeconds)
      return
    }

    setError(requestError.message)
  }

  function handleVerifyError(requestError: Error): void {
    if (requestError instanceof RateLimitedError) {
      armVerifyCooldown(requestError.retryAfterSeconds)
      return
    }

    setError(requestError.message)
  }

  function clearPendingEmail(): void {
    window.sessionStorage.removeItem(PENDING_LOGIN_EMAIL_KEY)
  }

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
        window.sessionStorage.setItem(PENDING_LOGIN_EMAIL_KEY, normalizedEmail)
        showVerifyStep()
        armResendCooldown()
        setEmail(normalizedEmail)
        setOtp("")
        setStep("code")
      },
      onError: handleResendError,
    })
  }

  function handleOtpSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (otp.length !== 6 || verifyMs > 0) return

    signIn.mutate(
      { email, otp },
      {
        onSuccess: () => {
          clearPendingEmail()
          setIsRedirecting(true)
          window.location.replace("/")
        },
        onError: handleVerifyError,
      },
    )
  }

  const isVerifying = signIn.isPending || isRedirecting

  function handleResendCode(): void {
    if (resendMs > 0 || sendOtp.isPending || isVerifying) return
    setError("")
    sendOtp.mutate(email, {
      onSuccess: () => armResendCooldown(),
      onError: handleResendError,
    })
  }

  function useDifferentEmail(): void {
    // The resend and verify windows are per-IP limits on the service, so they
    // keep counting down for the next address too.
    sendOtp.reset()
    signIn.reset()
    clearPendingEmail()
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
          <OtpField disabled={isVerifying || verifyMs > 0} onChange={setOtp} value={otp} />
          <Button
            className="w-full"
            disabled={otp.length !== 6 || isVerifying || verifyMs > 0}
            type="submit"
          >
            {isVerifying ? "Verifying…" : "Verify and continue"}
          </Button>
        </form>
        {verifyMs > 0 && (
          <p className="text-muted-foreground text-center text-sm" role="status">
            Too many attempts. Try again in{" "}
            <span className="text-foreground tabular-nums">{Math.ceil(verifyMs / 1000)}s</span>.
          </p>
        )}
        {error && (
          <p className="text-destructive text-center text-sm" role="alert">
            {error}
          </p>
        )}
        <div className="flex items-center justify-center gap-4 text-sm">
          {resendMs > 0 ? (
            <span className="text-muted-foreground" role="status">
              Resend in{" "}
              <span className="text-foreground tabular-nums">{Math.ceil(resendMs / 1000)}s</span>
            </span>
          ) : (
            <Button
              disabled={sendOtp.isPending || isVerifying}
              size="sm"
              variant="link"
              onClick={handleResendCode}
              type="button"
            >
              {sendOtp.isPending ? "Sending…" : "Resend code"}
            </Button>
          )}
          <Button size="sm" variant="link" onClick={useDifferentEmail} type="button">
            Use a different email
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleEmailSubmit}>
      <LoginField />
      <Button className="w-full" disabled={sendOtp.isPending || resendMs > 0} type="submit">
        {sendOtp.isPending ? "Sending code…" : "Send code"}
      </Button>
      {resendMs > 0 && (
        <p className="text-muted-foreground text-center text-sm" role="status">
          Too many codes requested. Try again in{" "}
          <span className="text-foreground tabular-nums">{Math.ceil(resendMs / 1000)}s</span>.
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
