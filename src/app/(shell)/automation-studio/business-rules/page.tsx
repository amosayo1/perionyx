import { redirect } from "next/navigation";
import { AutomationStudioService } from "@/modules/automation-studio/automation-studio.service";
import { BusinessRulesClient } from "@/components/automation-studio/business-rules-client";
import { ErrorBoundaryWrapper } from "@/components/ui/error-boundary-wrapper";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

const service = new AutomationStudioService();

export default async function BusinessRulesPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const rules = await service.getBusinessRules(ctx.tenant);
  
    return <ErrorBoundaryWrapper><BusinessRulesClient rules={rules} /></ErrorBoundaryWrapper>;
  });
}
