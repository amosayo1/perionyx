import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { CommandCenterService } from "@/modules/command-center/command-center.service";
import { CommandCenterClient } from "./command-center-client";

export default async function CommandCenterPage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const service = new CommandCenterService();
  const data = await service.getData(ctx);

  return <CommandCenterClient data={data} />;
}
