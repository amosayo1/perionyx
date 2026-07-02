import { sdks } from "./data";
import { SdkCard } from "./sdk-card";

export function SdkCenter() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">SDK Center</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Official client libraries for building on PERIONYX</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sdks.map((sdk) => (
          <SdkCard key={sdk.id} sdk={sdk} />
        ))}
      </div>
    </div>
  );
}
