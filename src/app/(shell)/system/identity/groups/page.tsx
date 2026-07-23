import { identityFacade } from "@/server/identity";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";

export default function GroupsPage() {
  const groups = identityFacade.groups.getAllGroups();

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Groups"
        description={`${groups.length} identity groups`}
      />

      <div className="overflow-hidden rounded-xl border border-white/[0.06]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-zinc-900/60">
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Name</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Description</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Source</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Members</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Roles</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Created</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-zinc-600">
                  No groups defined yet
                </td>
              </tr>
            )}
            {groups.map((group) => (
              <tr key={group.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium text-white">{group.name}</td>
                <td className="px-4 py-3 text-zinc-400 max-w-xs truncate">
                  {group.description ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {group.source
                    ? (
                      <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300">
                        {group.source}
                      </span>
                    )
                    : <span className="text-zinc-600">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-zinc-200">{group.memberCount}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {group.roles.length > 0
                      ? group.roles.slice(0, 3).map((r) => (
                          <span
                            key={r}
                            className="inline-flex items-center rounded-full bg-violet-900/40 px-2 py-0.5 text-xs font-medium text-violet-400"
                          >
                            {r}
                          </span>
                        ))
                      : (
                        <span className="text-zinc-600">—</span>
                      )}
                    {group.roles.length > 3 && (
                      <span className="text-xs text-zinc-500">+{group.roles.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {group.createdAt.toLocaleDateString("en-US", {
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
