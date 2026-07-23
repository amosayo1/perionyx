import "dotenv/config";
import { describe, it, expect } from "vitest";
import {
  financialRound,
  toDecimal,
  sumDecimals,
  multiplyDecimals,
  divideDecimals,
  allocateAmount,
  calculateTax,
  calculateWithholding,
  decimalEquals,
  isValidMonetaryAmount,
  formatDecimalCurrency,
  formatDecimalCompact,
  Decimal,
} from "@/lib/financial-precision";

describe("financialRound — banker's rounding", () => {
  it("1.235 rounds to 1.24 (odd tie: 123 is odd, round up to even 124)", () => {
    expect(financialRound(1.235)).toBe(1.24);
  });

  it("-1.235 rounds to -1.24 (odd tie, round toward even)", () => {
    expect(financialRound(-1.235)).toBe(-1.24);
  });

  it("IEEE 754: 1.225*100 is slightly above 122.5, so rounds to 1.23", () => {
    const shifted = 1.225 * 100;
    expect(shifted).toBeGreaterThan(122.5);
    expect(financialRound(1.225)).toBe(1.23);
  });

  it("1.234 rounds to 1.23 (2 decimals, below midpoint)", () => {
    expect(financialRound(1.234)).toBe(1.23);
  });

  it("0.1 + 0.2 rounds to 0.3", () => {
    expect(financialRound(0.1 + 0.2)).toBe(0.3);
  });

  it("large value 999999999.995 rounds correctly", () => {
    expect(financialRound(999999999.995)).toBe(1000000000);
  });

  it("zero rounds to 0", () => {
    expect(financialRound(0)).toBe(0);
  });

  it("-0 stays as -0 (integer shift path doesn't normalize)", () => {
    expect(financialRound(-0)).toBe(-0);
  });

  it("rounds to specified decimal places", () => {
    expect(financialRound(1.2345, 3)).toBe(1.234);
    expect(financialRound(1.2355, 3)).toBe(1.236);
    expect(financialRound(1.2345, 0)).toBe(1);
  });

  it("already-integer values return unchanged", () => {
    expect(financialRound(42)).toBe(42);
    expect(financialRound(-42)).toBe(-42);
  });

  it("handles midpoint away from exact halfway (no tie-breaking needed)", () => {
    expect(financialRound(1.236)).toBe(1.24);
    expect(financialRound(1.234)).toBe(1.23);
  });

  it("half-to-even on consecutive integers at 0 decimals", () => {
    expect(financialRound(0, 0)).toBe(0);
    expect(financialRound(1, 0)).toBe(1);
    expect(financialRound(2, 0)).toBe(2);
  });

  it("values already at target precision pass through unchanged", () => {
    expect(financialRound(2.5)).toBe(2.5);
    expect(financialRound(3.5)).toBe(3.5);
    expect(financialRound(-2.5)).toBe(-2.5);
    expect(financialRound(-3.5)).toBe(-3.5);
  });

  it("Prisma.Decimal banker's rounding is exact (no IEEE 754 issues)", () => {
    const { Decimal } = require("@prisma/client");
    const d1225 = new Decimal("1.225").toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN);
    expect(d1225.equals(new Decimal("1.22"))).toBe(true);
    const d1235 = new Decimal("1.235").toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN);
    expect(d1235.equals(new Decimal("1.24"))).toBe(true);
    const d1245 = new Decimal("1.245").toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN);
    expect(d1245.equals(new Decimal("1.24"))).toBe(true);
    const d1255 = new Decimal("1.255").toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN);
    expect(d1255.equals(new Decimal("1.26"))).toBe(true);
  });
});

