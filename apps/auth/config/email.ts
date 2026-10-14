import { z } from "zod"

import { loadConfig } from "../lib/load-config"
import type { EmailConfig, Environment } from "./_types"
import { environment } from "./env"

const emailSchema = z.object({
  CLOUDFLARE_ACCOUNT_ID: z.string().trim().min(1),
  CLOUDFLARE_API_TOKEN: z.string().trim().min(1),
  NO_REPLY_EMAIL: z.email(),
})

export function loadEmailConfig(env: Environment = environment): EmailConfig {
  const values = loadConfig(emailSchema, env)

  return {
    accountId: values.CLOUDFLARE_ACCOUNT_ID,
    apiToken: values.CLOUDFLARE_API_TOKEN,
    from: values.NO_REPLY_EMAIL,
  }
}
