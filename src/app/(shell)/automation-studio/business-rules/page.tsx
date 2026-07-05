import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { AutomationStudioService } from "@/modules/automation-studio/automation-studio.service";
import { BusinessRulesClient } from "@/components/automation-studio/business-rules-client";
import { ErrorBoundaryWrapper } from "@/components/ui/error-boundary-wrapper";

const service = new AutomationStudioService();

export default async function BusinessRulesPage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const rules = await service.getBusinessRules(ctx);

  return <ErrorBoundaryWrapper><BusinessRulesClient rules={rules} /></ErrorBoundaryWrapper>;
}
