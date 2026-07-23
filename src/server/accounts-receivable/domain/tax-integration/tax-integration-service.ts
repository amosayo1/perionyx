import type { Invoice, InvoiceLine, TaxType } from "../../types";
import { financialRound } from "@/lib/financial-precision";

export class TaxIntegrationService {
  calculateInvoiceTax(
    lines: InvoiceLine[],
    taxType: TaxType,
    taxRate: number,
  ): { taxTotal: number; lines: InvoiceLine[] } {
    let taxTotal = 0;
    const updatedLines = lines.map((line) => {
      const taxAmount = financialRound(line.netTotal * (taxRate / 100), 2);
      taxTotal = financialRound(taxTotal + taxAmount, 2);
      return { ...line, taxRate, taxAmount };
    });
    return { taxTotal, lines: updatedLines };
  }

  generateTaxReport(
    invoices: Invoice[],
    startDate: Date,
    endDate: Date,
  ): { taxType: TaxType; totalSales: number; totalTax: number; lines: number }[] {
    const filtered = invoices.filter(
      (inv) => inv.invoiceDate >= startDate && inv.invoiceDate <= endDate && inv.status !== "cancelled" && inv.status !== "void",
    );
    const byType = new Map<TaxType, { totalSales: number; totalTax: number; lines: number }>();
    for (const inv of filtered) {
      const entry = byType.get(inv.taxType) ?? { totalSales: 0, totalTax: 0, lines: 0 };
      entry.totalSales = financialRound(entry.totalSales + inv.subtotal, 2);
      entry.totalTax = financialRound(entry.totalTax + inv.taxTotal, 2);
      entry.lines += inv.lines.length;
      byType.set(inv.taxType, entry);
    }
    return Array.from(byType.entries()).map(([taxType, data]) => ({
      taxType,
      totalSales: data.totalSales,
      totalTax: data.totalTax,
      lines: data.lines,
    }));
  }

  getTaxBreakdown(invoice: Invoice): { rate: number; taxableAmount: number; taxAmount: number; type: TaxType }[] {
    return invoice.lines.map((line) => ({
      rate: line.taxRate,
      taxableAmount: line.netTotal,
      taxAmount: line.taxAmount,
      type: invoice.taxType,
    }));
  }

  calculateWithholding(
    invoice: Invoice,
    rate: number,
  ): { grossAmount: number; netAmount: number; withholdingAmount: number } {
    const grossAmount = invoice.grandTotal;
    const withholdingAmount = financialRound(grossAmount * (rate / 100), 2);
    const netAmount = financialRound(grossAmount - withholdingAmount, 2);
    return {
      grossAmount: financialRound(grossAmount, 2),
      netAmount,
      withholdingAmount,
    };
  }

  validateTaxCompliance(
    invoices: Invoice[],
  ): { compliant: number; nonCompliant: number; issues: string[] } {
    const issues: string[] = [];
    let compliant = 0;
    let nonCompliant = 0;
    for (const inv of invoices) {
      const lineIssues: string[] = [];
      for (const line of inv.lines) {
        if (line.taxRate === 0 && !inv.taxExempt) {
          lineIssues.push(`Line ${line.lineNumber}: zero tax rate on non-exempt invoice`);
        }
        const expectedTax = financialRound(line.netTotal * (line.taxRate / 100), 2);
        if (Math.abs(line.taxAmount - expectedTax) > 0.01) {
          lineIssues.push(`Line ${line.lineNumber}: tax mismatch (expected ${expectedTax.toFixed(2)}, actual ${line.taxAmount.toFixed(2)})`);
        }
      }
      if (lineIssues.length > 0) {
        nonCompliant++;
        issues.push(`Invoice ${inv.invoiceNumber}: ${lineIssues.join("; ")}`);
      } else {
        compliant++;
      }
    }
    return { compliant, nonCompliant, issues };
  }
}
