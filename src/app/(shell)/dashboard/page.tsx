import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { DashboardPageClient } from "@/components/dashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.activeCompanyId) redirect("/onboarding");

  return <DashboardPageClient />;
}
