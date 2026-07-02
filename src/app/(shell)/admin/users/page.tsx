"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { getErrorMessage } from "@/lib/client-api";
import { UserPlus, Mail, Clock, CheckCircle2, XCircle } from "lucide-react";

type User = {
  id: string;
  email: string;
  name?: string;
  userRoles: Array<{ role: { name: string; id: string } }>;
};

type Membership = {
  user: User;
  role: string;
};

type Role = {
  id: string;
  name: string;
};

type Invite = {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  invitedBy: { id: string; email: string; name: string | null };
};

export default function UsersPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const [usersRes, rolesRes, invitesRes] = await Promise.all([
        fetch("/api/v1/admin/users", { credentials: "include", signal }),
        fetch("/api/v1/admin/roles", { credentials: "include", signal }),
        fetch("/api/v1/admin/invites", { credentials: "include", signal }),
      ]);
      if (signal?.aborted) return;
      if (usersRes.ok) {
        const data = (await usersRes.json()) as { memberships: Membership[] };
        setMemberships(data.memberships || []);
      }
      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(Array.isArray(rolesData) ? rolesData : rolesData.roles || []);
      }
      if (invitesRes.ok) {
        const data = (await invitesRes.json()) as { invites: Invite[] };
        setInvites(data.invites || []);
      }
    } catch {
      //
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => void load(ac.signal));
    return () => ac.abort();
  }, [load]);

  const assignRole = async () => {
    if (!selectedUser || !selectedRoleId) return;
    setAssigning(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${selectedUser}/assign-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: selectedRoleId }),
      });
      if (res.ok) {
        setSelectedUser(null);
        setSelectedRoleId("");
        const ac = new AbortController();
        await load(ac.signal);
      }
    } catch {
      //
    } finally {
      setAssigning(false);
    }
  };

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(false);
    setInviting(true);
    try {
      const res = await fetch("/api/v1/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setInviteError(getErrorMessage(body) || "Failed to send invite");
        return;
      }
      setInviteSuccess(true);
      setInviteEmail("");
      setInviteRole("MEMBER");
      const ac = new AbortController();
      await load(ac.signal);
      setTimeout(() => setShowInviteModal(false), 1500);
    } catch {
      setInviteError("Something went wrong");
    } finally {
      setInviting(false);
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="h-3.5 w-3.5 text-yellow-400" />;
      case "ACCEPTED": return <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />;
      case "EXPIRED":
      case "CANCELLED": return <XCircle className="h-3.5 w-3.5 text-red-400" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-perionyx-text-primary">User Management</h1>
          <p className="mt-2 text-sm text-perionyx-text-muted">Manage members, roles, and invitations.</p>
        </div>
        <Button onClick={() => setShowInviteModal(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite member
        </Button>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
            <CardHeader>
              <CardTitle className="text-perionyx-text-primary">Invite a member</CardTitle>
              <CardDescription className="text-perionyx-text-muted">
                They will receive an email with instructions to join.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => void handleInvite(e)}>
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email address</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteRole">Role</Label>
                  <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                    <option value="MEMBER">Member</option>
                    <option value="TREASURER">Treasurer</option>
                    <option value="ADMIN">Admin</option>
                    <option value="VIEWER">Viewer</option>
                  </Select>
                </div>
                {inviteError && <p className="text-sm text-perionyx-danger">{inviteError}</p>}
                {inviteSuccess && <p className="text-sm text-green-400">Invitation sent!</p>}
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1" disabled={inviting}>
                    {inviting ? "Sending..." : "Send invitation"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => { setShowInviteModal(false); setInviteError(null); setInviteSuccess(false); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending Invites */}
      {invites.filter((i) => i.status === "PENDING").length > 0 && (
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium text-perionyx-text-primary">
              <Mail className="h-4 w-4 text-perionyx-gold" />
              Pending invitations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {invites.filter((i) => i.status === "PENDING").map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-2xl border border-[rgba(212,175,55,0.12)] bg-perionyx-bg-surface px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-perionyx-text-primary">{inv.email}</p>
                  <p className="text-xs text-perionyx-text-muted">
                    Invited as {inv.role} &middot; {new Date(inv.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Pending
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Members */}
      {memberships.length === 0 ? (
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardContent className="p-6">
            <EmptyState title="No members" description="Invite your first team member to get started." />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {memberships.map((membership) => (
            <Card key={membership.user.id} className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-perionyx-text-primary">{membership.user.name || membership.user.email}</CardTitle>
                    <CardDescription className="text-perionyx-text-muted">{membership.user.email}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-perionyx-gold border-perionyx-gold/30">
                      {membership.role}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(selectedUser === membership.user.id ? null : membership.user.id)}
                    >
                      {selectedUser === membership.user.id ? "Close" : "Assign role"}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {selectedUser === membership.user.id && (
                <CardContent className="space-y-4 border-t border-[rgba(255,255,255,0.08)] pt-4">
                  <div className="space-y-2">
                    <Label className="text-perionyx-text-primary">Select role</Label>
                    <Select value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)}>
                      <option value="">Choose a role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Button onClick={assignRole} disabled={!selectedRoleId || assigning} variant="default" size="sm">
                    {assigning ? "Assigning..." : "Assign role"}
                  </Button>
                </CardContent>
              )}

              <CardContent>
                <div>
                  <p className="text-xs uppercase tracking-wider text-perionyx-text-muted">Assigned roles</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {membership.user.userRoles.length > 0 ? (
                      membership.user.userRoles.map((ur) => (
                        <span key={ur.role.id} className="rounded-lg bg-[rgba(212,175,55,0.1)] px-2 py-1 text-xs text-perionyx-gold">
                          {ur.role.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-perionyx-text-muted">No roles assigned</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
