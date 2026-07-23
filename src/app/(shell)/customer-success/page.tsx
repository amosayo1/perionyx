import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { Badge } from "@/components/ui/badge";

const PRIORITY_COLORS: Record<string, string> = {
  critical: "border-red-500/20 bg-red-500/10 text-red-400",
  high: "border-orange-500/20 bg-orange-500/10 text-orange-400",
  normal: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  low: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
};

const STATUS_COLORS: Record<string, string> = {
  open: "border-red-500/20 bg-red-500/10 text-red-400",
  in_progress: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  waiting: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  resolved: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  closed: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
};

const REQUEST_STATUS_COLORS: Record<string, string> = {
  submitted: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
  under_review: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  planned: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  in_progress: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  shipped: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  declined: "border-red-500/20 bg-red-500/10 text-red-400",
};

function serializeDates(obj: any, ...fields: string[]) {
  const result = { ...obj };
  for (const f of fields) {
    if (result[f] instanceof Date) result[f] = result[f].toISOString();
  }
  return result;
}

export default async function CustomerSuccessPage() {
  const session = await auth();
  if (!session?.user?.activeCompanyId) redirect("/onboarding");
  const ctx = requireTenantContext(session.user.id, session.user.activeCompanyId, session.user.companyRole);

  const [resources, featureRequests, supportTickets] = await Promise.all([
    prisma.customerSuccessResource.findMany({
      where: { companyId: ctx.companyId, isPublished: true },
      orderBy: { order: "asc" },
    }),
    prisma.featureRequest.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.supportTicket.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const serializedResources = resources.map((r: any) => serializeDates(r, "createdAt", "updatedAt"));
  const serializedRequests = featureRequests.map((r: any) => serializeDates(r, "createdAt", "updatedAt"));
  const serializedTickets = supportTickets.map((t: any) => serializeDates(t, "createdAt", "updatedAt"));

  const openTickets = serializedTickets.filter(
    (t: any) => t.status === "open" || t.status === "in_progress",
  );
  const shippedRequests = serializedRequests.filter((r: any) => r.status === "shipped");

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Customer Success Center"
        description="Resources, feature requests, and support"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Resources</p>
          <p className="mt-1 text-3xl font-bold text-white">{serializedResources.length}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Open Tickets</p>
          <p className="mt-1 text-3xl font-bold text-amber-400">{openTickets.length}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Features Shipped</p>
          <p className="mt-1 text-3xl font-bold text-emerald-400">{shippedRequests.length}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
            Resources
          </h3>
          <div className="space-y-2">
            {serializedResources.length === 0 ? (
              <p className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-4 text-sm text-zinc-500">
                No resources available yet
              </p>
            ) : (
              serializedResources.map((r: any) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/40 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">{r.title}</p>
                    {r.description && (
                      <p className="mt-0.5 text-xs text-zinc-500">{r.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-white/[0.06] bg-zinc-800 px-2 py-0.5 text-xs capitalize text-zinc-400">
                      {r.type?.replace(/_/g, " ")}
                    </span>
                    {r.url && (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded px-2 py-1 text-xs text-amber-400 transition-colors hover:text-amber-300"
                      >
                        Open
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
            Recent Tickets
          </h3>
          <div className="space-y-2">
            {serializedTickets.length === 0 ? (
              <p className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-4 text-sm text-zinc-500">
                No support tickets
              </p>
            ) : (
              serializedTickets.slice(0, 10).map((t: any) => (
                <div
                  key={t.id}
                  className="rounded-lg border border-white/[0.06] bg-zinc-900/40 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">{t.subject}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        PRIORITY_COLORS[t.priority] ?? PRIORITY_COLORS.normal
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        STATUS_COLORS[t.status] ?? STATUS_COLORS.open
                      }`}
                    >
                      {t.status.replace(/_/g, " ")}
                    </span>
                    {t.category && (
                      <span className="text-xs text-zinc-500">{t.category}</span>
                    )}
                    <span className="text-xs text-zinc-500">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section>
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Feature Requests
        </h3>
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-zinc-900/60">
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Title</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Category</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Status</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-400">Votes</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {serializedRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                    No feature requests yet
                  </td>
                </tr>
              ) : (
                serializedRequests.map((r: any) => (
                  <tr key={r.id} className="border-b border-white/[0.06] last:border-0">
                    <td className="px-4 py-3 font-medium text-white">{r.title}</td>
                    <td className="px-4 py-3">
                      {r.category && (
                        <span className="rounded-full border border-white/[0.06] bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                          {r.category}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          REQUEST_STATUS_COLORS[r.status] ?? REQUEST_STATUS_COLORS.submitted
                        }`}
                      >
                        {r.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-300">{r.votes}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </PageContainer>
  );
}
