# PWA Readiness — Phase 8D.9

## Overview

PERIONYX is now a Progressive Web App with offline support, installability, and push notification infrastructure. Finance executives can install the app on their mobile home screen for native-like access to approvals, treasury, and dashboards.

## Features

### Web App Manifest

- `name`: "PERIONYX — Enterprise Treasury Operating System"
- `short_name`: "PERIONYX"
- `display`: standalone (full-screen, no browser chrome)
- `background_color` / `theme_color`: `#0a0a0a` (charcoal)
- `orientation`: portrait-primary
- `categories`: finance, business, productivity
- Icons: 192px, 512px PNG + maskable variant for Android adaptive icons
- Apple touch icon: 192px for iOS home screen
- `apple-mobile-web-app-capable`: enabled with black-translucent status bar

### Service Worker

Located at `public/sw.js` with the following caching strategy:

| Request Type | Strategy | Behavior |
|---|---|---|
| Navigation (HTML pages) | Network-first | Fetch from network, cache on success, fallback to `/offline` |
| `_next/static/*` | Cache-first | Serve cached, fetch new in background |
| Fonts, icons, images | Cache-first | Serve cached, fetch new in background |
| CSS, JS files | Cache-first | Serve cached, fetch new in background |
| API routes (`/api/*`) | Network-only | Never cached (must be fresh) |

Service worker lifecycle:
- **Install**: Cache `/offline` page, call `skipWaiting()` for immediate activation
- **Activate**: Clean old caches, `claim()` all clients
- **Fetch**: Route-aware caching with proper MIME type handling
- **Push**: Parse JSON payload, show notification with `requireInteraction: true`
- **Notification click**: Close notification, focus existing window or open new one

### Offline Page

Route: `/offline`
- Styled offline indicator with disconnected icon
- Cached by the service worker on install for offline navigation fallback
- "Try again" button reloads the page

### Install Prompt

`PwaInstallPrompt` component:
- Listens for `beforeinstallprompt` event (Chrome/Chromium/Edge)
- Shows a bottom-sheet-style install card with the PERIONYX logo
- "Install" button triggers the native install prompt
- "Not now" dismisses until next page load
- Auto-hides after app is installed (`appinstalled` event)
- Positioned above the mobile bottom navigation bar

### Push Notification Infrastructure

#### Client-side (`usePushNotifications` hook)

| Function | Description |
|---|---|
| `requestPermission()` | Request notification permission from user |
| `subscribe(publicVapidKey)` | Subscribe to push via `pushManager.subscribe()` |
| `unsubscribe()` | Unsubscribe and notify server |

State:
- `permission`: `"default" | "granted" | "denied"`
- `subscribed`: boolean
- `subscription`: `PushSubscription | null`
- `loading`: boolean
- `error`: string | null

#### API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/push/register` | POST | Register a push subscription (in-memory store) |
| `/api/push/unregister` | POST | Unregister a subscription by endpoint |
| `/api/push/send` | POST | Send push notification to all registered subscribers |

The `/api/push/send` endpoint supports this payload:
```json
{
  "title": "Approval Required",
  "body": "Payment #1234 needs your approval ($1,234,567)",
  "url": "/approvals/1234"
}
```

#### Dependencies

- `web-push` (v3.6.7) — server-side VAPID signing and push sending
- Environment variables:
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — public key exposed to client
  - `VAPID_PRIVATE_KEY` — private key (server only)
  - `VAPID_SUBJECT` — mailto: or https:// contact for VAPID

### VAPID Key Generation

```bash
pnpm exec web-push generate-vapid-keys --json
```

Copy the output to your `.env` file:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY="<publicKey>"
VAPID_PRIVATE_KEY="<privateKey>"
VAPID_SUBJECT="mailto:admin@yourcompany.com"
```

## Architecture

```
src/components/pwa/
├── index.ts                   # Barrel exports
├── pwa-manager.tsx             # Combined PWA manager component
└── pwa-install-prompt.tsx      # Install prompt bottom sheet

src/hooks/
├── use-service-worker.ts       # SW registration hook
└── use-push-notifications.ts   # Push notification permission + subscription

src/app/api/push/
├── register/route.ts           # POST: subscribe
├── unregister/route.ts         # POST: unsubscribe
└── send/route.ts               # POST: send notification to all

src/app/(shell)/offline/page.tsx  # Offline fallback page

public/
├── sw.js                       # Service worker
└── icons/
    ├── icon-192.png            # PWA icon 192x192
    ├── icon-512.png            # PWA icon 512x512
    └── maskable-icon-512.png   # Maskable icon 512x512
```

## Files Modified

| File | Change |
|---|---|
| `src/app/manifest.ts` | Added categories, orientation, proper icons (192/512/maskable) |
| `src/app/layout.tsx` | Added `appleWebApp` metadata, apple touch icon |
| `src/components/app-shell.tsx` | Added `PwaManager` component |
| `.env` | Added VAPID public key, private key, subject |

## Files Created

| File | Purpose |
|---|---|
| `public/sw.js` | Service worker (install/activate/fetch/push/notificationclick) |
| `public/icons/icon-192.png` | PWA icon 192×192 |
| `public/icons/icon-512.png` | PWA icon 512×512 |
| `public/icons/maskable-icon-512.png` | Android adaptive icon 512×512 |
| `src/components/pwa/pwa-manager.tsx` | SW registration + install prompt |
| `src/components/pwa/pwa-install-prompt.tsx` | Native install prompt UI |
| `src/components/pwa/index.ts` | Barrel exports |
| `src/hooks/use-service-worker.ts` | Service Worker registration hook |
| `src/hooks/use-push-notifications.ts` | Push notification permission hook |
| `src/app/api/push/register/route.ts` | Push subscription registration API |
| `src/app/api/push/unregister/route.ts` | Push subscription removal API |
| `src/app/api/push/send/route.ts` | Push notification dispatch API |
| `src/app/(shell)/offline/page.tsx` | Offline navigation fallback page |
| `docs/design/pwa-readiness.md` | This document |

## New Dependencies

| Package | Version | Type | Purpose |
|---|---|---|---|
| `web-push` | ^3.6.7 | runtime | VAPID-based push notification sending |
| `@types/web-push` | ^3.6.4 | dev | TypeScript types |

## Verification

- ✅ `pnpm typecheck` — zero errors
- ✅ `pnpm build` — production build succeeds
- ✅ `curl localhost:3000` → HTTP 200
- ✅ `curl localhost:3000/manifest.webmanifest` → HTTP 200
- ✅ `curl localhost:3000/sw.js` → HTTP 200
- ✅ No backend/API/security architecture changes
- ✅ VAPID keys generated for development

## Future Work

- Persist push subscriptions to database (replace in-memory map)
- Wire push sending to business events (pending approval, payment due, etc.)
- Add service worker update prompt (notify user when new version is available)
- Implement background sync for offline actions
- Add periodic background sync for critical data refresh
- Service worker caching for previously visited dashboard data
- Capacitor/Trusted Web Activity for Google Play Store distribution
