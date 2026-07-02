import { developerResources } from "./data";
import { ResourceCard } from "./resource-card";

export function DeveloperResources() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Developer Resources</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Documentation, guides, and tools for building on PERIONYX</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {developerResources.map((res) => (
          <ResourceCard key={res.id} resource={res} />
        ))}
      </div>
    </div>
  );
}