describe("toDecimal — safe conversion", () => {
  it("Prisma.Decimal input returns same Decimal", () => {
    const input = new Decimal("123.456");
    const result = toDecimal(input);
    expect(result).toBe(input);
    expect(result.equals(input)).toBe(true);
  });

  it("string '123.456' converts to Decimal", () => {
    const result = toDecimal("123.456");
    expect(result).toBeInstanceOf(Decimal);
    expect(result.equals(new Decimal("123.456"))).toBe(true);
  });

  it("number 123.456 converts to Decimal", () => {
    const result = toDecimal(123.456);
    expect(result).toBeInstanceOf(Decimal);
    expect(result.equals(new Decimal("123.456"))).toBe(true);
  });

  it("null returns Decimal(0)", () => {
    const result = toDecimal(null);
    expect(result).toBeInstanceOf(Decimal);
    expect(result.isZero()).toBe(true);
  });

  it("undefined returns Decimal(0)", () => {
    const result = toDecimal(undefined);
    expect(result).toBeInstanceOf(Decimal);
    expect(result.isZero()).toBe(true);
  });

  it("empty string throws DecimalError (not null/undefined path)", () => {
    expect(() => toDecimal("")).toThrow();
  });

  it("negative number converts correctly", () => {
    const result = toDecimal(-42.5);
    expect(result.equals(new Decimal("-42.5"))).toBe(true);
  });

  it("zero converts correctly", () => {
    const result = toDecimal(0);
    expect(result.isZero()).toBe(true);
  });
});

describe("sumDecimals — safe aggregation", () => {
  it("sum of [0.1, 0.2, 0.3] = 0.6 exactly", () => {
    const result = sumDecimals([0.1, 0.2, 0.3]);
    expect(result.equals(new Decimal("0.6"))).toBe(true);
    expect(result.toNumber()).toBe(0.6);
  });

  it("sum of large values is exact", () => {
    const result = sumDecimals([1000000.01, 2000000.02, 3000000.03]);
    expect(result.equals(new Decimal("6000000.06"))).toBe(true);
  });

  it("null and undefined values treated as 0", () => {
    const result = sumDecimals([10, null, undefined, 20]);
    expect(result.equals(new Decimal("30"))).toBe(true);
  });

  it("empty array returns Decimal(0)", () => {
    const result = sumDecimals([]);
    expect(result.isZero()).toBe(true);
  });

  it("sum of negative values", () => {
    const result = sumDecimals([-100, -200, -300]);
    expect(result.equals(new Decimal("-600"))).toBe(true);
  });

  it("mixed positive and negative values", () => {
    const result = sumDecimals([100, -30, 20, -5]);
    expect(result.equals(new Decimal("85"))).toBe(true);
  });

  it("handles string inputs", () => {
    const result = sumDecimals(["10.50", "20.25", "30.75"]);
    expect(result.equals(new Decimal("61.50"))).toBe(true);
  });

  it("single element array", () => {
    const result = sumDecimals([42]);
    expect(result.equals(new Decimal("42"))).toBe(true);
  });
});

describe("multiplyDecimals — safe multiplication", () => {
  it("100.01 * 3 = 300.03", () => {
    const result = multiplyDecimals(100.01, 3);
    expect(result.equals(new Decimal("300.03"))).toBe(true);
  });

  it("0.1 * 0.2 = 0.02 exactly (no IEEE 754 drift)", () => {
    const result = multiplyDecimals(0.1, 0.2);
    expect(result.equals(new Decimal("0.02"))).toBe(true);
    expect(result.toNumber()).toBe(0.02);
  });

  it("large values: 999999.99 * 999999.99", () => {
    const result = multiplyDecimals(999999.99, 999999.99);
    expect(result.equals(new Decimal("999999980000.0001"))).toBe(true);
  });

  it("multiply by zero yields zero", () => {
    const result = multiplyDecimals(100, 0);
    expect(result.isZero()).toBe(true);
  });

  it("multiply by one yields same value", () => {
    const result = multiplyDecimals(123.45, 1);
    expect(result.equals(new Decimal("123.45"))).toBe(true);
  });

  it("negative times positive", () => {
    const result = multiplyDecimals(-50, 2);
    expect(result.equals(new Decimal("-100"))).toBe(true);
  });

  it("string inputs", () => {
    const result = multiplyDecimals("25.50", "4");
    expect(result.equals(new Decimal("102"))).toBe(true);
  });

  it("Decimal inputs", () => {
    const result = multiplyDecimals(new Decimal("7.5"), new Decimal("2.5"));
    expect(result.equals(new Decimal("18.75"))).toBe(true);
  });
});

