"use client";

import { useState, useEffect, useCallback } from "react";

export interface PushNotificationState {
  permission: NotificationPermission;
  subscribed: boolean;
  subscription: PushSubscription | null;
  loading: boolean;
  error: string | null;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const array = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    array[i] = rawData.charCodeAt(i);
  }
  return array;
}

export function usePushNotifications(publicVapidKey?: string) {
  const [state, setState] = useState<PushNotificationState>({
    permission: "default",
    subscribed: false,
    subscription: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if ("Notification" in window) {
      setState((s) => ({ ...s, permission: Notification.permission }));
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setState((s) => ({ ...s, permission }));
  }, []);

  const subscribe = useCallback(async () => {
    if (!publicVapidKey || !("serviceWorker" in navigator)) {
      setState((s) => ({ ...s, error: "Push notifications not available" }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey) as unknown as string,
      });

      await fetch("/api/push/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      setState((s) => ({
        ...s,
        subscribed: true,
        subscription,
        loading: false,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: "Failed to subscribe to push notifications",
        loading: false,
      }));
    }
  }, [publicVapidKey]);

  const unsubscribe = useCallback(async () => {
    if (!state.subscription) return;

    setState((s) => ({ ...s, loading: true }));

    try {
      await state.subscription.unsubscribe();

      await fetch("/api/push/unregister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: state.subscription.endpoint,
        }),
      });

      setState((s) => ({
        ...s,
        subscribed: false,
        subscription: null,
        loading: false,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: "Failed to unsubscribe",
        loading: false,
      }));
    }
  }, [state.subscription]);

  return { ...state, requestPermission, subscribe, unsubscribe };
}
