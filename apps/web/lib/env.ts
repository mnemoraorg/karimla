import { z } from "zod"

const apiV1Url = z.url().refine((value) => {
  const url = new URL(value)
  return url.pathname.replace(/\/+$/, "") === "/api/v1" && !url.search && !url.hash
}, "URL must end with /api/v1")

export const envSchema = z.object({
  NEXT_PUBLIC_ENVIRONMENT: z.string().trim().min(1),
  NEXT_PUBLIC_DEBUG: z.enum(["true", "false"]).transform((value) => value === "true"),
  NEXT_PUBLIC_AUTH_URL_V1: apiV1Url,
  NEXT_PUBLIC_API_URL_V1: apiV1Url,
})

const result = envSchema.safeParse({
  NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  NEXT_PUBLIC_DEBUG: process.env.NEXT_PUBLIC_DEBUG,
  NEXT_PUBLIC_AUTH_URL_V1: process.env.NEXT_PUBLIC_AUTH_URL_V1,
  NEXT_PUBLIC_API_URL_V1: process.env.NEXT_PUBLIC_API_URL_V1,
})

if (!result.success) {
  const issues = result.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ")
  throw new Error(`Invalid web environment: ${issues}`)
}

export const env = result.data
