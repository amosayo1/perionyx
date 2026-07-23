"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { colors } from "../tokens/colors";
import { typography } from "../tokens/typography";
import { spacing } from "../tokens/spacing";
import { radius } from "../tokens/radius";
import { shadows } from "../tokens/shadows";
import { motion } from "../tokens/motion";
import { zIndex } from "../tokens/z-index";
import { elevation } from "../tokens/elevation";
import { opacity } from "../tokens/opacity";
import { iconography } from "../tokens/iconography";

interface DesignTokenContextValue {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  motion: typeof motion;
  zIndex: typeof zIndex;
  elevation: typeof elevation;
  opacity: typeof opacity;
  iconography: typeof iconography;
}

const DesignTokenContext = createContext<DesignTokenContextValue>({
  colors, typography, spacing, radius, shadows,
  motion, zIndex, elevation, opacity, iconography,
});

export function DesignTokenProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => ({
    colors, typography, spacing, radius, shadows,
    motion, zIndex, elevation, opacity, iconography,
  }), []);

  return (
    <DesignTokenContext.Provider value={value}>
      {children}
    </DesignTokenContext.Provider>
  );
}

export function useDesignTokens(): DesignTokenContextValue {
  return useContext(DesignTokenContext);
}

export function useColor(): DesignTokenContextValue["colors"] {
  return useContext(DesignTokenContext).colors;
}

export function useSpacing(): DesignTokenContextValue["spacing"] {
  return useContext(DesignTokenContext).spacing;
}

export function useTypography(): DesignTokenContextValue["typography"] {
  return useContext(DesignTokenContext).typography;
}
