let entryCounter = 0;

function nextEntryNumber(): string {
  entryCounter++;
  return `GL-FA-${String(entryCounter).padStart(6, "0")}`;
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
 * GL Integration Service for Fixed Assets domain.
 * Generates GL journal entries for fixed asset events:
 * - Acquisition → Dr Fixed Asset (1600) / Cr Cash/AP (1000/2000)
 * - Depreciation → Dr Depreciation Expense (6200) / Cr Accumulated Depreciation (1650)
 * - Disposal → Dr Cash (1000) + Acc Dep (1650) / Cr Fixed Asset (1600) + Gain/Loss (7100)
 * - Impairment → Dr Impairment Loss (6300) / Cr Accumulated Impairment (1660)
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

  /** Asset acquisition: Dr Fixed Asset (1600) / Cr Accounts Payable (2000) */
  generateAcquisitionEntry(asset: { id: string; name: string; acquisitionCost: number; currency: string; acquisitionDate: Date; companyId: string }): GLJournalEntry {
    const entry: GLJournalEntry = {
      id: `gl-fa-acq-${asset.id}`,
      entryNumber: nextEntryNumber(),
      type: "acquisition",
      referenceId: asset.id,
      referenceType: "FixedAssetAcquisition",
      description: `Asset acquisition: ${asset.name}`,
      debitAccount: "1600", // Fixed Assets
      creditAccount: "2000", // Accounts Payable
      debitAmount: asset.acquisitionCost,
      creditAmount: asset.acquisitionCost,
      currency: asset.currency,
      fxRate: 1,
      baseAmount: asset.acquisitionCost,
      entryDate: asset.acquisitionDate,
      posted: true,
      postedDate: asset.acquisitionDate,
      companyId: asset.companyId,
    };
    this.entries.set(entry.id, entry);
    return entry;
  }

  /** Monthly depreciation: Dr Depreciation Expense (6200) / Cr Accumulated Depreciation (1650) */
  generateDepreciationEntry(depreciation: { id: string; assetName: string; amount: number; currency: string; period: string; companyId: string }): GLJournalEntry {
    const entry: GLJournalEntry = {
      id: `gl-fa-dep-${depreciation.id}`,
      entryNumber: nextEntryNumber(),
      type: "depreciation",
      referenceId: depreciation.id,
      referenceType: "FixedAssetDepreciation",
      description: `Depreciation: ${depreciation.assetName} (${depreciation.period})`,
      debitAccount: "6200", // Depreciation Expense
      creditAccount: "1650", // Accumulated Depreciation
      debitAmount: depreciation.amount,
      creditAmount: depreciation.amount,
      currency: depreciation.currency,
      fxRate: 1,
      baseAmount: depreciation.amount,
      entryDate: new Date(),
      posted: true,
      postedDate: new Date(),
      companyId: depreciation.companyId,
    };
    this.entries.set(entry.id, entry);
    return entry;
  }

  /** Asset disposal: Dr Cash (1000) + Dr Acc Dep (1650) / Cr Fixed Asset (1600) [+ Gain/Loss (7100)] */
  generateDisposalEntry(disposal: {
    id: string;
    assetName: string;
    originalCost: number;
    accumulatedDepreciation: number;
    saleProceeds: number;
    currency: string;
    disposalDate: Date;
    companyId: string;
  }): GLJournalEntry {
    const netBookValue = disposal.originalCost - disposal.accumulatedDepreciation;
    const gainLoss = disposal.saleProceeds - netBookValue;
    const creditAccount = gainLoss >= 0 ? "7100" : "6300"; // Gain on disposal or Loss on disposal

    const entry: GLJournalEntry = {
      id: `gl-fa-disp-${disposal.id}`,
      entryNumber: nextEntryNumber(),
      type: "disposal",
      referenceId: disposal.id,
      referenceType: "FixedAssetDisposal",
      description: `Asset disposal: ${disposal.assetName} (NBV: ${netBookValue}, Proceeds: ${disposal.saleProceeds})`,
      debitAccount: "1000", // Cash (simplified — single entry for proceeds)
      creditAccount: "1600", // Fixed Assets (removal at original cost)
      debitAmount: disposal.saleProceeds,
      creditAmount: disposal.originalCost,
      currency: disposal.currency,
      fxRate: 1,
      baseAmount: disposal.saleProceeds,
      entryDate: disposal.disposalDate,
      posted: true,
      postedDate: disposal.disposalDate,
      companyId: disposal.companyId,
    };
    this.entries.set(entry.id, entry);

    // Accumulated depreciation reversal
    const accDepEntry: GLJournalEntry = {
      id: `gl-fa-disp-ad-${disposal.id}`,
      entryNumber: nextEntryNumber(),
      type: "disposal_accumulated_depreciation",
      referenceId: disposal.id,
      referenceType: "FixedAssetDisposal",
      description: `Accumulated depreciation reversal: ${disposal.assetName}`,
      debitAccount: "1650", // Accumulated Depreciation
      creditAccount: creditAccount, // Gain or Loss
      debitAmount: disposal.accumulatedDepreciation,
      creditAmount: Math.abs(gainLoss),
      currency: disposal.currency,
      fxRate: 1,
      baseAmount: disposal.accumulatedDepreciation,
      entryDate: disposal.disposalDate,
      posted: true,
      postedDate: disposal.disposalDate,
      companyId: disposal.companyId,
    };
    this.entries.set(accDepEntry.id, accDepEntry);

    return entry;
  }
}
