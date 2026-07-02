'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ApprovalStatusBadge, ApprovalIndicator } from "@/components/approval";
import { TableScroll } from "@/components/ui/table-scroll";
import Link from "next/link";

type WalletRow = { id: string; name: string; currency: string; kind: string };

type TransactionWithApproval = {
  id: string;
  type: string;
  status: string;
  primaryAmount: string;
  currency: string;
  reference: string | null;
  metadata: unknown;
  createdAt: string;
  ledgerEntryCount: number;
  // Approval fields
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  pendingApprovalsCount?: number;
  totalApprovalsRequired?: number;
};

function getWalletName(walletId: string, walletById: Map<string, WalletRow>) {
  return walletById.get(walletId)?.name ?? walletId;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(record: Record<string, unknown> | undefined, key: string): string | undefined {
  const v = record?.[key];
  return typeof v === "string" ? v : undefined;
}

function transactionSummary(tx: TransactionWithApproval, walletById: Map<string, WalletRow>) {
  const meta = isRecord(tx.metadata) ? tx.metadata : undefined;

  if (tx.type === "INTERNAL_TRANSFER") {
    const perionyxTransfer = isRecord(meta?.["perionyxTransfer"]) ? (meta?.["perionyxTransfer"] as Record<string, unknown>) : undefined;

    const fromWalletId =
      readString(perionyxTransfer, "fromWalletId") ?? readString(meta, "fromWalletId");
    const toWalletId =
      readString(perionyxTransfer, "toWalletId") ?? readString(meta, "toWalletId");

    if (typeof fromWalletId === "string" && typeof toWalletId === "string") {
      return `Transfer ${getWalletName(fromWalletId, walletById)} → ${getWalletName(toWalletId, walletById)}`;
    }
    return "Internal transfer";
  }

  if (tx.type === "WALLET_CREDIT") {
    const perionyxCredit = isRecord(meta?.["perionyxCredit"]) ? (meta?.["perionyxCredit"] as Record<string, unknown>) : undefined;
    const targetWalletId =
      readString(perionyxCredit, "targetWalletId") ?? readString(meta, "walletId");

    if (typeof targetWalletId === "string") {
      return `Credit ${getWalletName(targetWalletId, walletById)}`;
    }
    return "Wallet credit";
  }

  return tx.type.replaceAll("_", " ");
}

export function EnhancedTransactionsTable({
  transactions,
  wallets,
  showApprovalStatus = true,
}: {
  transactions: TransactionWithApproval[];
  wallets: WalletRow[];
  showApprovalStatus?: boolean;
}) {
  const walletById = new Map(wallets.map((w) => [w.id, w]));

  return (
    <TableScroll>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead>Status</TableHead>
            {showApprovalStatus && <TableHead>Approval</TableHead>}
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={t.id} className="hover:bg-[rgba(212,175,55,0.04)] transition-colors cursor-pointer">
              <TableCell className="whitespace-nowrap text-perionyx-text-muted">{formatDateTime(t.createdAt)}</TableCell>
              <TableCell className="min-w-[260px]">
                <Link href={`/transactions/${t.id}/approval-details`} className="hover:text-perionyx-gold transition-colors">
                  <div className="text-sm font-medium text-perionyx-text-primary hover:text-perionyx-gold">
                    {transactionSummary(t, walletById)}
                  </div>
                </Link>
                {t.reference ? (
                  <div className="mt-1 truncate text-xs font-mono text-perionyx-text-muted">{t.reference}</div>
                ) : null}
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary" className="font-normal border-perionyx-border bg-perionyx-bg-primary text-perionyx-text-muted">
                    {t.ledgerEntryCount} lines
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={t.status} />
              </TableCell>
              {showApprovalStatus && (
                <TableCell>
                  {t.approvalStatus ? (
                    <div className="space-y-2">
                      <ApprovalStatusBadge status={t.approvalStatus} size="sm" compact={true} />
                      {t.totalApprovalsRequired && t.pendingApprovalsCount !== undefined && (
                        <ApprovalIndicator
                          pendingCount={t.pendingApprovalsCount}
                          requiredCount={t.totalApprovalsRequired}
                        />
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-perionyx-text-muted">—</span>
                  )}
                </TableCell>
              )}
              <TableCell className="text-right tabular-nums font-semibold text-perionyx-text-primary">
                {formatMoney(t.primaryAmount, t.currency)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableScroll>
  );
}
