"use client";

import { useState, useEffect } from "react";
import { SessionCard } from "./session-card";

type SessionData = { id: string; title: string; messageCount: number; updatedAt: string; };

export function RecentSessions() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/copilot/conversations")
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((d) => setSessions(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || sessions.length === 0) return null;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Recent AI Sessions</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Your previous conversations with PERIONYX Copilot</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sessions.slice(0, 4).map((s) => (
          <SessionCard key={s.id} session={{
            id: s.id,
            title: s.title,
            preview: `${s.messageCount} message(s)`,
            date: s.updatedAt,
            messageCount: s.messageCount,
          }} />
        ))}
      </div>
    </div>
  );
}
