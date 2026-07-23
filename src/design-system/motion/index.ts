export { timing, easing, timingTokens } from "./motionTokens";
export type { TimingToken, EasingToken } from "./motionTokens";

export {
  fadeIn, fadeInUp, fadeInDown, fadeInLeft, fadeInRight,
  scaleIn, slideInLeft, slideInRight,
  staggerContainer, staggerItem,
  hoverElevate, hoverScale, tapScale,
  expandCollapse, shimmer, listItem,
  springTransition, springGentle, springStiff,
  animationPresetMap,
} from "./animationPresets";
export type { AnimationPresetName } from "./animationPresets";

export {
  pageEnter, pageLeave, modalEnter, drawerEnter,
  sidebarCollapse, toastEnter, tooltipEnter,
  accordionExpand, rowEnter, tabTransition,
  transitionPresetMap,
} from "./transitionPresets";
export type { TransitionPresetName } from "./transitionPresets";

export {
  buttonPress, cardLift, rowHighlight, dotPulse, shimmer as microShimmer,
  counterEnter, deltaFlash, errorShake, successCheck,
  notificationDot, listStagger, focusRing,
  microInteractionMap,
} from "./microInteractions";
export type { MicroInteractionName } from "./microInteractions";

export {
  gestureConfig, cardGesture, dragConfig, swipeConfig, hoverDelay, exitGesture,
} from "./gestureConfig";
export type { GestureType } from "./gestureConfig";

export {
  reducedMotion, getReducedMotionProps, shouldAnimate,
} from "./reducedMotion";
