# Deployment Guide

## Production Build

```bash
pnpm build
```

Output is in `.next/`.

## Deploy to Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel --prod
```

## Docker

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules
CMD ["pnpm", "start"]
```

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Random 32+ char string |
| `NEXTAUTH_URL` | Yes | Deployment URL |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL |

## Database Migrations

```bash
# Generate migration
pnpm db:migrate --name <description>

# Apply in production
pnpm db:migrate:prod
```

## Monitoring

- Application logs via `console.log` — captured by hosting platform
- Error tracking via `error.tsx` boundaries
- Performance monitoring via Next.js Analytics (optional)

## Health Check

The `/status` endpoint provides system status display.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails with TS errors | Run `pnpm typecheck` and fix errors |
| Database connection fails | Verify `DATABASE_URL` and network access |
| Auth not working | Ensure `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set |
| Static assets not loading | Verify `NEXT_PUBLIC_APP_URL` matches deployment URL |
