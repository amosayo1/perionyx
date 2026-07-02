import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { formatMoney } from "@/lib/format";

type WalletRow = {
  id: string;
  name: string;
  currency: string;
  balance: string;
  kind: string;
};

function walletTypeLabel(kind: string) {
  return kind === "STANDARD" ? "Standard" : "System";
}

export function WalletOverview({ wallets }: { wallets: WalletRow[] }) {
  if (wallets.length === 0) {
    return (
      <EmptyState
        title="No wallets yet"
        description="Create a wallet to start moving balances in your company."
        action={
          <div className="pt-2">
            <Link
              href="/wallets"
              className="text-sm font-medium text-perionyx-gold hover:text-perionyx-gold-soft"
            >
              Create a wallet
            </Link>
          </div>
        }
      />
    );
  }

  const cards = wallets.slice(0, 4);
  const tableRows = wallets;

  return (
    <div className="space-y-6">
      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-perionyx-text-primary">Wallet overview</CardTitle>
            <CardDescription className="text-perionyx-text-muted">Operational accounts for the active company.</CardDescription>
          </div>
          <Link href="/wallets" className="text-sm font-medium text-perionyx-gold hover:text-perionyx-gold-soft">
            View all
          </Link>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((w) => (
              <Link
                key={w.id}
                href={`/wallets/${w.id}`}
                className="group rounded-[28px] border border-[rgba(255,255,255,0.06)] bg-perionyx-bg-panel px-4 py-4 transition duration-200 hover:border-[rgba(212,175,55,0.16)] hover:bg-perionyx-bg-surface"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-perionyx-text-primary">{w.name}</div>
                    <div className="mt-1 text-xs text-perionyx-text-muted">
                      {w.currency} · {walletTypeLabel(w.kind)}
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs font-normal text-perionyx-text-muted border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]">
                    {w.currency}
                  </Badge>
                </div>
                <div className="mt-4 text-right text-2xl font-semibold tabular-nums tracking-tight text-perionyx-text-primary">
                  {formatMoney(w.balance, w.currency)}
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {tableRows.length > 4 ? (
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-perionyx-text-primary">Wallets</CardTitle>
            <CardDescription className="text-perionyx-text-muted">All wallets in this company.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium text-perionyx-text-primary">
                      <Link href={`/wallets/${w.id}`} className="hover:text-perionyx-gold hover:underline">
                        {w.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-perionyx-text-muted">
                      {walletTypeLabel(w.kind)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-semibold text-perionyx-text-primary">
                      {formatMoney(w.balance, w.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

