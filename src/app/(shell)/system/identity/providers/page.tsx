import { identityFacade } from "@/server/identity";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";

export default function ProvidersPage() {
  const providers = identityFacade.providers.getAllProviders();

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Identity Providers"
        description={`${providers.length} identity providers configured`}
      />

      <div className="overflow-hidden rounded-xl border border-white/[0.06]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-zinc-900/60">
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Name</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Type</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Status</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Auto-Provision</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Allowed Domains</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Connections</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Updated</th>
            </tr>
          </thead>
          <tbody>
            {providers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-600">
                  No identity providers configured
                </td>
              </tr>
            )}
            {providers.map((provider) => {
              const connectionCount = identityFacade.providers.getConnectionsByProvider(provider.id).length;

              return (
                <tr key={provider.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-white">{provider.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300 uppercase">
                      {provider.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        provider.status === "active"
                          ? "bg-emerald-900/40 text-emerald-400"
                          : provider.status === "error"
                            ? "bg-rose-900/40 text-rose-400"
                            : provider.status === "configuring"
                              ? "bg-amber-900/40 text-amber-400"
                              : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {provider.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {provider.autoProvision
                      ? (
                        <span className="text-emerald-400">Enabled</span>
                      )
                      : (
                        <span className="text-zinc-500">Disabled</span>
                      )}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {provider.allowedDomains.length > 0
                      ? provider.allowedDomains.join(", ")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-zinc-200">{connectionCount}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {provider.updatedAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
