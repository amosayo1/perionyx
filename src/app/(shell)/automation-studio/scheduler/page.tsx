import { redirect } from "next/navigation";
import { AutomationStudioService } from "@/modules/automation-studio/automation-studio.service";
import { SchedulerClient } from "@/components/automation-studio/scheduler-client";
import { ErrorBoundaryWrapper } from "@/components/ui/error-boundary-wrapper";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

const service = new AutomationStudioService();

export default async function SchedulerPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const schedules = await service.listSchedules(ctx.tenant);
  
    return <ErrorBoundaryWrapper><SchedulerClient schedules={schedules} /></ErrorBoundaryWrapper>;
  });
}
