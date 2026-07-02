import type { IntegrationCategory } from "./types";
import { IntegrationCategoryCard } from "./integration-category-card";

export function IntegrationCategories({ categories }: { categories: IntegrationCategory[] }) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Integration Categories</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Browse integrations by category</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((cat) => (
          <IntegrationCategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
}