describe("divideDecimals — safe division", () => {
  it("100 / 3 = 33.333333333333 (12 decimal places)", () => {
    const result = divideDecimals(100, 3);
    expect(result.equals(new Decimal("33.333333333333"))).toBe(true);
  });

  it("100 / 0 = Decimal(0) (no crash)", () => {
    const result = divideDecimals(100, 0);
    expect(result.isZero()).toBe(true);
  });

  it("10 / 2 = 5", () => {
    const result = divideDecimals(10, 2);
    expect(result.equals(new Decimal("5"))).toBe(true);
  });

  it("0 / 5 = 0", () => {
    const result = divideDecimals(0, 5);
    expect(result.isZero()).toBe(true);
  });

  it("negative dividend", () => {
    const result = divideDecimals(-100, 4);
    expect(result.equals(new Decimal("-25"))).toBe(true);
  });

  it("negative divisor", () => {
    const result = divideDecimals(100, -4);
    expect(result.equals(new Decimal("-25"))).toBe(true);
  });

  it("custom scale", () => {
    const result = divideDecimals(10, 3, 4);
    expect(result.equals(new Decimal("3.3333"))).toBe(true);
  });

  it("String input", () => {
    const result = divideDecimals("200", "8");
    expect(result.equals(new Decimal("25"))).toBe(true);
  });
});

describe("allocateAmount — residual handling", () => {
  it("allocate 100 across 3 targets sums to exactly 100", () => {
    const results = allocateAmount(100, ["A", "B", "C"]);
    expect(results).toHaveLength(3);
    const sum = results.reduce((acc, r) => acc.plus(r.amount), new Decimal(0));
    expect(sum.equals(new Decimal("100"))).toBe(true);
  });

  it("allocate 100.01 across 3 targets sums to exactly 100.01", () => {
    const results = allocateAmount(100.01, ["A", "B", "C"]);
    expect(results).toHaveLength(3);
    const sum = results.reduce((acc, r) => acc.plus(r.amount), new Decimal(0));
    expect(sum.equals(new Decimal("100.01"))).toBe(true);
  });

  it("allocate 1 across 3 targets sums to exactly 1", () => {
    const results = allocateAmount(1, ["A", "B", "C"]);
    expect(results).toHaveLength(3);
    const sum = results.reduce((acc, r) => acc.plus(r.amount), new Decimal(0));
    expect(sum.equals(new Decimal("1"))).toBe(true);
  });

  it("empty targets returns empty array", () => {
    const results = allocateAmount(100, []);
    expect(results).toHaveLength(0);
  });

  it("percentage-based allocation: 50% split across 2 targets — full total allocated", () => {
    const results = allocateAmount(1000, ["A", "B"], 50);
    expect(results).toHaveLength(2);
    const sum = results.reduce((acc, r) => acc.plus(r.amount), new Decimal(0));
    expect(sum.equals(new Decimal("1000"))).toBe(true);
    for (const r of results) {
      expect(r.percentage).toBe(25);
    }
  });

  it("percentage-based: first target gets perTargetPct, last gets residual", () => {
    const results = allocateAmount(1000, ["A", "B"], 50);
    expect(results[0].amount.equals(new Decimal("250"))).toBe(true);
    expect(results[1].amount.equals(new Decimal("750"))).toBe(true);
  });

  it("residual is assigned to last target", () => {
    const results = allocateAmount(100.01, ["A", "B", "C"]);
    const expectedLast = new Decimal("100.01")
      .minus(results[0].amount)
      .minus(results[1].amount);
    expect(results[2].amount.equals(expectedLast)).toBe(true);
  });

  it("equal split sums to total with string input", () => {
    const results = allocateAmount("33.33", ["X", "Y", "Z"]);
    const sum = results.reduce((acc, r) => acc.plus(r.amount), new Decimal(0));
    expect(sum.equals(new Decimal("33.33"))).toBe(true);
  });

  it("single target gets full amount", () => {
    const results = allocateAmount(500, ["only"]);
    expect(results).toHaveLength(1);
    expect(results[0].amount.equals(new Decimal("500"))).toBe(true);
  });
});

