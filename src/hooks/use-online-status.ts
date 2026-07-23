"use client";

import { useEffect, useState } from "react";

export type ConnectionQuality = "online" | "offline" | "slow";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [quality, setQuality] = useState<ConnectionQuality>("online");

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setQuality("online");
    };
    const handleOffline = () => {
      setIsOnline(false);
      setQuality("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, quality };
}
