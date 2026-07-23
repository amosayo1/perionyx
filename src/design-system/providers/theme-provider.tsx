"use client";

import type { ReactNode } from "react";
import { DesignTokenProvider } from "./design-token-provider";
import { ColorModeProvider } from "./color-mode-provider";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface ThemeProviderProps {
  children: ReactNode;
}

function ReducedMotionGuard({ children }: { children: ReactNode }) {
  useReducedMotion();
  return <>{children}</>;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <DesignTokenProvider>
      <ColorModeProvider>
        <ReducedMotionGuard>
          {children}
        </ReducedMotionGuard>
      </ColorModeProvider>
    </DesignTokenProvider>
  );
}
