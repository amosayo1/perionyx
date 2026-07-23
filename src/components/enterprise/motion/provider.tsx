"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { MotionVariantName } from "./tokens";
import { variantMap } from "./tokens";

interface MotionContextValue {
  prefersReduced: boolean;
  enabled: boolean;
  getVariant: (name: MotionVariantName) => typeof variantMap[MotionVariantName] | undefined;
}

const MotionContext = createContext<MotionContextValue>({
  prefersReduced: false,
  enabled: true,
  getVariant: () => undefined,
});

interface MotionProviderProps {
  children: ReactNode;
  enabled?: boolean;
}

export function MotionProvider({ children, enabled = true }: MotionProviderProps) {
  const prefersReduced = useReducedMotion();

  const value = useMemo(() => ({
    prefersReduced,
    enabled: enabled && !prefersReduced,
    getVariant: (name: MotionVariantName) => variantMap[name],
  }), [prefersReduced, enabled]);

  return (
    <MotionContext.Provider value={value}>
      {children}
    </MotionContext.Provider>
  );
}

export function useMotion(): MotionContextValue {
  return useContext(MotionContext);
}
