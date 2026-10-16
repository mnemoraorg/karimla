export const PENDING_LOGIN_EMAIL_KEY = "karimla.pending-email"

export const RESEND_DEADLINE_KEY = "karimla.login.resend-deadline"

export const RESEND_COOLDOWN_SECONDS = 60

export const RESEND_COOLDOWN_MS = RESEND_COOLDOWN_SECONDS * 1000

/**
 * Builds the deadline for a sign-in cooldown. Pass the window the auth service
 * reported so the countdown matches it; omit it to fall back to the known
 * cooldown, which is what a missing or unreadable retry header means.
 */
export function cooldownDeadlineFromSeconds(
  seconds: number | null = null,
  now: number = Date.now(),
): number {
  return now + (seconds ?? RESEND_COOLDOWN_SECONDS) * 1000
}

export function cooldownRemainingMs(deadline: number, now: number = Date.now()): number {
  return Math.max(0, deadline - now)
}
