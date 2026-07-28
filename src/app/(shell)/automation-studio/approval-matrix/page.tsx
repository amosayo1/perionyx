import { redirect } from "next/navigation";
import { AutomationStudioService } from "@/modules/automation-studio/automation-studio.service";
import { ApprovalMatrixClient } from "@/components/automation-studio/approval-matrix-client";
import { ErrorBoundaryWrapper } from "@/components/ui/error-boundary-wrapper";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

const service = new AutomationStudioService();

export default async function ApprovalMatrixPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const rules = await service.getApprovalMatrixRules(ctx.tenant);
  
    return <ErrorBoundaryWrapper><ApprovalMatrixClient rules={rules} /></ErrorBoundaryWrapper>;
  });
}
