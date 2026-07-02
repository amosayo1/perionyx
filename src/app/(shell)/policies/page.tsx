"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TableScroll } from "@/components/ui/table-scroll";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { formatDateTime } from "@/lib/format";
import { Plus, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import Link from "next/link";

type Policy = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  priority: number;
  action: string;
  ruleCount: number;
  enabled: boolean;
  createdAt: string;
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/policies", { credentials: "include", signal });
      if (signal?.aborted) return;
      const body = (await res.json()) as { items: Policy[] };
      setPolicies(Array.isArray(body.items) ? body.items : []);
    } catch {
      // handled by empty state
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => void load(ac.signal));
    return () => ac.abort();
  }, [load]);

  const togglePolicy = useCallback(async (id: string, enabled: boolean) => {
    setToggleLoading((prev) => new Set(prev).add(id));
    try {
      await fetch(`/api/v1/policies/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      });
      setPolicies((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !enabled } : p)));
    } finally {
      setToggleLoading((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, []);

  const deletePolicy = useCallback(async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/v1/policies/${encodeURIComponent(deleteConfirm)}`, {
        method: "DELETE",
        credentials: "include",
      });
      setPolicies((prev) => prev.filter((p) => p.id !== deleteConfirm));
      setDeleteConfirm(null);
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteConfirm]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Policies</h1>
          <p className="mt-1 text-sm text-perionyx-text-muted">Manage transaction policies and rules.</p>
        </div>
        <Link href="/policies/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Policy
          </Button>
        </Link>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Policies</CardTitle>
          <CardDescription className="text-perionyx-text-muted">
            {policies.length} polic{policies.length !== 1 ? "ies" : "y"} configured.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : policies.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No policies"
                description="Create your first policy to control transactions."
                action={
                  <Link href="/policies/new">
                    <Button size="sm">Create Policy</Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <TableScroll>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Priority</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="text-right">Rules</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-perionyx-text-primary">{p.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{p.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-perionyx-text-primary">{p.priority}</TableCell>
                      <TableCell>
                        <Badge variant={p.action === "BLOCK" ? "danger" : "secondary"}>{p.action}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-perionyx-text-primary">{p.ruleCount}</TableCell>
                      <TableCell>
                        <Badge variant={p.enabled ? "success" : "secondary"}>{p.enabled ? "Enabled" : "Disabled"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={toggleLoading.has(p.id)}
                            onClick={() => void togglePolicy(p.id, p.enabled)}
                          >
                            {p.enabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-perionyx-danger"
                            onClick={() => setDeleteConfirm(p.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableScroll>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete policy</DialogTitle>
            <DialogDescription>This action cannot be undone. Are you sure?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => void deletePolicy()} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
