import { NextResponse } from "next/server";
import { OnboardingService } from "@/modules/onboarding";
import { handleRouteError } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'onboarding.manage');
  
      const onboardingService = new OnboardingService();
  
      const existing = onboardingService.getSessionByCompany(ctx.tenant.companyId);
      if (existing) {
        const started = await onboardingService.startSession(existing.id).catch(() => null);
        if (started) {
          return NextResponse.json({ sessionId: started.id, status: started.status });
        }
        return NextResponse.json({ sessionId: existing.id, status: existing.status });
      }
  
      const created = onboardingService.createSession({ companyId: ctx.tenant.companyId }, ctx.tenant);
      const started = await onboardingService.startSession(created.id);
  
      return NextResponse.json({ sessionId: started.id, status: started.status });
    } catch (err) {
      return handleRouteError(err, request);
    }
  });
}
