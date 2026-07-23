export const gestureConfig = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.15, ease: [0, 0, 0.2, 1] },
} as const;

export const cardGesture = {
  whileHover: { y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" },
  whileTap: { scale: 0.99 },
  transition: { duration: 0.2, ease: [0, 0, 0.2, 1] },
} as const;

export const dragConfig = {
  drag: true as const,
  dragElastic: 0.1,
  dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
  onDragEnd: (_: any, info: any) => {
    const threshold = 80;
    if (info.offset.x > threshold) return "swipe-right";
    if (info.offset.x < -threshold) return "swipe-left";
    return null;
  },
};

export const swipeConfig = {
  swipeThreshold: 80,
  swipeVelocityThreshold: 300,
};

export const hoverDelay = {
  hover: { duration: 0.15 },
  tap: { duration: 0.1 },
};

export const exitGesture = {
  whileHover: { opacity: 0.8 },
  whileTap: { opacity: 0.6 },
  transition: { duration: 0.1 },
};

export type GestureType = keyof typeof gestureConfig;
