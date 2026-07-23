"use client";

import { useEffect } from "react";
import { useServiceWorker } from "@/hooks/use-service-worker";
import { PwaInstallPrompt } from "./pwa-install-prompt";

export function PwaManager() {
  useServiceWorker("/sw.js");

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) {
          reg.update();
        }
      });
    }
  }, []);

  return <PwaInstallPrompt />;
}
