# Yappi web

## Configuration

Set all four public variables from `.env.example`. `lib/env.ts` validates them at startup; the auth and API URLs must point to their respective `/api/v1` endpoints.

## Scripts

- `bun run dev` starts the vinext dev server on port 35000.
- `bun run build` builds the Cloudflare Worker output.
- `bun run start` starts the built Worker locally with Wrangler.
- `bun run deploy` deploys the Cloudflare Worker.
