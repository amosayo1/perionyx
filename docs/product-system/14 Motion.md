# 14 — Motion

**Product System · Document 14 of 20**
**Authority: Motion is the animation and micro-interaction specification for Perionyx. It derives from the Vision (00), Philosophy (01), Product Principles (02, especially the Motion & Visual domain), and the EDL Motion System, and is binding on all animated, transitional, and micro-interactive behavior.**
**Sources: The four-product research program — Stripe S15 (motion as clarity, never ornament), Linear S12 (velocity through motion), Ramp S14.1 (density-conscious motion), Coupa S12 (enterprise motion restraint); the EDL motion tokens (Phase 22.0B); the Motion System (Phase 8B.7).**

---

## 1. The Motion Doctrine

**Motion communicates state; it never decorates** (PP-120, PP-122). In a finance surface, animation is a carrier of meaning — status change, arrival, confirmation, focus. Motion that does not communicate is noise (PP-122). Motion that communicates is trust (PP-123): a number updating is an event, a toast confirming is a receipt.

The research synthesis:
- **Stripe** uses motion to clarify provenance: charts animate in, states transition, nothing spins for decoration (Stripe S15).
- **Linear** uses motion for velocity: instant transitions, layout shifts that preserve context, optimistic UI (PP-121).
- **Ramp** keeps motion density-conscious: subtle, fast, functional (PP-120).
- **Coupa** restrains motion in enterprise: status before flourish (PP-122).

## 2. The Token System

All motion uses the EDL motion tokens (PP-123):

- **Durations** — 100–600ms, categorized (instant 100–150ms, fast 200–250ms, standard 300–400ms, deliberate 500–600ms).
- **Easings** — six curated curves (ease, ease-in, ease-out, ease-in-out, spring-free standard, emphasis).
- **Variants** — fade-in, scale-in, slide-in, stagger, expand/collapse, shimmer (Phase 8B.7).

No hardcoded durations or ad hoc easings (PP-123, PP-219).

## 3. What Animates

- **Arrival and exit** — elements animate in on mount (fade/scale), animate out on unmount (AnimatePresence).
- **Status change** — a KPI updating animates the delta, not the whole card (PP-126).
- **Metric counting** — `AnimatedMetric` counts 600ms cubic ease-out, with trend arrows (PP-057, PP-121).
- **Focus** — focus rings and selection glow animate (PP-114).
- **Expansion** — collapsible sections animate height via `expandCollapse` variants (PP-237).
- **Lists and rows** — rows stagger in (30ms delay), never pop (Phase 8B.7).
- **Page transitions** — fade-in-up 400ms for page enter (PP-218).

## 4. What Never Animates

- **Money amounts during calculation** — the number appears settled, never animating through values (PP-121, PP-126).
- **Error states** — errors arrive instantly and announce; they never slide (PP-141, PP-209).
- **Destructive confirmations** — the confirm dialog is immediate and clear, not springy (PP-163).
- **Critical data** — the audit trail, the balance, the approval status never "fly in"; they render.

## 5. Reduced Motion

Motion yields to the user (PP-124):

- `prefers-reduced-motion: reduce` disables all non-essential animation (PP-234).
- MotionProvider gates all motion; reduced-motion users get instant, static states.
- No content is hidden by an animation — a static fallback always exists (PP-124).

## 6. Motion Rules (Condensed)

1. Motion communicates state; it never decorates (PP-120, PP-122).
2. All motion uses EDL tokens — no hardcoded durations (PP-123).
3. Money never animates through values (PP-121, PP-126).
4. Errors and destructive confirmations are immediate (PP-141, PP-163).
5. Reduced motion is honored everywhere (PP-124).
6. No content is gated behind an animation (PP-234).
7. Micro-interactions preserve context: optimistic updates with rollback (PP-121).
8. Status changes animate the delta, not the whole (PP-126).

## 7. Motion Anti-Patterns

- **The flourish** — animation with no meaning (rejected: PP-122).
- **The counting cash** — money animating through values (rejected: PP-126).
- **The springy confirm** — a playful motion on a destructive action (rejected: PP-163).
- **The long fade** — content invisible during a slow entrance (rejected: PP-124).
- **The ad hoc timing** — hardcoded durations that drift from the tokens (rejected: PP-123).
- **The motion-only state** — a state conveyed only by animation (rejected: PP-124, PP-125).

---

*Next: `15 Performance.md` — the performance and responsiveness specification.*
