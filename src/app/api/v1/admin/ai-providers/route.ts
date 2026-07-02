import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { aiProviderRegistry } from "@/modules/ai-provider/registry";
import { modelRegistry } from "@/modules/ai-provider/model-registry";
import { providerHealthMonitor } from "@/modules/ai-provider/health";
import { getUsageSummary } from "@/modules/ai-provider/usage";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") {
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

    const usage = await getUsageSummary(ctx.companyId);

    return new Response(
      JSON.stringify({
        providers: activeProviders,
        models: allModels,
        healthHistory,
        usage,
        activeProviderKind: aiProviderRegistry.getActiveKind(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") {
      return new Response(JSON.stringify({ error: { code: "FORBIDDEN", message: "Owner or admin access required" } }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = (await request.json()) as { action: string; providerKind?: string; model?: string };
    const { action, providerKind, model } = body;

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
}
