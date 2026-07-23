import { motion } from "@/design-system/tokens/motion";

const { easing, duration } = motion;

export const pageEnter = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: duration.slower / 1000, ease: easing.easeOut },
};

export const pageLeave = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 12 },
  transition: { duration: duration.slow / 1000, ease: easing.easeOut },
};

export const modalEnter = {
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: duration.normal / 1000 },
  },
  content: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: { duration: duration.slow / 1000, ease: easing.easeOut },
  },
};

export const drawerEnter = {
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: duration.normal / 1000 },
  },
  content: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
    transition: { duration: duration.slow / 1000, ease: [0.4, 0, 0.2, 1] },
  },
};

export const sidebarCollapse = {
  initial: { width: 272 },
  animate: { width: 64 },
  exit: { width: 272 },
  transition: { duration: duration.normal / 1000, ease: [0.4, 0, 0.2, 1] },
};

export const toastEnter = {
  initial: { opacity: 0, x: 80, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 80, scale: 0.95 },
  transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.8 },
};

export const tooltipEnter = {
  initial: { opacity: 0, y: 4, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 4, scale: 0.95 },
  transition: { duration: duration.fast / 1000, ease: easing.easeOut },
};

export const accordionExpand = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: duration.slow / 1000, ease: [0.4, 0, 0.2, 1] },
};

export const rowEnter = {
  initial: { opacity: 0, x: -4 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 4 },
  transition: { duration: duration.normal / 1000, ease: easing.easeOut },
};

export const tabTransition = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 8 },
  transition: { duration: duration.fast / 1000, ease: easing.easeOut },
};

export const transitionPresetMap = {
  pageEnter, pageLeave, modalEnter, drawerEnter,
  sidebarCollapse, toastEnter, tooltipEnter,
  accordionExpand, rowEnter, tabTransition,
};

export type TransitionPresetName = keyof typeof transitionPresetMap;
