import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { serverFetch } from "@/lib/server-fetch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

type Wallet = {
  id: string;
  name: string;
  currency: string;
  balance: string;
  kind: string;
};

type LedgerRow = {
  id: string;
  side: string;
  amount: string;
  currency: string;
  createdAt: string;
  transactionId: string;
  transaction?: { id: string; type: string; status: string; reference: string | null; createdAt: string };
};

type RouteProps = { params: Promise<{ walletId: string }> };

export default async function WalletDetailPage(props: RouteProps) {
  const session = await auth();
  if (!session?.user?.activeCompanyId) {
    redirect("/onboarding");
  }
  const { walletId } = await props.params;

  const [wRes, lRes] = await Promise.all([
    serverFetch(`/api/v1/wallets/${walletId}`),
    serverFetch(`/api/v1/ledger?walletId=${encodeURIComponent(walletId)}&limit=15`),
  ]);

  if (wRes.status === 404) {
    return (
      <div className="mx-auto max-w-lg space-y-4 text-center">
        <h1 className="text-xl font-semibold text-perionyx-text-primary">Wallet not found</h1>
        <Button asChild variant="outline">
          <Link href="/wallets">Back to wallets</Link>
        </Button>
      </div>
    );
  }

  if (!wRes.ok) {
    redirect("/wallets");
  }

  const wallet = (await wRes.json()) as Wallet;
  const ledgerBody = (await lRes.json()) as { items: LedgerRow[] };
  const lines = ledgerBody.items ?? [];
  const recentTx = new Map<string, LedgerRow>();
  for (const line of lines) {
    if (!recentTx.has(line.transactionId)) {
      recentTx.set(line.transactionId, line);
    }
  }
  const recentTxRows = [...recentTx.values()].slice(0, 8);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 text-perionyx-text-muted hover:text-perionyx-text-primary">
            <Link href="/wallets">← Wallets</Link>
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight text-perionyx-text-primary">{wallet.name}</h1>
          <p className="mt-1 text-sm text-perionyx-text-muted">
            {wallet.kind === "STANDARD" ? "Standard wallet" : "System wallet"} · {wallet.currency}
          </p>
        </div>
        <Card className="w-full border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel sm:w-72 shadow-soft">
          <CardHeader className="pb-2">
            <CardDescription className="text-perionyx-text-muted">Available balance</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums text-perionyx-text-primary">
              {formatMoney(wallet.balance, wallet.currency)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader>
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Recent related transactions</CardTitle>
          <CardDescription className="text-perionyx-text-muted">Transactions that posted ledger lines into this wallet.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTxRows.map((row) => (
                <TableRow key={row.transactionId}>
                  <TableCell className="whitespace-nowrap text-perionyx-text-subtle">{formatDateTime(row.createdAt)}</TableCell>
                  <TableCell className="font-medium text-perionyx-text-primary">
                    {row.transaction?.type?.replaceAll("_", " ") ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.transaction?.status ?? "—"} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold text-perionyx-text-primary">
                    {formatMoney(row.amount, row.currency)}
                  </TableCell>
                </TableRow>
              ))}
              {recentTxRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-perionyx-text-muted">
                    No transactions yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader>
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Recent ledger lines</CardTitle>
          <CardDescription className="text-perionyx-text-muted">Double-entry lines touching this wallet.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Transaction</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Side</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap text-perionyx-text-subtle">{formatDateTime(row.createdAt)}</TableCell>
                  <TableCell className="font-mono text-xs text-perionyx-text-muted">
                    {row.transaction?.type?.replaceAll("_", " ") ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.transaction?.status ?? "—"} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={row.side === "DEBIT" ? "outline" : "secondary"}
                      className="font-normal text-perionyx-text-muted border-perionyx-border bg-perionyx-bg-primary"
                    >
                      {row.side}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-perionyx-text-primary">{formatMoney(row.amount, row.currency)}</TableCell>
                </TableRow>
              ))}
              {lines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-perionyx-text-muted">
                    No ledger activity yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
