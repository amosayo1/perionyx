"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function TenantGate({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;
    if (pathname?.startsWith("/onboarding")) return;
    if (!session?.user?.activeCompanyId) {
      router.replace("/onboarding");
    }
  }, [status, session?.user?.activeCompanyId, pathname, router]);

  if (status === "loading" || status === "unauthenticated") {
    return <>{children}</>;
  }

  if (status === "authenticated" && !session?.user?.activeCompanyId && !pathname?.startsWith("/onboarding")) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
