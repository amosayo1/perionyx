import { webhookEndpoints } from "./data";
import { WebhookCard } from "./webhook-card";

export function WebhookMonitor() {
  const sorted = [...webhookEndpoints].sort((a, b) => {
    const order = { disconnected: 0, retrying: 1, warning: 2, connected: 3 };
    return (order[a.status] ?? 0) - (order[b.status] ?? 0);
  });

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Webhook Delivery</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Delivery success rates, retries, and latency for webhook endpoints</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {sorted.map((wh) => (
          <WebhookCard key={wh.id} webhook={wh} />
        ))}
      </div>
    </div>
  );
}
