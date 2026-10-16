export type Environment = Record<string, string | undefined>

export interface AppConfig {
  environment: string
  port: number
}

export interface AuthConfig {
  cookieDomain: string | undefined
  secret: string
  url: string
}

export interface CorsConfig {
  allowedOrigins: string[]
  allowedHeaders: string[]
  allowedMethods: string[]
  exposeHeaders: string[]
}

export interface DatabaseConfig {
  url: string
}

export interface EmailConfig {
  accountId: string
  apiToken: string
  from: string
}

export interface RateLimitRule {
  max: number
  window: number
}

export interface RateLimitConfig {
  /** Path-keyed overrides, relative to the BetterAuth base path. */
  customRules: Record<string, RateLimitRule>
  /** The rule the `emailOTP` plugin applies to every path it owns. */
  emailOtpSend: RateLimitRule
}
