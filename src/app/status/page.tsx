import type { Metadata } from "next";
import { Activity } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "System Status",
};

export default function StatusPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-white/[0.06]">
          <Activity className="h-5 w-5 text-zinc-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">System Status</h1>
          <p className="text-sm text-zinc-500">All systems operational</p>
        </div>
      </div>
      <div className="space-y-3">
        {[
          { name: "API", status: "Operational", color: "text-[#d4af37]" },
          { name: "Dashboard", status: "Operational", color: "text-[#d4af37]" },
          { name: "Transactions", status: "Operational", color: "text-[#d4af37]" },
          { name: "Payments", status: "Operational", color: "text-[#d4af37]" },
          { name: "Ledger", status: "Operational", color: "text-[#d4af37]" },
          { name: "Approvals", status: "Operational", color: "text-[#d4af37]" },
          { name: "Platform Health", status: "Operational", color: "text-[#d4af37]" },
          { name: "Integrations", status: "Operational", color: "text-[#d4af37]" },
          { name: "Developer Portal", status: "Operational", color: "text-[#d4af37]" },
        ].map((s) => (
          <div
            key={s.name}
            className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-zinc-900/40 px-4 py-3"
          >
            <span className="text-sm font-medium text-zinc-300">{s.name}</span>
            <span className={`text-xs font-semibold ${s.color}`}>{s.status}</span>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
        <p className="text-sm text-zinc-400">
          <span className="text-[#d4af37] font-semibold">100%</span> uptime over the last 90 days
        </p>
        <p className="text-xs text-zinc-600 mt-1">
          Last incident resolved 14 days ago. Average response time: 2 minutes.
        </p>
      </div>
      <div className="mt-12 pt-8 border-t border-white/[0.06]">
        <Link href="/dashboard" className="text-sm text-[#d4af37] hover:text-[#d4af37] transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
