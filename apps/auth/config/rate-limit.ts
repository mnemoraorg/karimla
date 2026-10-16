import type { RateLimitConfig, RateLimitRule } from "./_types"

/**
 * BetterAuth's `emailOTP` plugin registers one rule per path it owns — send,
 * check, verify-email, sign-in, password reset, email change — and takes a
 * single `{ window, max }` for all of them, so the plugin rule is the strict
 * guard it applies everywhere. Top-level `customRules` are the only per-path
 * override, and their keys are relative to the BetterAuth base path, so
 * `/sign-in/email-otp` means `/api/v1/auth/sign-in/email-otp`.
 *
 * Sending a code stays one-per-minute because every request costs an email.
 * Verification is relaxed: `allowedAttempts` already bounds guessing at three
 * tries per code, and a fresh code costs a minute, so holding sign-in to one
 * request per minute only turned a typo into a minute of waiting.
 */

/** The plugin-wide rule, kept strict because it covers every path it owns. */
export const emailOtpSendLimit: RateLimitRule = { max: 1, window: 60 }

/** Verification is judged by the code instead; five still covers three typos. */
export const signInEmailOtpLimit: RateLimitRule = { max: 5, window: 60 }

export const rateLimit: RateLimitConfig = {
  customRules: {
    "/sign-in/email-otp": signInEmailOtpLimit,
  },
  emailOtpSend: emailOtpSendLimit,
}
