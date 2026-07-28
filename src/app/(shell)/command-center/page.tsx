import { redirect } from "next/navigation";
import { CommandCenterService } from "@/modules/command-center/command-center.service";
import { CommandCenterClient } from "./command-center-client";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function CommandCenterPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const service = new CommandCenterService();
    const data = await service.getData(ctx.tenant);
  
    return <CommandCenterClient data={data} />;
  });
}