describe("calculateTax — tax calculation", () => {
  it("100 * 10% = 10.00 tax, 90.00 net", () => {
    const result = calculateTax(100, 10);
    expect(result.taxAmount.equals(new Decimal("10.00"))).toBe(true);
    expect(result.netAmount.equals(new Decimal("90.00"))).toBe(true);
    expect(result.grossAmount.equals(new Decimal("100"))).toBe(true);
  });

  it("333.33 * 8% = 26.67 tax, 306.66 net", () => {
    const result = calculateTax(333.33, 8);
    expect(result.taxAmount.equals(new Decimal("26.67"))).toBe(true);
    expect(result.netAmount.equals(new Decimal("306.66"))).toBe(true);
  });

  it("0 * 15% = 0 tax, 0 net", () => {
    const result = calculateTax(0, 15);
    expect(result.taxAmount.isZero()).toBe(true);
    expect(result.netAmount.isZero()).toBe(true);
  });

  it("tax + net = gross", () => {
    const result = calculateTax(1000, 12);
    const reconstructed = result.taxAmount.plus(result.netAmount);
    expect(reconstructed.equals(result.grossAmount)).toBe(true);
  });

  it("string input", () => {
    const result = calculateTax("250.00", 10);
    expect(result.taxAmount.equals(new Decimal("25.00"))).toBe(true);
    expect(result.netAmount.equals(new Decimal("225.00"))).toBe(true);
  });

  it("Decimal input", () => {
    const result = calculateTax(new Decimal("500"), 5);
    expect(result.taxAmount.equals(new Decimal("25.00"))).toBe(true);
    expect(result.netAmount.equals(new Decimal("475.00"))).toBe(true);
  });
});

describe("calculateWithholding — withholding", () => {
  it("1000 * 5% = 50.00 withholding, 950.00 net", () => {
    const result = calculateWithholding(1000, 5);
    expect(result.withholdingAmount.equals(new Decimal("50.00"))).toBe(true);
    expect(result.netAmount.equals(new Decimal("950.00"))).toBe(true);
    expect(result.grossAmount.equals(new Decimal("1000"))).toBe(true);
  });

  it("withholding + net = gross", () => {
    const result = calculateWithholding(750, 7);
    const reconstructed = result.withholdingAmount.plus(result.netAmount);
    expect(reconstructed.equals(result.grossAmount)).toBe(true);
  });

  it("0% withholding yields full net", () => {
    const result = calculateWithholding(500, 0);
    expect(result.withholdingAmount.isZero()).toBe(true);
    expect(result.netAmount.equals(new Decimal("500"))).toBe(true);
  });

  it("100% withholding yields 0 net", () => {
    const result = calculateWithholding(500, 100);
    expect(result.withholdingAmount.equals(new Decimal("500"))).toBe(true);
    expect(result.netAmount.isZero()).toBe(true);
  });
});

describe("decimalEquals — comparison with tolerance", () => {
  it("0.1 + 0.2 equals 0.3 with tolerance 0.01", () => {
    expect(decimalEquals(0.1 + 0.2, 0.3, 0.01)).toBe(true);
  });

  it("100.00 equals 100.01 with tolerance 0.01", () => {
    expect(decimalEquals(100.0, 100.01, 0.01)).toBe(true);
  });

  it("100.00 does NOT equal 100.02 with tolerance 0.01", () => {
    expect(decimalEquals(100.0, 100.02, 0.01)).toBe(false);
  });

  it("exact equality with zero tolerance", () => {
    expect(decimalEquals(42, 42, 0)).toBe(true);
  });

  it("different values with zero tolerance", () => {
    expect(decimalEquals(42, 43, 0)).toBe(false);
  });

  it("symmetric comparison", () => {
    expect(decimalEquals(100.01, 100, 0.01)).toBe(true);
    expect(decimalEquals(100, 100.01, 0.01)).toBe(true);
  });

  it("large tolerance accepts large difference", () => {
    expect(decimalEquals(0, 100, 100)).toBe(true);
  });

  it("Decimal inputs", () => {
    expect(decimalEquals(new Decimal("1.00"), new Decimal("1.00"))).toBe(true);
  });

  it("string inputs", () => {
    expect(decimalEquals("100.00", "100.01", 0.01)).toBe(true);
  });
});

describe("isValidMonetaryAmount — validation", () => {
  it("100 is valid", () => {
    expect(isValidMonetaryAmount(100)).toBe(true);
  });

  it("0 is valid", () => {
    expect(isValidMonetaryAmount(0)).toBe(true);
  });

  it("-100 is valid", () => {
    expect(isValidMonetaryAmount(-100)).toBe(true);
  });

  it("NaN is invalid", () => {
    expect(isValidMonetaryAmount(NaN)).toBe(false);
  });

  it("Infinity is invalid", () => {
    expect(isValidMonetaryAmount(Infinity)).toBe(false);
  });

  it("-Infinity is invalid", () => {
    expect(isValidMonetaryAmount(-Infinity)).toBe(false);
  });

  it("'100' string is invalid", () => {
    expect(isValidMonetaryAmount("100")).toBe(false);
  });

  it("null is invalid", () => {
    expect(isValidMonetaryAmount(null)).toBe(false);
  });

  it("undefined is invalid", () => {
    expect(isValidMonetaryAmount(undefined)).toBe(false);
  });

  it("object is invalid", () => {
    expect(isValidMonetaryAmount({})).toBe(false);
  });

  it("boolean is invalid", () => {
    expect(isValidMonetaryAmount(true)).toBe(false);
  });

  it("very small decimal is valid", () => {
    expect(isValidMonetaryAmount(0.001)).toBe(true);
  });

  it("very large number is valid", () => {
    expect(isValidMonetaryAmount(999999999999)).toBe(true);
  });
});

