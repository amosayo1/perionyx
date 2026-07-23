let entryCounter = 0;

function nextEntryNumber(): string {
  entryCounter++;
  return `GL-TR-${String(entryCounter).padStart(6, "0")}`;
}

interface GLJournalEntry {
  id: string;
  entryNumber: string;
  type: string;
  referenceId: string;
  referenceType: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  debitAmount: number;
  creditAmount: number;
  currency: string;
  fxRate: number;
  baseAmount: number;
  entryDate: Date;
  posted: boolean;
  postedDate: Date;
  companyId: string;
}

/**
 * GL Integration Service for Treasury domain.
 * Generates GL journal entries for treasury events:
 * - Cash transfer → Dr Target Bank / Cr Source Bank
 * - FX conversion → Dr Foreign Currency / Cr Cash + realized gain/loss
 * - Investment purchase → Dr Investment / Cr Cash
 * - Investment sale → Dr Cash / Cr Investment + gain/loss
 */
export class GLIntegrationService {
  private entries = new Map<string, GLJournalEntry>();

  getAllEntries(): GLJournalEntry[] {
    return Array.from(this.entries.values());
  }

  getEntriesByCompany(companyId: string): GLJournalEntry[] {
    return this.getAllEntries().filter((e) => e.companyId === companyId);
  }

  clearEntries(): void {
    this.entries.clear();
  }

  /** Cash transfer between accounts: Dr Target Bank (1010) / Cr Source Bank (1000) */
  generateTransferEntry(transfer: { id: string; fromAccount: string; toAccount: string; amount: number; currency: string; transferDate: Date; companyId: string }): GLJournalEntry {
    const entry: GLJournalEntry = {
      id: `gl-tr-xfer-${transfer.id}`,
      entryNumber: nextEntryNumber(),
      type: "transfer",
      referenceId: transfer.id,
      referenceType: "TreasuryTransfer",
      description: `Cash transfer from ${transfer.fromAccount} to ${transfer.toAccount}`,
      debitAccount: "1010", // Target bank account
      creditAccount: "1000", // Source bank account
      debitAmount: transfer.amount,
      creditAmount: transfer.amount,
      currency: transfer.currency,
      fxRate: 1,
      baseAmount: transfer.amount,
      entryDate: transfer.transferDate,
      posted: true,
      postedDate: transfer.transferDate,
      companyId: transfer.companyId,
    };
    this.entries.set(entry.id, entry);
    return entry;
  }

  /** FX conversion: Dr Foreign Currency (1020) / Cr Cash (1000) */
  generateFxConversionEntry(conversion: { id: string; fromCurrency: string; toCurrency: string; fromAmount: number; toAmount: number; rate: number; conversionDate: Date; companyId: string }): GLJournalEntry {
    const entry: GLJournalEntry = {
      id: `gl-tr-fx-${conversion.id}`,
      entryNumber: nextEntryNumber(),
      type: "fx_conversion",
      referenceId: conversion.id,
      referenceType: "TreasuryFxConversion",
      description: `FX conversion: ${conversion.fromAmount} ${conversion.fromCurrency} → ${conversion.toAmount} ${conversion.toCurrency} @ ${conversion.rate}`,
      debitAccount: "1020", // Foreign currency holding
      creditAccount: "1000", // Cash
      debitAmount: conversion.toAmount,
      creditAmount: conversion.fromAmount,
      currency: conversion.toCurrency,
      fxRate: conversion.rate,
      baseAmount: conversion.fromAmount,
      entryDate: conversion.conversionDate,
      posted: true,
      postedDate: conversion.conversionDate,
      companyId: conversion.companyId,
    };
    this.entries.set(entry.id, entry);
    return entry;
  }

  /** Investment purchase: Dr Investment (1500) / Cr Cash (1000) */
  generateInvestmentPurchaseEntry(purchase: { id: string; securityName: string; amount: number; currency: string; purchaseDate: Date; companyId: string }): GLJournalEntry {
    const entry: GLJournalEntry = {
      id: `gl-tr-inv-${purchase.id}`,
      entryNumber: nextEntryNumber(),
      type: "investment_purchase",
      referenceId: purchase.id,
      referenceType: "TreasuryInvestment",
      description: `Investment purchase: ${purchase.securityName}`,
      debitAccount: "1500", // Investments
      creditAccount: "1000", // Cash
      debitAmount: purchase.amount,
      creditAmount: purchase.amount,
      currency: purchase.currency,
      fxRate: 1,
      baseAmount: purchase.amount,
      entryDate: purchase.purchaseDate,
      posted: true,
      postedDate: purchase.purchaseDate,
      companyId: purchase.companyId,
    };
    this.entries.set(entry.id, entry);
    return entry;
  }
}
