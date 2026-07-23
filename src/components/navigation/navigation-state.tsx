"use client";

import { createContext, useContext, useCallback, useMemo, useState, useEffect } from "react";
import type { NavigationContextValue, SidebarMode } from "./navigation-types";

const SIDEBAR_MODE_KEY = "perionyx-sidebar-mode";

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [sidebarMode, setSidebarModeState] = useState<SidebarMode>("expanded");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_MODE_KEY);
      if (stored === "collapsed" || stored === "expanded") {
        setSidebarModeState(stored);
      }
    } catch { /* ignore */ }
    setInitialized(true);
  }, []);

  const setSidebarMode = useCallback((mode: SidebarMode) => {
    setSidebarModeState(mode);
    if (mode === "expanded" || mode === "collapsed") {
      try { localStorage.setItem(SIDEBAR_MODE_KEY, mode); } catch { /* ignore */ }
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarModeState((prev) => {
      const next: SidebarMode = prev === "expanded" ? "collapsed" : "expanded";
      try { localStorage.setItem(SIDEBAR_MODE_KEY, next); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const value = useMemo<NavigationContextValue>(
    () => ({
      sidebarMode: initialized ? sidebarMode : "expanded",
      setSidebarMode,
      toggleSidebar,
      mobileNavOpen,
      setMobileNavOpen,
      commandPaletteOpen,
      setCommandPaletteOpen,
    }),
    [sidebarMode, initialized, setSidebarMode, toggleSidebar, mobileNavOpen, commandPaletteOpen],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}
