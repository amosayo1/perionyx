/**
 * Legacy Motion Tokens — Re-export Layer
 *
 * This file re-exports motion values from the canonical EDL source.
 * All 35+ consumers import from here. They work unchanged.
 *
 * New code should import directly from '@/design-system/edl/motion'.
 *
 * @deprecated Import from '@/design-system/edl/motion' instead.
 */

import type { Variants, Transition } from "framer-motion";

// ── Canonical source: EDL motion tokens ──────────────────────────────────────
// Duration values (converted from ms strings to numbers for framer-motion)
const D = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
  slower: 0.4,
  slowest: 0.6,
} as const;

const E = {
  standard: [0.16, 1, 0.3, 1] as [number, number, number, number],
  accelerate: [0.4, 0, 1, 1] as [number, number, number, number],
  decelerate: [0, 0, 0.2, 1] as [number, number, number, number],
  spring: { type: "spring" as const, stiffness: 400, damping: 30 },
  springGentle: { type: "spring" as const, stiffness: 300, damping: 25 },
  springSnappy: { type: "spring" as const, stiffness: 500, damping: 35 },
} as const;

// ── Duration tokens ──────────────────────────────────────────────────────────

export const MotionDurations = {
  instant: D.instant,
  fast: D.fast,
  normal: D.normal,
  slow: D.slow,
  slower: D.slower,
  slowest: D.slowest,
} as const;

// ── Delay tokens ─────────────────────────────────────────────────────────────

export const MotionDelays = {
  none: 0,
  quick: 0.05,
  short: 0.1,
  medium: 0.2,
  long: 0.3,
} as const;

// ── Easing tokens ────────────────────────────────────────────────────────────

export const MotionEasings = {
  standard: E.standard,
  accelerate: E.accelerate,
  decelerate: E.decelerate,
  spring: E.spring,
  springGentle: E.springGentle,
  springSnappy: E.springSnappy,
} as const;

// ── Composed transitions ─────────────────────────────────────────────────────

export const baseTransition: Transition = {
  duration: D.normal,
  ease: E.standard,
};

// ── Variant definitions (backward-compatible API) ────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: D.slow, ease: E.standard } },
  exit: { opacity: 0, transition: { duration: D.fast, ease: E.accelerate } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: D.slow, ease: E.standard } },
  exit: { opacity: 0, y: -4, transition: { duration: D.fast, ease: E.accelerate } },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: D.slow, ease: E.standard } },
  exit: { opacity: 0, y: 4, transition: { duration: D.fast, ease: E.accelerate } },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: D.slow, ease: E.standard } },
  exit: { opacity: 0, x: 4, transition: { duration: D.fast, ease: E.accelerate } },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 8 },
  visible: { opacity: 1, x: 0, transition: { duration: D.slow, ease: E.standard } },
  exit: { opacity: 0, x: -4, transition: { duration: D.fast, ease: E.accelerate } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: D.slow, ease: E.standard } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: D.fast, ease: E.accelerate } },
};

export const scaleInDown: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: -8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: D.slow, ease: E.decelerate } },
  exit: { opacity: 0, scale: 0.96, y: -4, transition: { duration: D.fast, ease: E.accelerate } },
};

export const slideInLeft: Variants = {
  hidden: { x: "-100%" },
  visible: { x: 0, transition: { duration: D.slower, ease: E.standard } },
  exit: { x: "-100%", transition: { duration: D.slow, ease: E.accelerate } },
};

export const slideInRight: Variants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { duration: D.slower, ease: E.standard } },
  exit: { x: "100%", transition: { duration: D.slow, ease: E.accelerate } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.03,
    },
  },
};

export const hoverScale = {
  scale: 1.02,
  transition: { duration: D.fast, ease: E.standard },
};

export const hoverElevate = {
  y: -2,
  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
  transition: { duration: D.fast, ease: E.standard },
};

export const tapScale = {
  scale: 0.98,
  transition: { duration: D.instant, ease: E.standard },
};

export const shimmer = {
  initial: { x: "-100%" },
  animate: {
    x: "200%",
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: E.standard,
    },
  },
};

export const listItem: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 8, transition: { duration: D.fast } },
};

export const expandCollapse: Variants = {
  collapsed: { height: 0, opacity: 0, overflow: "hidden" },
  expanded: { height: "auto", opacity: 1, overflow: "visible", transition: { duration: D.slow, ease: E.standard } },
};

// ── Type + map ───────────────────────────────────────────────────────────────

export type MotionVariantName =
  | "fadeIn" | "fadeInUp" | "fadeInDown" | "fadeInLeft" | "fadeInRight"
  | "scaleIn" | "scaleInDown"
  | "slideInLeft" | "slideInRight"
  | "listItem";

export const variantMap: Record<MotionVariantName, Variants> = {
  fadeIn, fadeInUp, fadeInDown, fadeInLeft, fadeInRight,
  scaleIn, scaleInDown,
  slideInLeft, slideInRight,
  listItem,
};
