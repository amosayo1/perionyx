import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { WorkQueuePageClient } from "@/components/work-queue/work-queue-page-client";

export default async function WorkQueuePage() {
  const session = await auth();
  if (!session?.user?.activeCompanyId) redirect("/onboarding");

  return <WorkQueuePageClient companyId={session.user.activeCompanyId} />;
}
