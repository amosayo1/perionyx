import { OperationsHeader } from "@/components/operations/operations-header";
import { HealthOverview } from "@/components/operations/health-overview";
import { AttentionQueue } from "@/components/operations/attention-queue";
import { OperationsGrid } from "@/components/operations/operations-grid";
import { QueueCard } from "@/components/operations/queue-card";
import { ServiceStatusCard } from "@/components/operations/service-status-card";
import { RecentActivity } from "@/components/operations/recent-activity";
import { QuickActions } from "@/components/operations/quick-actions";
import { IncidentMetrics } from "@/components/incidents/incident-metrics";
import { queueCards, serviceCards } from "@/components/operations/data";

export default function OperationsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <OperationsHeader />

      {/* Health Overview */}
      <HealthOverview />

      {/* Incident Metrics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Incident Overview</h2>
          <a
            href="/operations/incidents"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            View All Incidents →
          </a>
        </div>
        <IncidentMetrics />
      </div>

      {/* Attention Queue */}
      <AttentionQueue />

      {/* Operations Grid — Queues + Services */}
      <OperationsGrid
        left={
          <>
            <h2 className="text-sm font-medium text-zinc-400">Active Queues</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {queueCards.map((card) => (
                <QueueCard key={card.id} card={card} />
              ))}
            </div>
          </>
        }
        right={
          <>
            <h2 className="text-sm font-medium text-zinc-400">Service Status</h2>
            <div className="grid gap-2">
              {serviceCards.map((service) => (
                <ServiceStatusCard key={service.id} service={service} />
              ))}
            </div>
          </>
        }
      />

      {/* Bottom Row — Activity + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <RecentActivity />
        <QuickActions />
      </div>
    </div>
  );
}
