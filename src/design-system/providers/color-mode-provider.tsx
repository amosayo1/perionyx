"use client";

import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";

type ColorMode = "dark" | "light" | "system";

interface ColorModeContextValue {
  mode: ColorMode;
  resolved: "dark" | "light";
  setMode: (mode: ColorMode) => void;
  toggle: () => void;
}

const ColorModeContext = createContext<ColorModeContextValue>({
  mode: "dark",
  resolved: "dark",
  setMode: () => {},
  toggle: () => {},
});

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ColorMode>("dark");

  const resolved = useMemo<"dark" | "light">(() => {
    if (mode === "system") {
      if (typeof window === "undefined") return "dark";
      return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    return mode;
  }, [mode]);

  useEffect(() => {
    document.documentElement.setAttribute("data-color-mode", resolved);
  }, [resolved]);

  const value = useMemo(() => ({
    mode,
    resolved,
    setMode,
    toggle: () => setMode((prev) => prev === "dark" ? "light" : prev === "light" ? "system" : "dark"),
  }), [mode, resolved]);

  return (
    <ColorModeContext.Provider value={value}>
      {children}
    </ColorModeContext.Provider>
  );
}

export function useColorMode(): ColorModeContextValue {
  return useContext(ColorModeContext);
}
