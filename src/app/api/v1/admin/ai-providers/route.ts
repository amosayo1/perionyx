import { z } from "zod";
import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { aiProviderRegistry } from "@/modules/ai-provider/registry";
import { modelRegistry } from "@/modules/ai-provider/model-registry";
import { providerHealthMonitor } from "@/modules/ai-provider/health";
import { getUsageSummary } from "@/modules/ai-provider/usage";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const AiProviderActionSchema = z.object({
  action: z.enum(["set-active", "test-connection"]),
  providerKind: z.string().min(1).max(64).optional(),
  model: z.string().max(128).optional(),
});

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.settings');
  
      if (ctx.tenant.role !== "OWNER" && ctx.tenant.role !== "ADMIN") {
        return new Response(JSON.stringify({ error: { code: "FORBIDDEN", message: "Admin access required" } }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
  
      const activeProviders = await aiProviderRegistry.getActiveProviders();
      const allModels = modelRegistry.getAll();
      const healthHistory: Record<string, unknown[]> = {};
  
      for (const p of activeProviders) {
        healthHistory[p.kind] = await providerHealthMonitor.getHealthHistory(p.kind, 10);
      }
  
      const usage = await getUsageSummary(ctx.tenant.companyId);
  
      return new Response(
        JSON.stringify({
          providers: activeProviders,
          models: allModels,
          healthHistory,
          usage,
          activeProviderKind: await aiProviderRegistry.getActiveKind(),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
  
      if (ctx.tenant.role !== "OWNER" && ctx.tenant.role !== "ADMIN") {
        return new Response(JSON.stringify({ error: { code: "FORBIDDEN", message: "Owner or admin access required" } }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
  
      const rawBody = await request.json();
      const parsed = AiProviderActionSchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json({ error: { code: "VALIDATION", message: parsed.error.issues[0].message } }, { status: 400 });
      }
      const { action, providerKind } = parsed.data;
  
      switch (action) {
        case "set-active": {
          if (!providerKind) {
            return new Response(JSON.stringify({ error: { code: "VALIDATION", message: "providerKind is required" } }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }
          aiProviderRegistry.setActive(providerKind as any);
          break;
        }
  
        case "test-connection": {
          if (!providerKind) {
            return new Response(JSON.stringify({ error: { code: "VALIDATION", message: "providerKind is required" } }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }
          const provider = aiProviderRegistry.get(providerKind as any);
          if (!provider) {
            return new Response(JSON.stringify({ error: { code: "NOT_FOUND", message: `Provider ${providerKind} not found` } }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }
          const health = await provider.healthCheck();
          return new Response(JSON.stringify({ health }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
  
        default:
          return new Response(JSON.stringify({ error: { code: "VALIDATION", message: `Unknown action: ${action}` } }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
      }
  
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
