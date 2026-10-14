export type LogFields = Record<string, unknown>

function write(level: "error" | "info" | "warn", event: string, fields: LogFields): void {
  const line = JSON.stringify({
    event,
    level,
    timestamp: new Date().toISOString(),
    ...fields,
  })

  if (level === "error") {
    console.error(line)
  } else if (level === "warn") {
    console.warn(line)
  } else {
    console.info(line)
  }
}

export const logger = {
  error: (event: string, fields: LogFields = {}) => write("error", event, fields),
  info: (event: string, fields: LogFields = {}) => write("info", event, fields),
  warn: (event: string, fields: LogFields = {}) => write("warn", event, fields),
}

export function maskEmail(email: string): string {
  const normalized = email.trim().toLowerCase()
  const at = normalized.lastIndexOf("@")

  if (at <= 0 || at === normalized.length - 1) return "***"

  return `${normalized[0]}***${normalized.slice(at)}`
}

export function describeError(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error"
}
