"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "perionyx-a11y-sr";

export function useScreenReader(): { optimized: boolean; toggle: () => void } {
  const [optimized, setOptimized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setOptimized(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const toggle = useCallback(() => {
    setOptimized((prev) => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return { optimized, toggle };
}

export function SrOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

export function AriaStatus({ message, id }: { message: string; id?: string }) {
  return (
    <div
      id={id ?? "aria-status"}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

export function AriaAlert({ message, id }: { message: string; id?: string }) {
  return (
    <div
      id={id ?? "aria-alert"}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

export function AriaRegion({
  children,
  label,
  id,
}: {
  children: React.ReactNode;
  label: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      role="region"
      aria-label={label}
      className="sr-only"
    >
      {children}
    </div>
  );
}
