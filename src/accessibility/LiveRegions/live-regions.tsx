"use client";

import { useCallback, useRef, useEffect, useState } from "react";

export type LiveRegionPriority = "polite" | "assertive";

interface QueuedAnnouncement {
  message: string;
  priority: LiveRegionPriority;
  id: number;
}

let globalId = 0;

export function useLiveRegion() {
  const [announcements, setAnnouncements] = useState<QueuedAnnouncement[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const announce = useCallback((message: string, priority: LiveRegionPriority = "polite") => {
    const id = ++globalId;
    setAnnouncements((prev) => [...prev, { message, priority, id }]);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setAnnouncements([]);
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { announcements, announce };
}

export function LiveRegion({ announcements }: { announcements: QueuedAnnouncement[] }) {
  const polite = announcements.filter((a) => a.priority === "polite").map((a) => a.message).join(". ");
  const assertive = announcements.filter((a) => a.priority === "assertive").map((a) => a.message).join(". ");

  return (
    <>
      <div
        id="a11y-live-polite"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {polite}
      </div>
      <div
        id="a11y-live-assertive"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertive}
      </div>
    </>
  );
}
