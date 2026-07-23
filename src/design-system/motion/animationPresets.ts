import { motion } from "@/design-system/tokens/motion";

const { easing, duration } = motion;

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: duration.normal / 1000, ease: easing.easeOut },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: duration.slow / 1000, ease: easing.easeOut },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: duration.slow / 1000, ease: easing.easeOut },
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 8 },
  transition: { duration: duration.slow / 1000, ease: easing.easeOut },
};

export const fadeInRight = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -8 },
  transition: { duration: duration.slow / 1000, ease: easing.easeOut },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: duration.normal / 1000, ease: easing.easeOut },
};

export const slideInLeft = {
  initial: { x: -16, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -16, opacity: 0 },
  transition: { duration: duration.slow / 1000, ease: easing.easeOut },
};

export const slideInRight = {
  initial: { x: 16, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 16, opacity: 0 },
  transition: { duration: duration.slow / 1000, ease: easing.easeOut },
};

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: duration.slow / 1000, ease: easing.easeOut },
};

export const hoverElevate = {
  rest: { y: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" },
  hover: { y: -1, boxShadow: "0 4px 8px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)" },
  transition: { duration: duration.normal / 1000, ease: easing.easeOut },
};

export const hoverScale = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
  transition: { duration: duration.fast / 1000, ease: easing.easeOut },
};

export const tapScale = {
  whileTap: { scale: 0.97 },
  transition: { duration: duration.instant / 1000, ease: easing.easeOut },
};

export const expandCollapse = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: duration.slow / 1000, ease: [0.4, 0, 0.2, 1] },
};

export const shimmer = {
  initial: { backgroundPosition: "-200% 0" },
  animate: { backgroundPosition: "200% 0" },
  transition: { duration: 1.5, repeat: Infinity, ease: easing.easeInOut },
};

export const listItem = {
  initial: { opacity: 0, x: -4 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 4 },
  transition: { duration: duration.normal / 1000, ease: easing.easeOut },
};

export const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
  mass: 0.8,
};

export const springGentle = {
  type: "spring" as const,
  stiffness: 200,
  damping: 30,
  mass: 1,
};

export const springStiff = {
  type: "spring" as const,
  stiffness: 400,
  damping: 20,
  mass: 0.6,
};

export const animationPresetMap = {
  fadeIn, fadeInUp, fadeInDown, fadeInLeft, fadeInRight,
  scaleIn, slideInLeft, slideInRight,
  staggerContainer, staggerItem,
  hoverElevate, hoverScale, tapScale,
  expandCollapse, shimmer, listItem,
};

export type AnimationPresetName = keyof typeof animationPresetMap;
