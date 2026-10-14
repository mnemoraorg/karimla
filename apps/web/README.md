# Karimla web

## Sign-in configuration

Set `NEXT_PUBLIC_AUTH_URL` to the auth service URL for deployment. Local development defaults to `http://localhost:35081`; see `.env.example`.

## Scripts

- `bun run dev` starts the vinext dev server on port 35000.
- `bun run build` builds the Cloudflare Worker output.
- `bun run start` starts the built Worker locally with Wrangler.
- `bun run deploy` deploys the Cloudflare Worker.
