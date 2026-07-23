import { motion } from "@/design-system/tokens/motion";

export const timing = {
  instant: motion.duration.instant,
  fast: motion.duration.fast,
  normal: motion.duration.normal,
  slow: motion.duration.slow,
  page: motion.duration.slower,
  modal: motion.duration.slowest,
  toast: motion.duration.normal,
  hover: motion.duration.fast,
  focus: motion.duration.fast,
  exit: motion.duration.normal,
  loading: motion.duration.slower,
  stagger: { fast: 0.03, normal: 0.05, slow: 0.08 },
};

export const easing = motion.easing;

export const timingTokens = {
  instant: `${timing.instant}ms`,
  fast: `${timing.fast}ms`,
  normal: `${timing.normal}ms`,
  slow: `${timing.slow}ms`,
  page: `${timing.page}ms`,
  modal: `${timing.modal}ms`,
} as const;

export type TimingToken = keyof typeof timing;
export type EasingToken = keyof typeof easing;