describe("formatDecimalCurrency — display formatting", () => {
  it("1234.56 formats as $1,234.56", () => {
    const result = formatDecimalCurrency(1234.56);
    expect(result).toBe("$1,234.56");
  });

  it("-1234.56 formats with parentheses or minus sign", () => {
    const result = formatDecimalCurrency(-1234.56);
    expect(result).toMatch(/\(?\$1,234\.56\)?|-?\$1,234\.56/);
  });

  it("0 formats as $0.00", () => {
    expect(formatDecimalCurrency(0)).toBe("$0.00");
  });

  it("Decimal input", () => {
    const result = formatDecimalCurrency(new Decimal("99.99"));
    expect(result).toBe("$99.99");
  });

  it("string input", () => {
    const result = formatDecimalCurrency("1500.50");
    expect(result).toBe("$1,500.50");
  });

  it("null returns $0.00", () => {
    expect(formatDecimalCurrency(null)).toBe("$0.00");
  });

  it("custom currency code", () => {
    const result = formatDecimalCurrency(100, "EUR");
    expect(result).toContain("100.00");
  });
});

describe("formatDecimalCompact — abbreviated display", () => {
  it("1500000 formats as $1.50M", () => {
    expect(formatDecimalCompact(1500000)).toBe("$1.50M");
  });

  it("2500 formats as $2.50K", () => {
    expect(formatDecimalCompact(2500)).toBe("$2.50K");
  });

  it("500 formats as $500.00", () => {
    expect(formatDecimalCompact(500)).toBe("$500.00");
  });

  it("1500000000 formats as $1.50B", () => {
    expect(formatDecimalCompact(1500000000)).toBe("$1.50B");
  });

  it("negative large value includes minus sign", () => {
    expect(formatDecimalCompact(-2500000)).toBe("-$2.50M");
  });

  it("0 formats as $0.00", () => {
    expect(formatDecimalCompact(0)).toBe("$0.00");
  });

  it("custom currency symbol", () => {
    expect(formatDecimalCompact(1500, "€")).toBe("€1.50K");
  });

  it("1000 formats as $1.00K", () => {
    expect(formatDecimalCompact(1000)).toBe("$1.00K");
  });

  it("999999 formats as $1000.00K (border at 1M threshold)", () => {
    expect(formatDecimalCompact(999999)).toBe("$1000.00K");
  });

  it("1000000 formats as $1.00M", () => {
    expect(formatDecimalCompact(1000000)).toBe("$1.00M");
  });
});

