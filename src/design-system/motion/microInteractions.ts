import type { Variants } from "framer-motion";

export const buttonPress: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.97 },
};

export const cardLift: Variants = {
  rest: { y: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" },
  hover: {
    y: -2,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)",
    borderColor: "rgba(212,168,0,0.3)",
  },
};

export const rowHighlight: Variants = {
  rest: { backgroundColor: "rgba(255,255,255,0)", scale: 1 },
  hover: { backgroundColor: "rgba(255,255,255,0.03)", scale: 1.002 },
};

export const dotPulse = {
  scale: [1, 1.3, 1],
  opacity: [1, 0.7, 1],
  transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
};

export const shimmer = {
  initial: { backgroundPosition: "-200% 0" },
  animate: {
    backgroundPosition: "200% 0",
    transition: { duration: 1.5, repeat: Infinity, ease: "linear" },
  },
};

export const counterEnter = {
  initial: { opacity: 0, y: 8, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.4, ease: [0, 0, 0.2, 1] },
};

export const deltaFlash = {
  initial: { backgroundColor: "rgba(34,197,94,0)" },
  animate: {
    backgroundColor: ["rgba(34,197,94,0)", "rgba(34,197,94,0.15)", "rgba(34,197,94,0)"],
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

export const errorShake = {
  x: [0, -4, 4, -4, 4, -2, 2, 0],
  transition: { duration: 0.4 },
};

export const successCheck = {
  pathLength: [0, 1],
  opacity: [0, 1],
  transition: { duration: 0.3, ease: [0, 0, 0.2, 1] },
};

export const notificationDot = {
  scale: [1, 1.5, 1],
  transition: { duration: 1, repeat: Infinity, ease: "easeInOut" },
};

export const listStagger = {
  container: {
    animate: { transition: { staggerChildren: 0.04, delayChildren: 0.06 } },
  },
  item: {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
    transition: { duration: 0.2, ease: [0, 0, 0.2, 1] },
  },
};

export const focusRing = {
  initial: { boxShadow: "0 0 0 0 rgba(212,168,0,0)" },
  focus: {
    boxShadow: "0 0 0 2px rgba(212,168,0,0.3)",
    transition: { duration: 0.15 },
  },
};

export const microInteractionMap = {
  buttonPress, cardLift, rowHighlight, dotPulse, shimmer,
  counterEnter, deltaFlash, errorShake, successCheck,
  notificationDot, listStagger, focusRing,
};

export type MicroInteractionName = keyof typeof microInteractionMap;
