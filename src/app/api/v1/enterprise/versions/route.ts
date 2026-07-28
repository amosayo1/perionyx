import { NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { getVersions, recordVersion, SUPPORTED_ENTITY_TYPES } from "@/modules/version-history/version-history";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const querySchema = z.object({
  entityType: z.string().min(1, "entityType is required"),
  entityId: z.string().min(1, "entityId is required"),
});

const createSchema = z.object({
  entityType: z.enum(["Transaction", "LedgerEntry", "TransactionApproval", "Policy", "RiskIncident", "TreasuryAccount"]),
  entityId: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
  changeType: z.enum(["CREATE", "UPDATE", "DELETE"]).default("UPDATE"),
  changedFields: z.array(z.string()).default([]),
});

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'analytics.read');
      const url = new URL(request.url);
  
      const parsed = querySchema.safeParse({
        entityType: url.searchParams.get("entityType"),
        entityId: url.searchParams.get("entityId"),
      });
      if (!parsed.success) return zodErrorResponse(parsed.error);
  
      const { entityType, entityId } = parsed.data;
      const versions = await getVersions(ctx.tenant, entityType, entityId);
  
      return NextResponse.json({
        items: versions,
        total: versions.length,
        entityType,
        entityId,
        supportedTypes: SUPPORTED_ENTITY_TYPES,
      });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const raw = await parseJsonBody<unknown>(request);
      const parsed = createSchema.safeParse(raw);
      if (!parsed.success) return zodErrorResponse(parsed.error);
  
      const { entityType, entityId, data, changeType, changedFields } = parsed.data;
      const version = await recordVersion(ctx.tenant, entityType, entityId, data, changeType, changedFields);
  
      return NextResponse.json(version, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) return zodErrorResponse(error);
      return handleRouteError(error);
    }
  });
}
