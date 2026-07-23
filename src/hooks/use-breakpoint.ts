"use client";

import { useEffect, useState } from "react";

export type Breakpoint = "phone" | "tablet" | "laptop" | "desktop" | "ultrawide";

const QUERIES: Record<Breakpoint, string> = {
  phone: "(max-width: 639px)",
  tablet: "(min-width: 640px) and (max-width: 1023px)",
  laptop: "(min-width: 1024px) and (max-width: 1279px)",
  desktop: "(min-width: 1280px) and (max-width: 1919px)",
  ultrawide: "(min-width: 1920px)",
};

const ORDER: Breakpoint[] = ["phone", "tablet", "laptop", "desktop", "ultrawide"];

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");

  useEffect(() => {
    const mqls = ORDER.map((bp) => {
      const mql = window.matchMedia(QUERIES[bp]);
      const handler = () => {
        if (mql.matches) setBreakpoint(bp);
      };
      mql.addEventListener("change", handler);
      if (mql.matches) setBreakpoint(bp);
      return { mql, handler };
    });
    return () => {
      for (const { mql, handler } of mqls) mql.removeEventListener("change", handler);
    };
  }, []);

  return breakpoint;
}

export function useIsMobile(): boolean {
  const bp = useBreakpoint();
  return bp === "phone";
}

export function useIsTablet(): boolean {
  const bp = useBreakpoint();
  return bp === "tablet";
}

export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  return isTouch;
}
