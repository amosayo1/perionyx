import { knowledgeSources } from "./data";
import { KnowledgeSourceCard } from "./knowledge-source-card";

export function KnowledgeSources() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Knowledge Sources</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Indexed workspaces available to PERIONYX Copilot</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="col-span-full">
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 divide-y divide-white/[0.04]">
            {knowledgeSources.map((ks) => (
              <KnowledgeSourceCard key={ks.id} source={ks} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
