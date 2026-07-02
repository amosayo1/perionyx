"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckSquare } from "lucide-react";
import { getErrorMessage } from "@/lib/client-api";

type PermissionDef = {
  name: string;
  category: string;
  description: string;
};

type Role = {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  permissions?: Array<{ permission: { name: string; description?: string } }>;
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [permissions, setPermissions] = useState<PermissionDef[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  const fetchRoles = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/admin/roles", { credentials: "include", signal });
      if (res.ok) {
        const data = await res.json();
        setRoles(Array.isArray(data) ? data : data.roles || []);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPermissions = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/admin/permissions", { credentials: "include", signal });
      if (res.ok) {
        const data = await res.json();
        setPermissions(Array.isArray(data) ? data : data.permissions || []);
      }
    } catch {
      //
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetchRoles(ac.signal);
    fetchPermissions(ac.signal);
    return () => ac.abort();
  }, [fetchRoles, fetchPermissions]);

  const createRole = async () => {
    if (!newRoleName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/v1/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoleName,
          description: newRoleDescription,
          permissions: Array.from(selectedPermissions),
        }),
      });

      if (res.ok) {
        setNewRoleName("");
        setNewRoleDescription("");
        setSelectedPermissions(new Set());
        await fetchRoles();
      }
    } catch (err) {
      console.error("Failed to create role:", err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-perionyx-text-primary">Role Management</h1>
        <p className="mt-2 text-sm text-perionyx-text-muted">Define organizational roles and their permissions.</p>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader>
          <CardTitle>Create New Role</CardTitle>
          <CardDescription>Add a new role to your organization.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="role-name">Role name</Label>
            <Input
              id="role-name"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g. Senior Treasurer"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="role-description">Description</Label>
            <Input
              id="role-description"
              value={newRoleDescription}
              onChange={(e) => setNewRoleDescription(e.target.value)}
              placeholder="Role description"
              className="mt-2"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-perionyx-text-muted mb-3">Permissions</p>
            {permissions.length === 0 ? (
              <Skeleton className="h-20" />
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {permissions.map((p) => (
                  <label key={p.name} className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-3 py-2 cursor-pointer hover:bg-[rgba(212,175,55,0.06)] transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.has(p.name)}
                      onChange={(e) => {
                        const next = new Set(selectedPermissions);
                        if (e.target.checked) next.add(p.name);
                        else next.delete(p.name);
                        setSelectedPermissions(next);
                      }}
                      className="h-4 w-4 rounded border-[rgba(212,175,55,0.3)] bg-[rgba(255,255,255,0.05)] text-perionyx-gold focus:ring-perionyx-gold/50"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-perionyx-text-primary">{p.name}</div>
                      <div className="text-xs text-perionyx-text-muted truncate">{p.description}</div>
                    </div>
                    <span className="shrink-0 rounded-full bg-[rgba(212,175,55,0.1)] px-2 py-0.5 text-[10px] text-perionyx-gold">{p.category}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <Button onClick={createRole} disabled={!newRoleName.trim() || creating} variant="default">
            {creating ? "Creating\u2026" : "Create role"}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-perionyx-text-muted">Loading roles\u2026</p>
      ) : (
        <div className="space-y-4">
          {roles.map((role) => (
            <Card key={role.id} className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
              <CardHeader>
                <CardTitle>{role.name}</CardTitle>
                {role.description && <CardDescription>{role.description}</CardDescription>}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-perionyx-text-muted">Permissions</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {role.permissions && role.permissions.length > 0 ? (
                      role.permissions.map((rp, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-[rgba(212,175,55,0.1)] px-2 py-1 text-xs text-perionyx-gold"
                          title={rp.permission.description || ""}
                        >
                          {rp.permission.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-perionyx-text-muted">No permissions assigned</span>
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
