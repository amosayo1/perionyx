"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  FileCheck, Plus, ArrowRight, Trash2, Pencil,
} from "lucide-react";
import { toast } from "sonner";
import type { BusinessRule, BusinessRuleType } from "@/modules/automation-studio/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const BusinessRulesForm = dynamic(() => import("./business-rules-form").then(m => ({ default: m.BusinessRulesForm })), { ssr: false });
import type { BusinessRuleFormData } from "./business-rules-form";

interface Props {
  rules: BusinessRule[];
}

function RuleCard({ rule, onEdit, onDelete }: { rule: BusinessRule; onEdit: () => void; onDelete: () => void }) {
  return (
    <div
      className="group rounded-lg border border-white/[0.06] bg-zinc-900/30 transition-colors hover:bg-zinc-900/50"
      role="region"
      aria-label={`Business rule: ${rule.name}`}
    >
      <div className="flex items-start justify-between p-4">
        <button type="button" onClick={onEdit} className="flex items-start gap-3 flex-1 text-left" aria-label={`Edit ${rule.name}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
            <FileCheck className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white">{rule.name}</p>
              <Badge variant={rule.isActive ? "success" : "default"} className="text-[9px]">
                {rule.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="secondary" className="text-[9px] uppercase">
                {rule.ruleType}
              </Badge>
              {rule.category && (
                <Badge variant="outline" className="text-[9px] capitalize">
                  {rule.category}
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-zinc-500">{rule.description}</p>
          </div>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <Badge variant="outline" className="text-[9px] mr-2">
            P{rule.priority}
          </Badge>
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
    </div>
  );
}

export function BusinessRulesClient({ rules: initialRules }: Props) {
  const router = useRouter();
  const [rules, setRules] = useState(initialRules);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRule, setEditRule] = useState<BusinessRule | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{ open: boolean; onConfirm: () => void; title: string; message: string; destructive?: boolean }>({ open: false, onConfirm: () => {}, title: "", message: "" });
  const pageSize = 20;

  const types = Array.from(new Set(rules.map((r) => r.ruleType)));

  const filtered = rules.filter((r) => {
    if (typeFilter && r.ruleType !== typeFilter) return false;
    if (
      search &&
      !r.name.toLowerCase().includes(search.toLowerCase()) &&
      !r.description.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const paged = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const handleSave = useCallback(async (data: BusinessRuleFormData) => {
    const isEdit = !!editRule;
    const url = isEdit ? `/api/automation-studio/business-rules/${editRule!.id}` : "/api/automation-studio/business-rules";
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
      const result: BusinessRule = await res.json();
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

  const handleDelete = useCallback(async (rule: BusinessRule) => {
    setDeleting(rule.id);

    const promise = fetch(`/api/automation-studio/business-rules/${rule.id}`, {
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
    try { await promise; } finally { setDeleting(null); }
  }, [router]);

  const confirmDelete = useCallback((rule: BusinessRule) => {
    setConfirmState({
      open: true,
      destructive: true,
      title: "Delete Business Rule",
      message: `Delete business rule "${rule.name}"? This cannot be undone.`,
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

  const openEdit = (rule: BusinessRule) => {
    setEditRule(rule);
    setDialogOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" id="business-rules-heading">Business Rules</h1>
          <p className="mt-1 text-sm text-zinc-400" id="business-rules-description">
            Define business logic for automation workflows
          </p>
        </div>
        <nav className="flex items-center gap-2" aria-label="Business rules actions">
          <Button onClick={openCreate} className="gap-2" aria-label="Create new business rule">
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

      <div className="flex items-center gap-3" role="search" aria-label="Search business rules">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search rules..."
        />
        <div className="flex gap-1" role="tablist" aria-label="Filter by rule type">
          <button
            onClick={() => setTypeFilter(null)}
            role="tab"
            aria-selected={typeFilter === null}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              typeFilter === null
                ? "bg-gold/10 text-gold"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
            }`}
          >
            All
          </button>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              role="tab"
              aria-selected={typeFilter === t}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                typeFilter === t
                  ? "bg-gold/10 text-gold"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center" role="status">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900/60 text-zinc-600">
              <FileCheck className="h-7 w-7" aria-hidden="true" />
            </div>
            <h3 className="mb-1 text-base font-semibold text-white">
              {search ? "No matching rules" : "No business rules"}
            </h3>
            <p className="mb-4 text-sm text-zinc-500">
              {search
                ? "Try a different search term."
                : "Business rules allow you to define logic for policy checks, thresholds, and routing."}
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
        <div className="space-y-3" role="list" aria-label="Business rules">
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

      <BusinessRulesForm
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
