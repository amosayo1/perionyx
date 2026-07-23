"use client";

// ---------------------------------------------------------------------------
// Real-Time Connection Status Indicator
// ---------------------------------------------------------------------------
// Shows green/amber/red dot indicating SSE connection health.

import { useState } from "react";
import { useRealtime } from "@/hooks/use-realtime";

export function RealtimeStatus() {
  const { connected } = useRealtime({
    channels: ["system"],
  });

  const color = connected ? "bg-green-500" : "bg-amber-500";
  const label = connected ? "Live" : "Reconnecting";

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}
