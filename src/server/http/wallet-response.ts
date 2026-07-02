import type { Wallet } from "@prisma/client";
import { decimalToString } from "@/server/http/money";

export function serializeWalletJson(wallet: Wallet) {
  return {
    id: wallet.id,
    companyId: wallet.companyId,
    kind: wallet.kind,
    name: wallet.name,
    currency: wallet.currency,
    balance: decimalToString(wallet.balance),
    version: wallet.version,
    createdAt: wallet.createdAt.toISOString(),
    updatedAt: wallet.updatedAt.toISOString(),
  };
}
