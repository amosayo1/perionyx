import Link from "next/link";
import { Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unauthorized",
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
          <Shield className="h-8 w-8 text-amber-400" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Access denied</h1>
        <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
          You don&apos;t have permission to access this page. Contact your administrator.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#d4af37]/10 px-4 py-2.5 text-sm font-medium text-[#d4af37] border border-[#d4af37]/20 transition-all hover:bg-[#d4af37]/20"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
