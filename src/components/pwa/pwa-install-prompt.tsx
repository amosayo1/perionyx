"use client";

import { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  if (!deferredPrompt || installed || dismissed) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-perionyx-bg-secondary border border-perionyx-border-primary rounded-xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-perionyx-accent/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-perionyx-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-perionyx-text-primary">
              Install PERIONYX
            </p>
            <p className="text-xs text-perionyx-text-secondary mt-0.5">
              Install the app for quick access and offline support
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleInstall}
            className="flex-1 h-9 rounded-lg bg-perionyx-accent text-perionyx-bg-primary text-sm font-medium hover:bg-perionyx-accent/90 transition-colors"
          >
            Install
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="h-9 px-3 rounded-lg text-sm text-perionyx-text-secondary hover:text-perionyx-text-primary transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
