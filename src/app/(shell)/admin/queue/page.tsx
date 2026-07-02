"use client";

import { useEffect, useState } from "react";

type QueueStat = {
  name: string;
  queued: number;
  active: number;
  deferred: number;
  total: number;
  capturedOn: string | null;
};

type QueueStats = {
  queues: QueueStat[];
};

export default function AdminQueuePage() {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/v1/queue/stats", { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <h1 className="text-2xl font-bold text-perionyx-text-primary">Queue Workers</h1>

      {loading && <p className="text-perionyx-text-muted">Loading queue stats...</p>}

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.queues.map((q) => {
            return (
              <div
                key={q.name}
                className="rounded-[20px] border border-[rgba(212,175,55,0.10)] bg-[rgba(255,255,255,0.02)] px-6 py-4 shadow-[0_4px_24px_rgba(212,175,55,0.06)]"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-perionyx-text-primary">{q.name}</h3>
                  <span className="text-xs text-perionyx-text-muted">{q.total} total</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-perionyx-text-muted">
                  <div>Queued: <span className="text-perionyx-text-primary">{q.queued}</span></div>
                  <div>Active: <span className="text-perionyx-text-primary">{q.active}</span></div>
                  <div>Deferred: <span className="text-yellow-400">{q.deferred}</span></div>
                  <div>Captured: <span className="text-perionyx-text-muted">{q.capturedOn ? new Date(q.capturedOn).toLocaleString() : "-"}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && stats?.queues.length === 0 && (
        <p className="text-perionyx-text-muted">No queues registered.</p>
      )}
    </div>
  );
}
