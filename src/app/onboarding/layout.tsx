import { auth } from "@/server/auth/auth";
import { readJsonIfOk, serverFetch } from "@/lib/server-fetch";
import { redirect } from "next/navigation";
import { OnboardingHeader } from "./onboarding-header";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const res = await serverFetch("/api/v1/companies");
  const body = await readJsonIfOk<{ items: unknown[] }>(res);
  const membershipCount = body?.items?.length ?? 0;

  if (membershipCount > 0) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-perionyx-bg-primary text-perionyx-text-primary">
      <OnboardingHeader />
      {children}
    </div>
  );
}
