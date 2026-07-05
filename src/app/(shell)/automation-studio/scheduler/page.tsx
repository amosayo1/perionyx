import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { AutomationStudioService } from "@/modules/automation-studio/automation-studio.service";
import { SchedulerClient } from "@/components/automation-studio/scheduler-client";
import { ErrorBoundaryWrapper } from "@/components/ui/error-boundary-wrapper";

const service = new AutomationStudioService();

export default async function SchedulerPage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const schedules = await service.listSchedules(ctx);

  return <ErrorBoundaryWrapper><SchedulerClient schedules={schedules} /></ErrorBoundaryWrapper>;
}
