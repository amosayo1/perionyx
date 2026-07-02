import { auth } from "@/server/auth/auth";
import { readJsonIfOk, serverFetch } from "@/lib/server-fetch";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const res = await serverFetch("/api/v1/companies");
  const body = await readJsonIfOk<{ items: unknown[] }>(res);
  const membershipCount = body?.items?.length ?? 0;

  if (membershipCount === 0) {
    redirect("/onboarding");
  }
  return (
    <AppShell userEmail={session.user.email} userName={session.user.name}>
      {children}
    </AppShell>
  );
}
