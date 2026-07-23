import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { CRMService } from "@/modules/crm";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";

const crmService = new CRMService();

const STAGE_COLORS: Record<string, string> = {
  "discovery-conversation": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "connected": "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
  "meeting-scheduled": "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "in-discussion": "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "evaluating": "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  "committed": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "partner": "text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/20",
  "active-product-discovery": "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  "active-engagement": "text-rose-400 bg-rose-500/10 border-rose-500/20",
  "warm-introduction": "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "discovery": "text-sky-400 bg-sky-500/10 border-sky-500/20",
};

function StageBadge({ stage }: { stage: string }) {
  const colors = STAGE_COLORS[stage] ?? "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium capitalize leading-4 ${colors}`}>
      {stage.replace(/-/g, " ")}
    </span>
  );
}

export default async function CrmContactsPage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const contacts = await crmService.getAllContacts(ctx.companyId).catch(() => []);

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Contacts"
        description="Relationship intelligence across your professional network"
      />

      <div className="rounded-2xl border border-white/[0.09] bg-[#101010]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">Name</th>
                <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">Role</th>
                <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">Company</th>
                <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">Stage</th>
                <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">Region</th>
                <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">Importance</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-medium text-white">{contact.name}</p>
                      {contact.isStrategicAdvisor && (
                        <span className="mt-0.5 inline-flex items-center gap-1 rounded bg-[#d4af37]/10 px-1.5 py-0.5 text-[10px] text-[#d4af37]">
                          Strategic Advisor
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-300">{contact.role}</td>
                  <td className="px-5 py-3.5 text-zinc-400">{contact.company ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <StageBadge stage={contact.relationshipStage} />
                  </td>
                  <td className="px-5 py-3.5 text-zinc-400">{contact.region ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    {contact.strategicImportance ? (
                      <span className={`text-xs font-medium capitalize ${
                        contact.strategicImportance === "critical" ? "text-rose-400" :
                        contact.strategicImportance === "high" ? "text-amber-400" :
                        contact.strategicImportance === "medium" ? "text-cyan-400" :
                        "text-zinc-500"
                      }`}>
                        {contact.strategicImportance}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <p className="text-sm text-zinc-500">No contacts found. Seed data to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3">
          <p className="text-xs text-zinc-500">{contacts.length} contact{contacts.length !== 1 ? "s" : ""}</p>
        </div>
      </div>
    </PageContainer>
  );
}
