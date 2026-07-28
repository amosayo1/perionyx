import { connectorDiscovery } from "@/modules/connector-platform/discovery";
import { IntegrationLayout } from "@/components/integrations/integration-layout";
import { IntegrationHeader } from "@/components/integrations/integration-header";
import { IntegrationOverview } from "@/components/integrations/integration-overview";
import { IntegrationCategories } from "@/components/integrations/integration-categories";
import { IntegrationGrid } from "@/components/integrations/integration-grid";
import { ConnectionHealth } from "@/components/integrations/connection-health";
import { RecentSyncActivity } from "@/components/integrations/recent-sync-activity";
import { QuickNavigation } from "@/components/integrations/quick-navigation";
import {
  getIntegrationKpis,
  getIntegrationCategories,
  getConnectedIntegrations,
  getConnectionHealth,
  getRecentSyncActivity,
} from "@/components/integrations/data-service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function IntegrationsPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const [kpis, categories, integrations, healthGroups, syncEvents] = await Promise.all([
      getIntegrationKpis(ctx.tenant),
      getIntegrationCategories(ctx.tenant),
      getConnectedIntegrations(ctx.tenant),
      getConnectionHealth(ctx.tenant),
      getRecentSyncActivity(ctx.tenant),
    ]);
  
    const providers = connectorDiscovery.listSummaries();
  
    return (
      <IntegrationLayout>
        <IntegrationHeader providers={providers} />
        <IntegrationOverview kpis={kpis} />
        <IntegrationCategories categories={categories} />
        <IntegrationGrid integrations={integrations} />
        <div className="grid gap-8 lg:grid-cols-2">
          <ConnectionHealth groups={healthGroups} />
          <RecentSyncActivity events={syncEvents} />
        </div>
        <QuickNavigation />
      </IntegrationLayout>
    );
  });
}
