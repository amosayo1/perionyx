import { auth } from "@/server/auth/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { prisma } from "@/server/db/prisma";
import { AppShell } from "@/components/app-shell";

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const membershipCount = await prisma.companyMembership.count({
    where: { userId: session.user.id },
  });

  if (membershipCount === 0) {
    redirect("/onboarding");
  }

  return (
    <SessionProvider>
      <AppShell userEmail={session.user.email} userName={session.user.name}>
        {children}
      </AppShell>
    </SessionProvider>
  );
}
