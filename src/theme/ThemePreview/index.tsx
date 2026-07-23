"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ThemeConfig, ThemeMode, ThemePreviewState } from "../types";
import { compileTheme, injectTheme } from "../ThemeCompiler";
import { getCurrentTheme, setCurrentTheme } from "../ThemeEngine";
import { generateThemeFromAccent } from "../ColorGenerator";
import { validateTheme } from "../ThemeValidator";
import type { ThemeValidationResult } from "../types";

export function useThemePreview() {
  const [state, setState] = useState<ThemePreviewState>({
    active: false,
    previewTheme: null,
    originalTheme: null,
  });

  const cleanupRef = useRef<(() => void) | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const stopPreview = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    const original = stateRef.current.originalTheme;
    if (original) {
      const css = compileTheme(original);
      injectTheme(css);
    }
    setState({ active: false, previewTheme: null, originalTheme: null });
  }, []);

  const applyPreview = useCallback(() => {
    const preview = stateRef.current.previewTheme;
    if (preview) {
      setCurrentTheme(preview as ThemeConfig);
    }
    stopPreview();
  }, [stopPreview]);

  const startPreview = useCallback(
    (overrides: Partial<ThemeConfig>, baseTheme?: ThemeConfig) => {
      const base = baseTheme || getCurrentTheme();
      const merged: ThemeConfig = {
        ...base,
        ...overrides,
        id: (overrides.id || base.id) as string,
        name: overrides.name || base.name,
        mode: overrides.mode || base.mode,
        category: overrides.category || base.category,
        accent: { ...base.accent, ...overrides.accent },
        backgrounds: { ...base.backgrounds, ...overrides.backgrounds },
        borders: { ...base.borders, ...overrides.borders },
        text: { ...base.text, ...overrides.text },
        status: { ...base.status, ...overrides.status },
        charts: {
          ...base.charts,
          ...overrides.charts,
          colors: overrides.charts?.colors || base.charts.colors,
        },
        shadows: { ...base.shadows, ...overrides.shadows },
        typography: { ...base.typography, ...overrides.typography },
        borderRadius: overrides.borderRadius || base.borderRadius,
      };

      const css = compileTheme(merged);
      if (cleanupRef.current) cleanupRef.current();
      cleanupRef.current = injectTheme(css);

      setState({
        active: true,
        previewTheme: merged,
        originalTheme: base,
      });
    },
    [],
  );

  const startAccentPreview = useCallback(
    (accent: string, mode: ThemeMode) => {
      const generated = generateThemeFromAccent(accent, mode, "Preview");
      startPreview(generated, getCurrentTheme());
    },
    [startPreview],
  );

  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  const validation: ThemeValidationResult | null = state.previewTheme
    ? validateTheme(state.previewTheme)
    : null;

  return {
    ...state,
    validation,
    startPreview,
    startAccentPreview,
    applyPreview,
    stopPreview,
  };
}
