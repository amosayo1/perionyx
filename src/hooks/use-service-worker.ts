"use client";

import { useEffect, useState } from "react";

export interface ServiceWorkerState {
  registered: boolean;
  waiting: boolean;
  error: Error | null;
}

export function useServiceWorker(swPath = "/sw.js"): ServiceWorkerState {
  const [state, setState] = useState<ServiceWorkerState>({
    registered: false,
    waiting: false,
    error: null,
  });

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      setState((s) => ({ ...s, error: new Error("Service Worker not supported") }));
      return;
    }

    let active = true;

    const setup = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();

        const existingSW = await navigator.serviceWorker.getRegistration(swPath);
        if (existingSW && existingSW.active) {
          const swVersion = await getSWVersion(existingSW.active);
          const currentVersion = SW_CACHE_VERSION;
          if (swVersion && swVersion !== currentVersion) {
            await existingSW.unregister();
            window.location.reload();
            return;
          }
        }

        const registration = await navigator.serviceWorker.register(swPath, {
          scope: "/",
        });

        if (!active) return;

        setState({
          registered: true,
          waiting: !!registration.waiting,
          error: null,
        });

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && registration.active) {
                registration.waiting?.postMessage({ type: "SKIP_WAITING" });
              }
            });
          }
        });

        if (registration.active) {
          registration.active.addEventListener("statechange", () => {
            if (registration.active?.state === "activated") {
              setState((s) => ({ ...s, waiting: false }));
            }
          });
        }

        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (active) {
            window.location.reload();
          }
        });
      } catch (err) {
        if (active) {
          setState({ registered: false, waiting: false, error: err as Error });
        }
      }
    };

    setup();

    return () => {
      active = false;
    };
  }, [swPath]);

  return state;
}

const SW_CACHE_VERSION = "perionyx-v2";

async function getSWVersion(worker: ServiceWorker): Promise<string | null> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (e) => {
      resolve(e.data?.cacheVersion ?? null);
    };
    worker.postMessage({ type: "GET_VERSION" }, [channel.port2]);
    setTimeout(() => resolve(null), 500);
  });
}
