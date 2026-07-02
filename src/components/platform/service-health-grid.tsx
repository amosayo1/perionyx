import { platformServices } from "./data";
import { ServiceStatusCard } from "./service-status-card";

export function ServiceHealthGrid() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Core Services</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Health and latency of all enterprise platform services</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {platformServices.map((svc) => (
          <ServiceStatusCard key={svc.id} service={svc} />
        ))}
      </div>
    </div>
  );
}
