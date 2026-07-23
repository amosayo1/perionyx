export const reducedMotion = {
  enabled: true,

  motionSafeOnly: {
    initial: {},
    animate: {},
    exit: {},
    transition: { duration: 0 },
  },

  animations: {
    fadeIn: { duration: 0 },
    fadeInUp: { duration: 0 },
    scaleIn: { duration: 0 },
    slideInLeft: { duration: 0 },
    slideInRight: { duration: 0 },
    shimmer: { duration: 0 },
    hoverElevate: { duration: 0 },
    hoverScale: { duration: 0 },
    expandCollapse: { duration: 0 },
    stagger: { duration: 0 },
    spring: { duration: 0 },
    pageTransition: { duration: 0.1 },
  },

  preserveEssential: {
    opacity: true,
    visibility: true,
    color: true,
    backgroundColor: true,
    borderColor: true,
  },

  removeNonEssential: {
    scale: true,
    rotate: true,
    skew: true,
    x: true,
    y: true,
    boxShadow: true,
    backgroundPosition: true,
  },
};

export function getReducedMotionProps(reduced: boolean) {
  if (!reduced) return {};
  return {
    initial: {},
    animate: {},
    exit: {},
    transition: { duration: 0 },
    whileHover: undefined,
    whileTap: undefined,
    whileDrag: undefined,
    whileFocus: undefined,
    whileInView: undefined,
  };
}

export function shouldAnimate(reduced: boolean, essential?: boolean): boolean {
  if (essential) return true;
  return !reduced;
}
