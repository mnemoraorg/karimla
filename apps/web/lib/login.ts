export const PENDING_LOGIN_EMAIL_KEY = "karimla.pending-email"

export const RESEND_DEADLINE_KEY = "karimla.login.resend-deadline"

export const RESEND_COOLDOWN_MS = 60_000

export function cooldownDeadlineFromNow(now: number = Date.now()): number {
  return now + RESEND_COOLDOWN_MS
}

export function cooldownRemainingMs(deadline: number, now: number = Date.now()): number {
  return Math.max(0, deadline - now)
}
