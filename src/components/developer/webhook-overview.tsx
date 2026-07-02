import { webhookCategories } from "./data";
import { WebhookCategoryCard } from "./webhook-category-card";

export function WebhookOverview() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Webhook Overview</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Real-time event notifications organized by category</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {webhookCategories.map((cat) => (
          <WebhookCategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
}
