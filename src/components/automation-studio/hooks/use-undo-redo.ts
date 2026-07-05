"use client";

import { useState, useCallback, useRef } from "react";

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(initial: T, maxHistory = 50) {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initial,
    future: [],
  });

  const skipRef = useRef(false);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const pushState = useCallback((newPresent: T) => {
    setState((prev) => {
      if (skipRef.current) {
        skipRef.current = false;
        return { ...prev, present: newPresent };
      }
      const past = [...prev.past.slice(-(maxHistory - 1)), prev.present];
      return { past, present: newPresent, future: [] };
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      const past = prev.past.slice(0, -1);
      skipRef.current = true;
      return { past, present: previous, future: [prev.present, ...prev.future] };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      const future = prev.future.slice(1);
      skipRef.current = true;
      return { past: [...prev.past, prev.present], present: next, future };
    });
  }, []);

  const reset = useCallback((newPresent: T) => {
    setState({ past: [], present: newPresent, future: [] });
  }, []);

  const replace = useCallback((newPresent: T) => {
    skipRef.current = true;
    setState((prev) => ({ ...prev, present: newPresent }));
  }, []);

  return {
    present: state.present,
    pushState,
    undo,
    redo,
    reset,
    replace,
    canUndo,
    canRedo,
    historySize: state.past.length,
  };
}
