# Developer Guide

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16+
- Git

## Setup

```bash
# Clone
git clone <repo> && cd perionyx

# Install
pnpm install

# Environment
cp .env.example .env.local

# Database
pnpm db:migrate
pnpm db:seed

# Start
pnpm dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | NextAuth encryption secret |
| `NEXTAUTH_URL` | Application base URL |
| `NEXT_PUBLIC_APP_URL` | Public-facing app URL |

## Project Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript check
pnpm test         # Run tests
pnpm db:migrate   # Run Prisma migrations
pnpm db:seed      # Seed database
pnpm db:studio    # Open Prisma Studio
```

## Coding Standards

- **TypeScript strict mode** enabled
- **ESLint** with Next.js and TypeScript rules
- **Components**: Server components by default, `"use client"` at boundaries
- **Imports**: Use `@/` path alias
- **Styling**: TailwindCSS with PERIONYX design tokens
- **Animations**: Framer Motion `motion.div` with consistent easing `[0.16, 1, 0.3, 1]`

## Component Convention

```tsx
// Server component (no "use client")
export function MyComponent() {
  return <div>{children}</div>
}

// Client component only when needed
"use client";
import { motion } from "framer-motion";
export function MyInteractiveComponent() {
  const [state, setState] = useState();
  return <motion.div>...</motion.div>;
}
```

## Adding a New Workspace

1. Create route: `src/app/(shell)/<workspace>/page.tsx`
2. Create `loading.tsx` for skeleton states
3. Create component directory: `src/components/<workspace>/`
4. Add `types.ts` and `data.ts` with typed demo data
5. Create components
6. Add nav entry in `src/components/app-shell.tsx`
7. Add command palette entry in `src/components/command-palette/command-palette.tsx`

## Our Philosophy

- **Additive only** — never modify existing business logic
- **Zero dependencies** — reuse existing Radix, Framer Motion, Lucide
- **Design consistency** — dark zinc palette, glass cards, emerald accents
- **Production quality** — loading skeletons, error boundaries, empty states for every route
