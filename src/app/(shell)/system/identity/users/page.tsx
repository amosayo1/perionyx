import { identityFacade } from "@/server/identity";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";

export default function UsersPage() {
  const users = identityFacade.provisioning.getAllProvisionedUsers();

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Users"
        description={`${users.length} provisioned users`}
      />

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search users…"
          className="w-full max-w-sm rounded-lg border border-white/[0.06] bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-[#d4a843]/40 focus:outline-none"
          readOnly
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.06]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-zinc-900/60">
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Name</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Email</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Source</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Status</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Department</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Roles</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Last Synced</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-600">
                  No users provisioned yet
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium text-white">
                  {user.displayName || `${user.firstName} ${user.lastName}`}
                </td>
                <td className="px-4 py-3 text-zinc-300">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300">
                    {user.source}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.status === "synced"
                        ? "bg-emerald-900/40 text-emerald-400"
                        : user.status === "pending"
                          ? "bg-amber-900/40 text-amber-400"
                          : user.status === "failed"
                            ? "bg-rose-900/40 text-rose-400"
                            : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400">{user.department ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.length > 0
                      ? user.roles.slice(0, 2).map((r) => (
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
                    {user.roles.length > 2 && (
                      <span className="text-xs text-zinc-500">+{user.roles.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {user.lastSyncedAt
                    ? user.lastSyncedAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
