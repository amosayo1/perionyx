import type { Variants, Transition } from "framer-motion";

export const MotionDurations = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
  slower: 0.4,
  slowest: 0.6,
} as const;

export const MotionDelays = {
  none: 0,
  quick: 0.05,
  short: 0.1,
  medium: 0.2,
  long: 0.3,
} as const;

export const MotionEasings = {
  standard: [0.16, 1, 0.3, 1] as [number, number, number, number],
  accelerate: [0.4, 0, 1, 1] as [number, number, number, number],
  decelerate: [0, 0, 0.2, 1] as [number, number, number, number],
  spring: { type: "spring" as const, stiffness: 400, damping: 30 },
  springGentle: { type: "spring" as const, stiffness: 300, damping: 25 },
  springSnappy: { type: "spring" as const, stiffness: 500, damping: 35 },
} as const;

export const baseTransition: Transition = {
  duration: MotionDurations.normal,
  ease: MotionEasings.standard,
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: MotionDurations.slow, ease: MotionEasings.standard } },
  exit: { opacity: 0, transition: { duration: MotionDurations.fast, ease: MotionEasings.accelerate } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: MotionDurations.slow, ease: MotionEasings.standard } },
  exit: { opacity: 0, y: -4, transition: { duration: MotionDurations.fast, ease: MotionEasings.accelerate } },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: MotionDurations.slow, ease: MotionEasings.standard } },
  exit: { opacity: 0, y: 4, transition: { duration: MotionDurations.fast, ease: MotionEasings.accelerate } },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: MotionDurations.slow, ease: MotionEasings.standard } },
  exit: { opacity: 0, x: 4, transition: { duration: MotionDurations.fast, ease: MotionEasings.accelerate } },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 8 },
  visible: { opacity: 1, x: 0, transition: { duration: MotionDurations.slow, ease: MotionEasings.standard } },
  exit: { opacity: 0, x: -4, transition: { duration: MotionDurations.fast, ease: MotionEasings.accelerate } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: MotionDurations.slow, ease: MotionEasings.standard } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: MotionDurations.fast, ease: MotionEasings.accelerate } },
};

export const scaleInDown: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: -8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: MotionDurations.slow, ease: MotionEasings.decelerate } },
  exit: { opacity: 0, scale: 0.96, y: -4, transition: { duration: MotionDurations.fast, ease: MotionEasings.accelerate } },
};

export const slideInLeft: Variants = {
  hidden: { x: "-100%" },
  visible: { x: 0, transition: { duration: MotionDurations.slower, ease: MotionEasings.standard } },
  exit: { x: "-100%", transition: { duration: MotionDurations.slow, ease: MotionEasings.accelerate } },
};

export const slideInRight: Variants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { duration: MotionDurations.slower, ease: MotionEasings.standard } },
  exit: { x: "100%", transition: { duration: MotionDurations.slow, ease: MotionEasings.accelerate } },
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
  transition: { duration: MotionDurations.fast, ease: MotionEasings.standard },
};

export const hoverElevate = {
  y: -2,
  boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
  transition: { duration: MotionDurations.fast, ease: MotionEasings.standard },
};

export const tapScale = {
  scale: 0.98,
  transition: { duration: MotionDurations.instant, ease: MotionEasings.standard },
};

export const shimmer = {
  initial: { x: "-100%" },
  animate: {
    x: "200%",
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: MotionEasings.standard,
    },
  },
};

export const listItem: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 8, transition: { duration: MotionDurations.fast } },
};

export const expandCollapse: Variants = {
  collapsed: { height: 0, opacity: 0, overflow: "hidden" },
  expanded: { height: "auto", opacity: 1, overflow: "visible", transition: { duration: MotionDurations.slow, ease: MotionEasings.standard } },
};

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
