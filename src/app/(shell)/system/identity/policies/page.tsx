import { identityFacade } from "@/server/identity";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";

export default function PoliciesPage() {
  const policies = identityFacade.policies.getAllPolicies();

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Security Policies"
        description={`${policies.length} security policies configured`}
      />

      <div className="overflow-hidden rounded-xl border border-white/[0.06]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-zinc-900/60">
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Name</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Description</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Category</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Priority</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Status</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Updated</th>
            </tr>
          </thead>
          <tbody>
            {policies.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-zinc-600">
                  No security policies defined
                </td>
              </tr>
            )}
            {policies.map((policy) => (
              <tr key={policy.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium text-white">{policy.name}</td>
                <td className="px-4 py-3 text-zinc-400 max-w-sm truncate">
                  {policy.description || "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium capitalize text-zinc-300">
                    {policy.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-zinc-200">{policy.priority}</span>
                </td>
                <td className="px-4 py-3">
                  {policy.enabled
                    ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-900/40 px-2 py-0.5 text-xs font-medium text-emerald-400">
                        Enabled
                      </span>
                    )
                    : (
                      <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-500">
                        Disabled
                      </span>
                    )}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {policy.updatedAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
