import type { WalletKind } from "@prisma/client";

export type { WalletKind };

export const WalletKindCode = {
  STANDARD: "STANDARD" as WalletKind,
  SYSTEM_CLEARING: "SYSTEM_CLEARING" as WalletKind,
} as const;
