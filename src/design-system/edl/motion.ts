/**
 * Phase 22.0B — EDL Canonical Motion Tokens
 *
 * ONE system. No duplicates. Every animation in Perionyx uses these.
 * Respects prefers-reduced-motion. No spring physics (enterprise precision).
 */

// ── Durations ────────────────────────────────────────────────────────────────

export const DURATION = {
  instant: "0ms",
  fast: "100ms",
  normal: "200ms",
  moderate: "300ms",
  slow: "400ms",
  verySlow: "600ms",
  /** Page-level transitions */
  page: "400ms",
  /** Dialog enter */
  dialogEnter: "200ms",
  /** Dialog exit */
  dialogExit: "150ms",
  /** Toast slide-in */
  toast: "300ms",
  /** Skeleton shimmer cycle */
  shimmer: "2000ms",
} as const;

// ── Easings ──────────────────────────────────────────────────────────────────

export const EASING = {
  /** Default for most transitions */
  default: "cubic-bezier(0.4, 0, 0.2, 1)",
  /** Entering elements — slightly faster */
  in: "cubic-bezier(0.4, 0, 1, 1)",
  /** Exiting elements — slightly faster */
  out: "cubic-bezier(0, 0, 0.2, 1)",
  /** Entering+exiting */
  inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  /** Smooth deceleration for counters/metrics */
  easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  /** Snappy feel for small interactions */
  snappy: "cubic-bezier(0.2, 0, 0, 1)",
} as const;

// ── Reduced Motion ───────────────────────────────────────────────────────────

export const REDUCED_MOTION = {
  duration: "0ms",
  easing: "linear",
} as const;

// ── Composed Variants ────────────────────────────────────────────────────────

export const VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: DURATION.normal, easing: EASING.out },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DURATION.moderate, easing: EASING.out },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DURATION.moderate, easing: EASING.out },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: DURATION.normal, easing: EASING.out },
  },
  slideInRight: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: DURATION.moderate, easing: EASING.out },
  },
  slideInLeft: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: DURATION.moderate, easing: EASING.out },
  },
  expand: {
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1 },
    transition: { duration: DURATION.moderate, easing: EASING.inOut },
  },
  collapse: {
    initial: { height: "auto", opacity: 1 },
    animate: { height: 0, opacity: 0 },
    transition: { duration: DURATION.normal, easing: EASING.inOut },
  },
  stagger: {
    /** Base stagger delay per item — 30ms is the minimum perceptible gap */
    delay: 30,
    /** Max total stagger duration before clamping */
    maxDelay: 300,
  },
} as const;

// ── Framer-Motion Ready ──────────────────────────────────────────────────────

export const MOTION_DIV = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
    transition: { duration: 0.3, ease: [0, 0, 0.2, 1] },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: [0, 0, 0.2, 1] },
  },
  slideRight: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
    transition: { duration: 0.3, ease: [0, 0, 0.2, 1] },
  },
  expand: {
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
} as const;
