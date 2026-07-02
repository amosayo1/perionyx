import { recommendedActions } from "./data";
import { ActionCard } from "./action-card";

export function RecommendedActions() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Recommended Actions</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Prompted actions based on current platform state</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {recommendedActions.map((ra) => (
          <ActionCard key={ra.id} action={ra} />
        ))}
      </div>
    </div>
  );
}
