"use client";

export type A11yMode = "default" | "highContrast" | "reducedMotion" | "fontScaling" | "keyboardNav" | "screenReader";

export type ReadingDensity = "compact" | "comfortable";

export type ColorBlindMode = "none" | "protanopia" | "deuteranopia" | "tritanopia";

export interface AccessibilityState {
  highContrast: boolean;
  reducedMotion: boolean;
  fontScaling: number;
  keyboardNavMode: boolean;
  focusVisibility: "always" | "keyboardOnly";
  screenReaderOptimized: boolean;
  colorBlindMode: ColorBlindMode;
  readingDensity: ReadingDensity;
  announceErrors: boolean;
  announceUpdates: boolean;
}

export type AccessibilityAction =
  | { type: "SET_HIGH_CONTRAST"; value: boolean }
  | { type: "SET_REDUCED_MOTION"; value: boolean }
  | { type: "SET_FONT_SCALING"; value: number }
  | { type: "SET_KEYBOARD_NAV_MODE"; value: boolean }
  | { type: "SET_FOCUS_VISIBILITY"; value: "always" | "keyboardOnly" }
  | { type: "SET_SCREEN_READER_OPTIMIZED"; value: boolean }
  | { type: "SET_COLOR_BLIND_MODE"; value: ColorBlindMode }
  | { type: "SET_READING_DENSITY"; value: ReadingDensity }
  | { type: "SET_ANNOUNCE_ERRORS"; value: boolean }
  | { type: "SET_ANNOUNCE_UPDATES"; value: boolean }
  | { type: "RESET" };

export const DEFAULT_A11Y_STATE: AccessibilityState = {
  highContrast: false,
  reducedMotion: false,
  fontScaling: 100,
  keyboardNavMode: false,
  focusVisibility: "keyboardOnly",
  screenReaderOptimized: false,
  colorBlindMode: "none",
  readingDensity: "comfortable",
  announceErrors: true,
  announceUpdates: false,
};

export function a11yReducer(state: AccessibilityState, action: AccessibilityAction): AccessibilityState {
  switch (action.type) {
    case "SET_HIGH_CONTRAST": return { ...state, highContrast: action.value };
    case "SET_REDUCED_MOTION": return { ...state, reducedMotion: action.value };
    case "SET_FONT_SCALING": return { ...state, fontScaling: Math.max(75, Math.min(200, action.value)) };
    case "SET_KEYBOARD_NAV_MODE": return { ...state, keyboardNavMode: action.value };
    case "SET_FOCUS_VISIBILITY": return { ...state, focusVisibility: action.value };
    case "SET_SCREEN_READER_OPTIMIZED": return { ...state, screenReaderOptimized: action.value };
    case "SET_COLOR_BLIND_MODE": return { ...state, colorBlindMode: action.value };
    case "SET_READING_DENSITY": return { ...state, readingDensity: action.value };
    case "SET_ANNOUNCE_ERRORS": return { ...state, announceErrors: action.value };
    case "SET_ANNOUNCE_UPDATES": return { ...state, announceUpdates: action.value };
    case "RESET": return DEFAULT_A11Y_STATE;
    default: return state;
  }
}
