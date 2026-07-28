import { NextResponse } from "next/server";
import {
  relationshipIntelligenceService,
  painPointService,
  voiceOfCustomerService,
  productDiscoveryService,
  CRMService,
} from "@/modules/crm";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const [
        relationshipAnalytics,
        topPainPoints,
        fastestGrowingPainPoints,
        topFeatureRequests,
        mostCommonManualProcesses,
        discoveryProgress,
        topDesignPartners,
        mostValuableRelationships,
        mostActiveIndustries,
        relationshipFunnel,
        contactCount,
        interactionCount,
        opportunityCount,
      ] = await Promise.all([
        relationshipIntelligenceService.getRelationshipAnalytics(ctx.tenant.companyId),
        painPointService.getTopPainPoints(),
        painPointService.getFastestGrowingPainPoints(),
        voiceOfCustomerService.getTopFeatureRequests(),
        voiceOfCustomerService.getMostCommonManualProcesses(),
        relationshipIntelligenceService.getDiscoveryProgress(ctx.tenant.companyId),
        relationshipIntelligenceService.getTopDesignPartners(ctx.tenant.companyId),
        relationshipIntelligenceService.getMostValuableRelationships(ctx.tenant.companyId),
        relationshipIntelligenceService.getMostActiveIndustries(ctx.tenant.companyId),
        relationshipIntelligenceService.getRelationshipFunnel(ctx.tenant.companyId),
        new CRMService().getAllContacts(ctx.tenant.companyId).then((c) => c.length),
        new CRMService().getAllInteractions(ctx.tenant.companyId).then((i) => i.length),
        new CRMService().getAllOpportunities(ctx.tenant.companyId).then((o) => o.length),
      ]);
  
      return NextResponse.json(
        {
          relationshipAnalytics,
          topPainPoints,
          fastestGrowingPainPoints,
          topFeatureRequests,
          mostCommonManualProcesses,
          discoveryProgress,
          topDesignPartners,
          mostValuableRelationships,
          mostActiveIndustries,
          relationshipFunnel,
          counts: {
            contacts: contactCount,
            interactions: interactionCount,
            opportunities: opportunityCount,
          },
        },
        { headers: cacheHeaders(30) },
      );
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
