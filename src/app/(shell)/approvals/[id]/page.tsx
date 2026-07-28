import React from "react";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatDateTime } from "@/lib/format";
import { Check, X, ArrowLeft, Clock, Shield, User } from "lucide-react";
import ApproveButtons from "../ApproveButtons";
import { VersionHistoryPanel } from "@/components/enterprise/version-history-panel";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ApprovalDetail({ params }: Props) {
  return withRuntimeContext(await headers(), async (ctx) => {
    const { id } = await params;
  
    const approval = await prisma.transactionApproval.findUnique({
      where: { id },
      include: { transaction: true },
    });
  
    if (!approval || approval.companyId !== ctx.tenant.companyId) {
      return (
        <div className="mx-auto max-w-2xl py-20 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
            <X className="h-6 w-6 text-red-400" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">Not found</h1>
          <p className="text-sm text-zinc-500 mb-6">This approval does not exist or you do not have access.</p>
          <Link href="/approvals">
            <Button variant="outline">Back to approvals</Button>
          </Link>
        </div>
      );
    }
  
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back link */}
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-zinc-400 hover:text-white">
          <Link href="/approvals">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Approvals
          </Link>
        </Button>
  
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.3)]" />
              <span className="text-[11px] font-mono text-zinc-500 font-medium uppercase tracking-wider">
                Approval Record
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Approval {approval.id.slice(0, 8)}...
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Transaction: {approval.transactionId}
            </p>
          </div>
          <Card className="border border-white/[0.06] bg-zinc-900/60 sm:w-56">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs text-zinc-500">Status</CardDescription>
              <CardTitle className="text-base">
                <Badge
                  variant={
                    approval.status === "APPROVED"
                      ? "success"
                      : approval.status === "REJECTED"
                      ? "danger"
                      : "secondary"
                  }
                >
                  {approval.status}
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
  
        {/* Detail cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border border-white/[0.06] bg-zinc-900/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Clock className="h-3.5 w-3.5" />
                Requested
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-white">
                {formatDateTime(approval.createdAt.toISOString())}
              </p>
            </CardContent>
          </Card>
  
          <Card className="border border-white/[0.06] bg-zinc-900/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Shield className="h-3.5 w-3.5" />
                Required Role
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-white">
                {approval.approvingUserRole ?? "—"}
              </p>
            </CardContent>
          </Card>
  
          <Card className="border border-white/[0.06] bg-zinc-900/50 sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <User className="h-3.5 w-3.5" />
                Approved By
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-white">
                {approval.approvingUserId ?? "—"}
              </p>
            </CardContent>
          </Card>
        </div>
  
        {/* Transaction summary */}
        {approval.transaction && (
          <Card className="border border-white/[0.06] bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white">Transaction Details</CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Associated transaction for this approval request.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Amount</p>
                  <p className="text-sm font-semibold text-white">
                    {approval.transaction.primaryAmount?.toString() ?? "—"}{" "}
                    {approval.transaction.currency}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Type</p>
                  <p className="text-sm text-zinc-300">
                    {approval.transaction.type?.replace(/_/g, " ") ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Status</p>
                  <StatusBadge status={approval.transaction.status} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
  
        {/* Rejection reason */}
        {approval.rejectionReason && (
          <Card className="border border-red-500/20 bg-red-500/5">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-red-400" />
                <CardTitle className="text-sm font-semibold text-red-400">
                  Rejection Reason
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-400">{approval.rejectionReason}</p>
            </CardContent>
          </Card>
        )}
  
        {/* Timestamps */}
        <Card className="border border-white/[0.06] bg-zinc-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Created</span>
                <span className="text-sm text-zinc-300 font-mono">
                  {formatDateTime(approval.createdAt.toISOString())}
                </span>
              </div>
              {approval.updatedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">Last updated</span>
                  <span className="text-sm text-zinc-300 font-mono">
                    {formatDateTime(approval.updatedAt.toISOString())}
                  </span>
                </div>
              )}
              {approval.approvedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">Decided at</span>
                  <span className="text-sm font-mono text-[#d4af37]">
                    {formatDateTime(approval.approvedAt.toISOString())}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
  
        {/* Approve/Reject actions */}
        {approval.status === "PENDING" && (
          <Card className="border border-[#d4af37]/20 bg-[#d4af37]/5">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white">Take Action</CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Review the transaction details before approving or rejecting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApproveButtons transactionId={approval.transactionId} />
            </CardContent>
          </Card>
        )}
  
        <VersionHistoryPanel entityType="TransactionApproval" entityId={approval.id} />
      </div>
    );
  });
}
