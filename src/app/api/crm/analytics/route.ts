import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import {
  relationshipIntelligenceService,
  painPointService,
  voiceOfCustomerService,
  productDiscoveryService,
  CRMService,
} from "@/modules/crm";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

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
      relationshipIntelligenceService.getRelationshipAnalytics(ctx.companyId),
      painPointService.getTopPainPoints(),
      painPointService.getFastestGrowingPainPoints(),
      voiceOfCustomerService.getTopFeatureRequests(),
      voiceOfCustomerService.getMostCommonManualProcesses(),
      relationshipIntelligenceService.getDiscoveryProgress(ctx.companyId),
      relationshipIntelligenceService.getTopDesignPartners(ctx.companyId),
      relationshipIntelligenceService.getMostValuableRelationships(ctx.companyId),
      relationshipIntelligenceService.getMostActiveIndustries(ctx.companyId),
      relationshipIntelligenceService.getRelationshipFunnel(ctx.companyId),
      new CRMService().getAllContacts(ctx.companyId).then((c) => c.length),
      new CRMService().getAllInteractions(ctx.companyId).then((i) => i.length),
      new CRMService().getAllOpportunities(ctx.companyId).then((o) => o.length),
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
}
