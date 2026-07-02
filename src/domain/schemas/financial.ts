import { z } from "zod";
import type { Prisma } from "@prisma/client";
import {
  DEFAULT_LEDGER_CURRENCY,
  isSupportedCurrency,
} from "@/domain/constants/currencies";
import { parsePositiveDecimalString } from "@/server/http/money";

export const idempotencyKeySchema = z
  .string()
  .min(8, "idempotencyKey must be at least 8 characters")
  .max(256);

const metadataSchema = z.record(z.string(), z.unknown()).optional().nullable();

export const creditWalletBodySchema = z.object({
  walletId: z.string().min(1),
  amount: z.string().min(1).max(40),
  idempotencyKey: idempotencyKeySchema,
  reference: z.string().max(512).optional().nullable(),
  metadata: metadataSchema,
});

export const transferWalletBodySchema = z.object({
  fromWalletId: z.string().min(1),
  toWalletId: z.string().min(1),
  amount: z.string().min(1).max(40),
  idempotencyKey: idempotencyKeySchema,
  reference: z.string().max(512).optional().nullable(),
  metadata: metadataSchema,
});

export const createWalletBodySchema = z.object({
  name: z.string().min(1).max(255),
  currency: z
    .string()
    .length(3)
    .default(DEFAULT_LEDGER_CURRENCY)
    .transform((c) => c.toUpperCase())
    .refine((c) => isSupportedCurrency(c), "Unsupported currency code"),
});

export type CreateWalletBody = z.infer<typeof createWalletBodySchema>;

export type CreditWalletBody = z.infer<typeof creditWalletBodySchema>;
export type TransferWalletBody = z.infer<typeof transferWalletBodySchema>;

export type ParsedCreditWalletInput = {
  walletId: string;
  amount: Prisma.Decimal;
  idempotencyKey: string;
  reference?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export type ParsedTransferWalletInput = {
  fromWalletId: string;
  toWalletId: string;
  amount: Prisma.Decimal;
  idempotencyKey: string;
  reference?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export function parseCreateWalletBody(raw: unknown): CreateWalletBody {
  return createWalletBodySchema.parse(raw);
}

export function parseCreditWalletBody(raw: unknown): ParsedCreditWalletInput {
  const body = creditWalletBodySchema.parse(raw);
  return {
    walletId: body.walletId,
    amount: parsePositiveDecimalString(body.amount, "amount"),
    idempotencyKey: body.idempotencyKey,
    reference: body.reference,
    metadata: body.metadata ? (body.metadata as Prisma.InputJsonValue) : undefined,
  };
}

export function parseTransferWalletBody(raw: unknown): ParsedTransferWalletInput {
  const body = transferWalletBodySchema.parse(raw);
  return {
    fromWalletId: body.fromWalletId,
    toWalletId: body.toWalletId,
    amount: parsePositiveDecimalString(body.amount, "amount"),
    idempotencyKey: body.idempotencyKey,
    reference: body.reference,
    metadata: body.metadata ? (body.metadata as Prisma.InputJsonValue) : undefined,
  };
}
