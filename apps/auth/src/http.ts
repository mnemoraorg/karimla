import { Hono } from "hono"
import { cors } from "hono/cors"

import type { CorsConfig } from "../config/_types"
import { logger } from "../lib/logger"

export type AuthHandler = (request: Request) => Response | Promise<Response>

const authPath = "/api/v1/auth"

export function createApp(authHandler: AuthHandler, corsConfig: CorsConfig): Hono {
  const app = new Hono()
  const allowedOrigins = new Set(corsConfig.allowedOrigins)

  app.use("*", async (context, next) => {
    const startedAt = Date.now()

    try {
      await next()
    } finally {
      logger.info("auth.http.request", {
        durationMs: Date.now() - startedAt,
        method: context.req.method,
        path: new URL(context.req.url).pathname,
        status: context.res.status,
      })
    }
  })

  app.use(
    "*",
    cors({
      allowHeaders: corsConfig.allowedHeaders,
      allowMethods: corsConfig.allowedMethods,
      credentials: true,
      origin: (origin) => (allowedOrigins.has(origin) ? origin : null),
    }),
  )

  app.get("/health", (context) => context.json({ status: "UP" }))
  app.all(authPath, (context) => authHandler(context.req.raw))
  app.all(`${authPath}/*`, (context) => authHandler(context.req.raw))

  app.notFound((context) => context.json({ error: "Not found" }, 404))

  return app
}
