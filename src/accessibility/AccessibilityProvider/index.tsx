"use client";

import { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from "react";
import type { AccessibilityState, AccessibilityAction, ReadingDensity, ColorBlindMode } from "../types";
import { DEFAULT_A11Y_STATE, a11yReducer } from "../types";
import { useHighContrast } from "../HighContrast/high-contrast";
import { useReducedMotionOverride } from "../ReducedMotion/reduced-motion";
import { useFontScaling, useReadingDensity } from "../FontScaling/font-scaling";

const STORAGE_KEY = "perionyx-a11y-prefs";

interface A11yContextValue {
  state: AccessibilityState;
  dispatch: React.Dispatch<AccessibilityAction>;
  setHighContrast: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  setFontScaling: (value: number) => void;
  setKeyboardNavMode: (value: boolean) => void;
  setFocusVisibility: (value: "always" | "keyboardOnly") => void;
  setScreenReaderOptimized: (value: boolean) => void;
  setColorBlindMode: (value: ColorBlindMode) => void;
  setReadingDensity: (value: ReadingDensity) => void;
  reset: () => void;
  focusRingClass: string;
}

const A11yContext = createContext<A11yContextValue | null>(null);

export function useA11y(): A11yContextValue {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error("useA11y must be used within AccessibilityProvider");
  return ctx;
}

function loadState(): AccessibilityState {
  if (typeof window === "undefined") return DEFAULT_A11Y_STATE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_A11Y_STATE, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return DEFAULT_A11Y_STATE;
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(a11yReducer, undefined, loadState);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  useHighContrast(state.highContrast);
  useReducedMotionOverride(state.reducedMotion);
  useFontScaling(state.fontScaling);
  useReadingDensity(state.readingDensity);

  useEffect(() => {
    const root = document.documentElement;
    if (state.colorBlindMode !== "none") {
      root.setAttribute("data-color-blind", state.colorBlindMode);
    } else {
      root.removeAttribute("data-color-blind");
    }
  }, [state.colorBlindMode]);

  useEffect(() => {
    const root = document.documentElement;
    if (state.screenReaderOptimized) {
      root.classList.add("a11y-sr-optimized");
    } else {
      root.classList.remove("a11y-sr-optimized");
    }
  }, [state.screenReaderOptimized]);

  const setHighContrast = useCallback((value: boolean) => dispatch({ type: "SET_HIGH_CONTRAST", value }), []);
  const setReducedMotion = useCallback((value: boolean) => dispatch({ type: "SET_REDUCED_MOTION", value }), []);
  const setFontScaling = useCallback((value: number) => dispatch({ type: "SET_FONT_SCALING", value }), []);
  const setKeyboardNavMode = useCallback((value: boolean) => dispatch({ type: "SET_KEYBOARD_NAV_MODE", value }), []);
  const setFocusVisibility = useCallback((value: "always" | "keyboardOnly") => dispatch({ type: "SET_FOCUS_VISIBILITY", value }), []);
  const setScreenReaderOptimized = useCallback((value: boolean) => dispatch({ type: "SET_SCREEN_READER_OPTIMIZED", value }), []);
  const setColorBlindMode = useCallback((value: ColorBlindMode) => dispatch({ type: "SET_COLOR_BLIND_MODE", value }), []);
  const setReadingDensity = useCallback((value: ReadingDensity) => dispatch({ type: "SET_READING_DENSITY", value }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const focusRingClass = state.focusVisibility === "always"
    ? "focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-zinc-950"
    : "focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

  const value = useMemo<A11yContextValue>(
    () => ({
      state, dispatch,
      setHighContrast, setReducedMotion, setFontScaling,
      setKeyboardNavMode, setFocusVisibility, setScreenReaderOptimized,
      setColorBlindMode, setReadingDensity, reset, focusRingClass,
    }),
    [state, setHighContrast, setReducedMotion, setFontScaling, setKeyboardNavMode,
     setFocusVisibility, setScreenReaderOptimized, setColorBlindMode, setReadingDensity,
     reset, focusRingClass],
  );

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
}
