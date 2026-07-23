export const motion = {
  duration: {
    instant: 50,
    fast: 100,
    normal: 200,
    slow: 300,
    slower: 400,
    slowest: 600,
  },

  easing: {
    linear: [0, 0, 1, 1] as const,
    easeIn: [0.4, 0, 1, 1] as const,
    easeOut: [0, 0, 0.2, 1] as const,
    easeInOut: [0.4, 0, 0.2, 1] as const,
    spring: [0.34, 1.56, 0.64, 1] as const,
    springGentle: [0.22, 1, 0.36, 1] as const,
    springStiff: [0.12, 0.71, 0.33, 1] as const,
    emphasize: [0.83, 0, 0.17, 1] as const,
  },

  variant: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2, ease: [0, 0, 0.2, 1] },
    },
    fadeInUp: {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
      transition: { duration: 0.3, ease: [0, 0, 0.2, 1] },
    },
    slideInLeft: {
      initial: { x: -16, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -16, opacity: 0 },
      transition: { duration: 0.25, ease: [0, 0, 0.2, 1] },
    },
    slideInRight: {
      initial: { x: 16, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 16, opacity: 0 },
      transition: { duration: 0.25, ease: [0, 0, 0.2, 1] },
    },
    scaleIn: {
      initial: { scale: 0.95, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.95, opacity: 0 },
      transition: { duration: 0.2, ease: [0, 0, 0.2, 1] },
    },
    expandCollapse: {
      initial: { height: 0, opacity: 0 },
      animate: { height: "auto", opacity: 1 },
      exit: { height: 0, opacity: 0 },
      transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
    },
    stagger: {
      container: {
        animate: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
      },
      item: {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.25, ease: [0, 0, 0.2, 1] },
      },
    },
    cardHover: {
      rest: { scale: 1, y: 0 },
      hover: { scale: 1.02, y: -2 },
      tap: { scale: 0.98 },
      transition: { duration: 0.2, ease: [0, 0, 0.2, 1] },
    },
    buttonHover: {
      rest: { scale: 1 },
      hover: { scale: 1.03 },
      tap: { scale: 0.97 },
      transition: { duration: 0.15, ease: [0, 0, 0.2, 1] },
    },
    shimmer: {
      initial: { backgroundPosition: "-200% 0" },
      animate: { backgroundPosition: "200% 0" },
      transition: { duration: 1.5, repeat: Infinity, ease: [0.4, 0, 0.2, 1] },
    },
    pageTransition: {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -12 },
      transition: { duration: 0.3, ease: [0, 0, 0.2, 1] },
    },
    sidebar: {
      initial: { x: -280 },
      animate: { x: 0 },
      exit: { x: -280 },
      transition: { duration: 0.3, ease: [0, 0, 0.2, 1] },
    },
    modal: {
      overlay: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      },
      content: {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
        transition: { duration: 0.25, ease: [0, 0, 0.2, 1] },
      },
    },
    accordion: {
      initial: { height: 0, opacity: 0 },
      animate: { height: "auto", opacity: 1 },
      exit: { height: 0, opacity: 0 },
      transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
    },
    metric: {
      initial: { opacity: 0, y: 8, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: 0.4, ease: [0, 0, 0.2, 1] },
    },
    skeleton: {
      initial: { opacity: 0.5 },
      animate: { opacity: 1 },
      transition: { duration: 0.8, repeat: Infinity, repeatType: "reverse" as const, ease: [0.4, 0, 0.6, 1] },
    },
  },
} as const;

export type MotionToken = typeof motion;
