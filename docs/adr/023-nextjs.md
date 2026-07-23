# ADR-023: Next.js 16 with React 19

**Status**: Ratified
**Date**: July 2026
**Author**: Architecture Team

## Context

The platform needs a web framework that supports server-side rendering for financial dashboards (SEO is not primary — speed is), React Server Components for zero-client JavaScript data fetching, edge runtime for the proxy layer, App Router for route organization, and streaming for AI commentary and report generation.

## Decision

Use **Next.js 16** with **React 19** as the web framework.

### Versions

- **Next.js**: 16.2.6
- **React**: 19.2.4
- **TypeScript**: 5.9.3 (strict mode)

### Architecture Pattern

```
src/app/
├── (shell)/          # Authenticated routes with shared layout
│   ├── dashboard/
│   ├── treasury/
│   ├── approvals/
│   ├── reporting/
│   └── automation-studio/
├── api/              # 272+ REST API endpoints
│   ├── v1/
│   └── automation-studio/
└── layout.tsx        # Root layout
```

### Key Next.js 16 Features Used

| Feature | Usage |
|---------|-------|
| **React Server Components** | All data-fetching pages — zero client-side JavaScript for initial data load |
| **App Router** | Route groups, parallel routes, intercepting routes |
| **Edge Runtime** | Edge proxy at `src/proxy.ts` replaces Next.js middleware |
| **Streaming** | AI commentary responses, CSV/Excel export streaming |
| **Dynamic Imports** | Heavy client components (charts, tables, editors) loaded on interaction |
| **Standalone Output** | `.next/standalone` for Docker deployment |
| **Loading UI** | Per-segment loading.tsx with skeleton components |
| **Error UI** | Per-segment error.tsx with recovery actions |

### Edge Proxy (Replaces Middleware)

Next.js 16 uses `src/proxy.ts` instead of `src/middleware.ts`:

```typescript
// src/proxy.ts — handles at edge:
// - Auth token extraction and validation
// - Rate limiting (sliding window)
// - CSRF token verification
// - Correlation ID generation
// - Request timing headers
// - Locale detection (NEXT_LOCALE cookie + Accept-Language)
```

## Alternatives Considered

1. **Remix**: Rejected — smaller deployment ecosystem, less mature edge runtime, no RSC at time of evaluation
2. **SvelteKit**: Rejected — smaller ecosystem for enterprise, fewer React libraries available
3. **Plain React + Vite**: Rejected — no SSR/SEO, no built-in routing, no streaming, no edge runtime
4. **Express + React**: Rejected — no RSC, no App Router, manual SSR setup

## Consequences

- **Positive**: RSC eliminates client-side data fetching waterfall — critical for CFO dashboards
- **Positive**: App Router provides clear route organization with loading/error boundaries
- **Positive**: Edge proxy handles auth/rate limiting without round-trip to app server
- **Positive**: Streaming enables progressive rendering of AI responses
- **Positive**: Next.js 16 standalone output enables clean Docker deployment
- **Negative**: Server Components require discipline — any `"use client"` directive breaks the RSC boundary
- **Negative**: Edge runtime limitations (no Node.js APIs) require careful proxy design
- **Negative**: Build time increases with 270+ API routes and 96+ pages

## Future Considerations

- React Server Actions for form mutations (currently using REST API routes)
- Partial prerendering for hybrid static/dynamic pages
- ISR (Incremental Static Regeneration) for public report pages
