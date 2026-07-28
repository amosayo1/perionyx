"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, Plus, ArrowRight, Trash2, Pencil,
} from "lucide-react";
import { toast } from "sonner";
import type { ApprovalMatrixRule } from "@/modules/automation-studio/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const ApprovalMatrixForm = dynamic(() => import("./approval-matrix-form").then(m => ({ default: m.ApprovalMatrixForm })), { ssr: false });
import type { ApprovalMatrixFormData } from "./approval-matrix-form";

interface Props {
  rules: ApprovalMatrixRule[];
}

function RuleCard({ rule, onEdit, onDelete }: { rule: ApprovalMatrixRule; onEdit: () => void; onDelete: () => void }) {
  return (
    <div
      className="group rounded-lg border border-white/[0.06] bg-zinc-900/30 transition-colors hover:bg-zinc-900/50"
      role="region"
      aria-label={`Approval rule: ${rule.name}`}
    >
      <div className="flex items-start justify-between p-4">
        <button type="button" onClick={onEdit} className="flex items-start gap-3 flex-1 text-left" aria-label={`Edit ${rule.name}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white">{rule.name}</p>
              <Badge variant={rule.isActive ? "success" : "default"} className="text-[9px]">
                {rule.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="secondary" className="text-[9px]">
                P{rule.priority}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-zinc-500">{rule.description}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {rule.approverRoles.map((role) => (
                <Badge key={role} variant="outline" className="text-[9px]">
                  {role}
                </Badge>
              ))}
              <Badge variant="outline" className="text-[9px]">
                {rule.approvalMode}
              </Badge>
              {rule.escalationEnabled && (
                <Badge variant="warning" className="text-[9px]">
                  Escalation {rule.escalationDelayMinutes}m
                </Badge>
              )}
              {rule.delegationEnabled && (
                <Badge variant="secondary" className="text-[9px]">
                  Delegation
                </Badge>
              )}
            </div>
          </div>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <div className="text-right text-xs text-zinc-500 mr-2">
            <div>{rule.requiredApprovers} approver{rule.requiredApprovers > 1 ? "s" : ""}</div>
            <div>{rule.timeoutMinutes}min timeout</div>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-1.5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity hover:text-amber-400"
            aria-label={`Edit ${rule.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-1.5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
            aria-label={`Delete ${rule.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {rule.conditions.length > 0 && (
        <div className="mx-4 mb-4 flex flex-wrap gap-1.5 border-t border-white/[0.06] pt-3">
          {rule.conditions.map((c, i) => (
            <span key={i} className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-400">
              {c.field} {c.operator} {String(c.value)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function ApprovalMatrixClient({ rules: initialRules }: Props) {
  const router = useRouter();
  const [rules, setRules] = useState(initialRules);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRule, setEditRule] = useState<ApprovalMatrixRule | null>(null);
  const [confirmState, setConfirmState] = useState<{ open: boolean; onConfirm: () => void; title: string; message: string; destructive?: boolean }>({ open: false, onConfirm: () => {}, title: "", message: "" });
  const pageSize = 20;

  const filtered = rules.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.approverRoles.some((role) => role.toLowerCase().includes(search.toLowerCase())),
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const paged = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const handleSave = useCallback(async (data: ApprovalMatrixFormData) => {
    const isEdit = !!editRule;
    const url = isEdit ? `/api/automation-studio/approval-matrix/${editRule!.id}` : "/api/automation-studio/approval-matrix";
    const method = isEdit ? "PUT" : "POST";

    const promise = fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || err.details?.[0]?.message || "Request failed");
      }
      const result: ApprovalMatrixRule = await res.json();
      setRules((prev) =>
        isEdit
          ? prev.map((r) => (r.id === result.id ? result : r))
          : [result, ...prev],
      );
      setDialogOpen(false);
      setEditRule(null);
      router.refresh();
      return result;
    });

    toast.promise(promise, {
      loading: isEdit ? "Updating rule..." : "Creating rule...",
      success: isEdit ? "Rule updated" : "Rule created",
      error: (err: Error) => err.message,
      action: {
        label: "Retry",
        onClick: () => handleSave(data),
      },
    });
  }, [editRule, router]);

  const handleDelete = useCallback(async (rule: ApprovalMatrixRule) => {

    const promise = fetch(`/api/automation-studio/approval-matrix/${rule.id}`, {
      method: "DELETE",
    }).then(async (res) => {
      if (!res.ok) throw new Error("Failed to delete");
      setRules((prev) => prev.filter((r) => r.id !== rule.id));
      router.refresh();
    });

    toast.promise(promise, {
      loading: "Deleting rule...",
      success: "Rule deleted",
      error: "Failed to delete rule",
      action: {
        label: "Retry",
        onClick: () => handleDelete(rule),
      },
    });
  }, [router]);

  const confirmDelete = useCallback((rule: ApprovalMatrixRule) => {
    setConfirmState({
      open: true,
      destructive: true,
      title: "Delete Approval Rule",
      message: `Delete approval rule "${rule.name}"? This cannot be undone.`,
      onConfirm: () => {
        setConfirmState((prev) => ({ ...prev, open: false }));
        handleDelete(rule);
      },
    });
  }, [handleDelete]);

  const openCreate = () => {
    setEditRule(null);
    setDialogOpen(true);
  };

  const openEdit = (rule: ApprovalMatrixRule) => {
    setEditRule(rule);
    setDialogOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" id="approval-matrix-heading">Approval Matrix</h1>
          <p className="mt-1 text-sm text-zinc-400" id="approval-matrix-description">
            Configure approval rules by role, department, amount thresholds, and escalation
          </p>
        </div>
        <nav className="flex items-center gap-2" aria-label="Approval matrix actions">
          <Button onClick={openCreate} className="gap-2" aria-label="Create new approval rule">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create Rule
          </Button>
          <Link href="/automation-studio">
            <Button variant="outline" size="sm" className="gap-1.5" aria-label="Back to dashboard">
              <ArrowRight className="h-3.5 w-3.5 rotate-180" aria-hidden="true" />
              Dashboard
            </Button>
          </Link>
        </nav>
      </div>

      <div role="search" aria-label="Search approval rules">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search rules by name, role..."
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center" role="status">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900/60 text-zinc-600">
              <ShieldCheck className="h-7 w-7" aria-hidden="true" />
            </div>
            <h3 className="mb-1 text-base font-semibold text-white">
              {search ? "No matching rules" : "No approval matrix rules"}
            </h3>
            <p className="mb-4 text-sm text-zinc-500">
              {search
                ? "Try a different search term."
                : "Create approval matrix rules to define who can approve what."}
            </p>
            {!search && (
              <Button onClick={openCreate} className="gap-2" aria-label="Create your first rule">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create Your First Rule
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3" role="list" aria-label="Approval matrix rules">
          {paged.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onEdit={() => openEdit(rule)}
              onDelete={() => confirmDelete(rule)}
            />
          ))}
        </div>
      )}
      {filtered.length > pageSize && (
        <PaginationBar
          page={safePage}
          pageSize={pageSize}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      )}

      <ApprovalMatrixForm
        open={dialogOpen}
        onOpenChange={(open) => { if (!open) setEditRule(null); setDialogOpen(open); }}
        onSave={handleSave}
        editRule={editRule}
      />

      <ConfirmDialog
        open={confirmState.open}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, open: false }))}
        title={confirmState.title}
        message={confirmState.message}
        destructive={confirmState.destructive}
        confirmLabel="Delete"
      />
    </div>
  );
}
