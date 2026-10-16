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
}

export interface DatabaseConfig {
  url: string
}

export interface EmailConfig {
  accountId: string
  apiToken: string
  from: string
}
