"use client";

import { useState } from "react";
import { platformEvents } from "./data";
import { PlatformEventItem } from "./platform-event-item";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export function PlatformEvents() {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? platformEvents : platformEvents.slice(0, 5);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Platform Events</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Recent platform events, deployments, and service changes</p>
        </div>
        {platformEvents.length > 5 && (
          <Button variant="ghost" size="sm" className="gap-1 text-xs text-zinc-500" onClick={() => setShowAll(!showAll)}>
            {showAll ? <>Show Less <ChevronUp className="h-3 w-3" /></> : <>Show All ({platformEvents.length}) <ChevronDown className="h-3 w-3" /></>}
          </Button>
        )}
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 divide-y divide-white/[0.04]">
        {displayed.map((evt) => (
          <PlatformEventItem key={evt.id} event={evt} />
        ))}
      </div>
    </div>
  );
}
