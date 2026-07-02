import { apiEndpoints } from "./data";
import { ApiCard } from "./api-card";

export function ApiOverview() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">API Overview</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Available REST APIs for integrating with PERIONYX</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {apiEndpoints.map((api) => (
          <ApiCard key={api.id} api={api} />
        ))}
      </div>
    </div>
  );
}
