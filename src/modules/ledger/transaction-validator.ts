import { Prisma } from "@prisma/client";
import { prisma as defaultPrisma } from "@/server/db/prisma";
import type { DbClient } from "@/lib/db/types";

export interface TransactionValidationContext {
  companyId: string;
  walletIds: string[];
  currency: string;
  type: string;
  amount: Prisma.Decimal | number | string;
}

export class TransactionValidator {
  constructor(private prisma: DbClient = defaultPrisma) {}

  async validateWalletOwnership(
    walletIds: string[],
    companyId: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    const wallets = await this.prisma.wallet.findMany({
      where: {
        id: { in: walletIds },
        companyId,
      },
    });

    if (wallets.length !== new Set(walletIds).size) {
      errors.push(`Not all wallets belong to company ${companyId}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async validateWalletCurrency(
    walletIds: string[],
    companyId: string,
    expectedCurrency: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    const wallets = await this.prisma.wallet.findMany({
      where: {
        id: { in: walletIds },
        companyId,
      },
      select: { id: true, currency: true },
    });

    for (const wallet of wallets) {
      if (wallet.currency !== expectedCurrency) {
        errors.push(
          `Wallet ${wallet.id} currency ${wallet.currency} does not match transaction currency ${expectedCurrency}`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async validateSufficientBalance(
    walletId: string,
    amount: Prisma.Decimal | number | string
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      errors.push(`Wallet ${walletId} not found`);
      return { valid: false, errors };
    }

    const requiredAmount = new Prisma.Decimal(amount);
    if (wallet.balance.lt(requiredAmount)) {
      errors.push(
        `Insufficient balance: wallet has ${wallet.balance.toString()}, need ${requiredAmount.toString()}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateAmount(amount: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const decimal = new Prisma.Decimal(amount);

      if (decimal.isZero()) {
        errors.push("Transaction amount must be non-zero");
      }

      if (decimal.isNegative()) {
        errors.push("Transaction amount must be positive");
      }

      if (decimal.gt("999999999999")) {
        errors.push("Transaction amount exceeds maximum allowed");
      }
    } catch (e) {
      errors.push(`Invalid amount format: ${e instanceof Error ? e.message : String(e)}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateCurrency(currency: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!currency || currency.length !== 3) {
      errors.push("Currency must be a valid ISO 4217 code (3 characters)");
    }

    if (!/^[A-Z]{3}$/.test(currency)) {
      errors.push("Currency must be uppercase letters only");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async validateTransfer(
    fromWalletId: string,
    toWalletId: string,
    companyId: string,
    amount: Prisma.Decimal | number | string,
    currency: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    const walletOwnership = await this.validateWalletOwnership(
      [fromWalletId, toWalletId],
      companyId
    );
    if (!walletOwnership.valid) {
      errors.push(...walletOwnership.errors);
    }

    const currencyValidation = this.validateCurrency(currency);
    if (!currencyValidation.valid) {
      errors.push(...currencyValidation.errors);
    }

    const currencyCheck = await this.validateWalletCurrency(
      [fromWalletId, toWalletId],
      companyId,
      currency
    );
    if (!currencyCheck.valid) {
      errors.push(...currencyCheck.errors);
    }

    const amountValidation = this.validateAmount(amount);
    if (!amountValidation.valid) {
      errors.push(...amountValidation.errors);
    }

    const balanceValidation = await this.validateSufficientBalance(fromWalletId, amount);
    if (!balanceValidation.valid) {
      errors.push(...balanceValidation.errors);
    }

    if (fromWalletId === toWalletId) {
      errors.push("Cannot transfer to the same wallet");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async validateCredit(
    toWalletId: string,
    companyId: string,
    amount: Prisma.Decimal | number | string,
    currency: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    const walletOwnership = await this.validateWalletOwnership([toWalletId], companyId);
    if (!walletOwnership.valid) {
      errors.push(...walletOwnership.errors);
    }

    const currencyValidation = this.validateCurrency(currency);
    if (!currencyValidation.valid) {
      errors.push(...currencyValidation.errors);
    }

    const currencyCheck = await this.validateWalletCurrency(
      [toWalletId],
      companyId,
      currency
    );
    if (!currencyCheck.valid) {
      errors.push(...currencyCheck.errors);
    }

    const amountValidation = this.validateAmount(amount);
    if (!amountValidation.valid) {
      errors.push(...amountValidation.errors);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async validateDebit(
    fromWalletId: string,
    companyId: string,
    amount: Prisma.Decimal | number | string,
    currency: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    const walletOwnership = await this.validateWalletOwnership([fromWalletId], companyId);
    if (!walletOwnership.valid) {
      errors.push(...walletOwnership.errors);
    }

    const currencyValidation = this.validateCurrency(currency);
    if (!currencyValidation.valid) {
      errors.push(...currencyValidation.errors);
    }

    const currencyCheck = await this.validateWalletCurrency(
      [fromWalletId],
      companyId,
      currency
    );
    if (!currencyCheck.valid) {
      errors.push(...currencyCheck.errors);
    }

    const amountValidation = this.validateAmount(amount);
    if (!amountValidation.valid) {
      errors.push(...amountValidation.errors);
    }

    const balanceValidation = await this.validateSufficientBalance(fromWalletId, amount);
    if (!balanceValidation.valid) {
      errors.push(...balanceValidation.errors);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const transactionValidator = new TransactionValidator();
