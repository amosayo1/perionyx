import { auth } from "@/server/auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { OnboardingHeader } from "./onboarding-header";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const membershipCount = await prisma.companyMembership.count({
    where: { userId: session.user.id },
  });

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
