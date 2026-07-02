"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/dashboard/EmptyState";


type Preference = {
  id: string;
  eventType: string;
  channelId: string | null;
  channelName: string | null;
  channelType: string | null;
  enabled: boolean;
};

export default function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/notifications/preferences", { credentials: "include", signal });
      if (signal?.aborted) return;
      const body = (await res.json()) as { items: Preference[] };
      setPrefs(body.items ?? []);
    } catch {
      // ignore
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => {
      void load(ac.signal).then(() => {
        // If no prefs exist, create defaults
        fetch("/api/v1/notifications/preferences", { method: "POST", credentials: "include" })
          .then(() => void load(ac.signal));
      });
    });
    return () => ac.abort();
  }, [load]);

  const togglePref = useCallback(async (pref: Preference) => {
    const newEnabled = !pref.enabled;
    setPrefs((prev) => prev.map((p) => (p.id === pref.id ? { ...p, enabled: newEnabled } : p)));
    await fetch("/api/v1/notifications/preferences", {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: pref.id, enabled: newEnabled }),
    });
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Notification Preferences</h1>
        <p className="mt-1 text-sm text-perionyx-text-muted">Choose which events trigger notifications.</p>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Event Preferences</CardTitle>
          <CardDescription className="text-perionyx-text-muted">
            Toggle notifications for each event type.
            {prefs.length === 0 && " Default preferences will be created automatically."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : prefs.length === 0 ? (
            <EmptyState title="No preferences" description="Creating default preferences..." />
          ) : (
            <div className="divide-y divide-[rgba(255,255,255,0.06)]">
              {prefs.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-perionyx-text-primary">
                        {p.eventType.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                      {p.channelName && (
                        <Badge variant="outline" className="text-[10px]">
                          {p.channelName} ({p.channelType})
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={p.enabled}
                    onCheckedChange={() => void togglePref(p)}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Channels</CardTitle>
          <CardDescription className="text-perionyx-text-muted">
            Configure channels (Slack, Email) from Settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-perionyx-text-muted">
            To set up Slack or Email notifications, go to{" "}
            <a href="/settings" className="text-perionyx-gold hover:underline">Settings → Channels</a>.
            In-app notifications are enabled by default.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