describe("AllocationService — GL allocation residual handling", () => {
  it("executeRule with 3 targets and totalAmount=100.01 sums to exactly 100.01", async () => {
    const { AllocationService } = await import(
      "@/server/gl/domain/allocations/allocations-service"
    );
    const service = new AllocationService();
    const rule = service.createRule({
      id: "rule-1",
      code: "ALC-001",
      name: "Overhead Allocation",
      description: "Split overhead across 3 cost centers",
      sourceAccountId: ["src-account"],
      targetAccountId: ["acct-A", "acct-B", "acct-C"],
      method: "percentage",
      isActive: true,
      companyId: "company-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const run = service.executeRule(rule.id, 100.01, "period-1", "2026", "company-1");
    const entrySum = run.entries.reduce((acc, e) => acc + e.amount, 0);

    expect(entrySum).toBe(100.01);
    expect(run.entries).toHaveLength(3);
    expect(run.totalAmount).toBe(100.01);
    expect(run.status).toBe("draft");
  });

  it("executeRule with odd split still sums to total", async () => {
    const { AllocationService } = await import(
      "@/server/gl/domain/allocations/allocations-service"
    );
    const service = new AllocationService();
    const rule = service.createRule({
      id: "rule-2",
      code: "ALC-002",
      name: "3-way Split",
      description: "",
      sourceAccountId: ["src"],
      targetAccountId: ["t1", "t2", "t3"],
      method: "percentage",
      isActive: true,
      companyId: "c1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const run = service.executeRule(rule.id, 33.33, "p1", "2026", "c1");
    const sum = run.entries.reduce((acc, e) => acc + e.amount, 0);
    expect(sum).toBe(33.33);
  });

  it("executeRule throws for non-existent rule", async () => {
    const { AllocationService } = await import(
      "@/server/gl/domain/allocations/allocations-service"
    );
    const service = new AllocationService();
    expect(() => service.executeRule("nonexistent", 100, "p", "y", "c")).toThrow(
      "AllocationRule nonexistent not found",
    );
  });
});

describe("TaxIntegrationService — calculateInvoiceTax", () => {
  it("calculates tax for multiple lines and taxTotal equals sum of line taxAmounts", async () => {
    const { TaxIntegrationService } = await import(
      "@/server/accounts-receivable/domain/tax-integration/tax-integration-service"
    );
    const service = new TaxIntegrationService();

    const lines = [
      {
        id: "line-1",
        lineNumber: 1,
        description: "Widget A",
        quantity: 10,
        unitPrice: 25.0,
        taxRate: 10,
        taxAmount: 0,
        discountPercent: 0,
        discountAmount: 0,
        lineTotal: 250,
        netTotal: 250,
      },
      {
        id: "line-2",
        lineNumber: 2,
        description: "Widget B",
        quantity: 5,
        unitPrice: 50.0,
        taxRate: 10,
        taxAmount: 0,
        discountPercent: 0,
        discountAmount: 0,
        lineTotal: 250,
        netTotal: 250,
      },
      {
        id: "line-3",
        lineNumber: 3,
        description: "Service Fee",
        quantity: 1,
        unitPrice: 100.0,
        taxRate: 10,
        taxAmount: 0,
        discountPercent: 0,
        discountAmount: 0,
        lineTotal: 100,
        netTotal: 100,
      },
    ];

    const result = service.calculateInvoiceTax(lines, "vat", 10);

    const lineTaxSum = result.lines.reduce((acc, l) => acc + l.taxAmount, 0);
    expect(result.taxTotal).toBe(lineTaxSum);
    expect(result.taxTotal).toBe(60);

    for (const line of result.lines) {
      expect(line.taxRate).toBe(10);
      expect(Number.isFinite(line.taxAmount)).toBe(true);
      const rounded = Math.round(line.taxAmount * 100) / 100;
      expect(line.taxAmount).toBe(rounded);
    }
  });

  it("0% tax yields 0 tax on all lines", async () => {
    const { TaxIntegrationService } = await import(
      "@/server/accounts-receivable/domain/tax-integration/tax-integration-service"
    );
    const service = new TaxIntegrationService();

    const lines = [
      {
        id: "l1",
        lineNumber: 1,
        description: "Item",
        quantity: 1,
        unitPrice: 100,
        taxRate: 0,
        taxAmount: 0,
        discountPercent: 0,
        discountAmount: 0,
        lineTotal: 100,
        netTotal: 100,
      },
    ];

    const result = service.calculateInvoiceTax(lines, "sales", 0);
    expect(result.taxTotal).toBe(0);
    expect(result.lines[0].taxAmount).toBe(0);
  });

  it("tax amounts are properly rounded to 2 decimals", async () => {
    const { TaxIntegrationService } = await import(
      "@/server/accounts-receivable/domain/tax-integration/tax-integration-service"
    );
    const service = new TaxIntegrationService();

    const lines = [
      {
        id: "l1",
        lineNumber: 1,
        description: "Odd amount",
        quantity: 1,
        unitPrice: 33.33,
        taxRate: 8,
        taxAmount: 0,
        discountPercent: 0,
        discountAmount: 0,
        lineTotal: 33.33,
        netTotal: 33.33,
      },
    ];

    const result = service.calculateInvoiceTax(lines, "vat", 8);
    expect(result.lines[0].taxAmount).toBe(2.67);
    expect(result.taxTotal).toBe(2.67);

    const decimalPlaces = (result.lines[0].taxAmount.toString().split(".")[1] || "").length;
    expect(decimalPlaces).toBeLessThanOrEqual(2);
  });
});
