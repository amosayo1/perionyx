import { PlatformLayout } from "@/components/platform/platform-layout";
import { PlatformHeader } from "@/components/platform/platform-header";
import { PlatformHealthOverview } from "@/components/platform/platform-health-overview";
import { ServiceHealthGrid } from "@/components/platform/service-health-grid";
import { BackgroundJobs } from "@/components/platform/background-jobs";
import { QueueMonitor } from "@/components/platform/queue-monitor";
import { IntegrationHealth } from "@/components/platform/integration-health";
import { WebhookMonitor } from "@/components/platform/webhook-monitor";
import { ScheduledTasks } from "@/components/platform/scheduled-tasks";
import { PlatformEvents } from "@/components/platform/platform-events";
import { QuickNavigation } from "@/components/platform/quick-navigation";

export default function PlatformPage() {
  return (
    <PlatformLayout>
      <PlatformHeader />
      <PlatformHealthOverview />
      <ServiceHealthGrid />
      <BackgroundJobs />
      <div className="grid gap-8 lg:grid-cols-2">
        <QueueMonitor />
        <ScheduledTasks />
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <IntegrationHealth />
        <WebhookMonitor />
      </div>
      <PlatformEvents />
      <QuickNavigation />
    </PlatformLayout>
  );
}
