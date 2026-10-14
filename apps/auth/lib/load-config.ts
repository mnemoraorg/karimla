import { z } from "zod"

import type { Environment } from "../config/_types"

export function loadConfig<T extends z.ZodType>(schema: T, env: Environment): z.output<T> {
  const result = schema.safeParse(env)

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "config"}: ${issue.message}`)
      .join("; ")
    throw new Error(`Invalid auth configuration: ${details}`)
  }

  return result.data
}
