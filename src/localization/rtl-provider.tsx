import { createContext, useContext, useMemo } from "react";
import type { Direction } from "./types";

interface RTLContextValue {
  isRTL: boolean;
  direction: Direction;
  mirror: <T>(ltr: T, rtl: T) => T;
  flexDirection: string;
  textAlign: string;
  paddingInlineStart: string;
  paddingInlineEnd: string;
  marginInlineStart: string;
  marginInlineEnd: string;
  borderLeft: string;
  borderRight: string;
  start: string;
  end: string;
}

const RTLContext = createContext<RTLContextValue | null>(null);

export function useRTLContext(): RTLContextValue {
  const ctx = useContext(RTLContext);
  if (!ctx) throw new Error("useRTLContext must be used within RTLProvider");
  return ctx;
}

interface RTLProviderProps {
  children: React.ReactNode;
  direction: Direction;
}

export function RTLProvider({ children, direction }: RTLProviderProps) {
  const isRTL = direction === "rtl";

  const value = useMemo<RTLContextValue>(
    () => ({
      isRTL,
      direction,
      mirror: <T,>(ltr: T, rtl: T) => (isRTL ? rtl : ltr),
      flexDirection: isRTL ? "row-reverse" : "row",
      textAlign: isRTL ? "right" : "left",
      paddingInlineStart: isRTL ? "pr" : "pl",
      paddingInlineEnd: isRTL ? "pl" : "pr",
      marginInlineStart: isRTL ? "mr" : "ml",
      marginInlineEnd: isRTL ? "ml" : "mr",
      borderLeft: isRTL ? "border-r" : "border-l",
      borderRight: isRTL ? "border-l" : "border-r",
      start: isRTL ? "right" : "left",
      end: isRTL ? "left" : "right",
    }),
    [isRTL, direction],
  );

  return <RTLContext.Provider value={value}>{children}</RTLContext.Provider>;
}
