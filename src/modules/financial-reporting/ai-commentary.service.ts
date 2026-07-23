import type { TenantContext } from "@/server/context/tenant-context";
import type {
  ReportType, ReportConfig, ReportSection, ReportRow,
  AICommentary, AICommentarySegment,
} from "./types";

export class AICommentaryService {
  static generate(
    _ctx: TenantContext,
    reportType: ReportType,
    sections: ReportSection[],
    config: ReportConfig,
  ): AICommentary {
    const segments: AICommentarySegment[] = [];
    const risks: string[] = [];
    const recommendations: string[] = [];
    const keyMetrics: AICommentary["keyMetrics"] = [];

    const totalRows = sections.flatMap((s) => this.flattenRows(s.rows));
    const totals = this.extractTotals(sections);
    const variances = this.extractVariances(sections);

    if (totalRows.length === 0) {
      return {
        summary: "No data available for the selected report parameters.",
        segments: [],
        keyMetrics: [],
        risks: [],
        recommendations: [],
        generatedAt: new Date().toISOString(),
        model: "rule-based",
      };
    }

    if (reportType === "profit-loss" || reportType === "department-pl") {
      const revenue = totals["revenue"] ?? totals["income"] ?? totals["total-income"];
      const expenses = totals["expenses"] ?? totals["total-expenses"];
      const netIncome = totals["net-income"] ?? totals["net-income"];

      if (revenue !== undefined) {
        const revValue = Math.abs(revenue);
        segments.push({
          type: "insight",
          label: "Revenue Analysis",
          content: `Total revenue for the period is ${this.formatCurrency(revValue, config.currency)}.`,
          metric: "revenue",
          value: revValue,
          severity: revValue > 0 ? "positive" : "negative",
        });
        keyMetrics.push({
          label: "Total Revenue",
          value: this.formatCurrency(revValue, config.currency),
          change: this.findVarianceChange(variances, "revenue", config),
          trend: revValue >= 0 ? "up" : "down",
        });
      }

      if (netIncome !== undefined) {
        const isProfitable = netIncome >= 0;
        segments.push({
          type: isProfitable ? "insight" : "risk",
          label: isProfitable ? "Profitability" : "Net Loss",
          content: isProfitable
            ? `Net income of ${this.formatCurrency(Math.abs(netIncome), config.currency)} indicates profitable operations.`
            : `Net loss of ${this.formatCurrency(Math.abs(netIncome), config.currency)} requires management attention.`,
          metric: "net-income",
          value: Math.abs(netIncome),
          severity: isProfitable ? "positive" : "negative",
        });

        keyMetrics.push({
          label: "Net Income",
          value: this.formatCurrency(Math.abs(netIncome), config.currency),
          change: this.findVarianceChange(variances, "net-income", config),
          trend: isProfitable ? "up" : "down",
        });

        if (!isProfitable) {
          risks.push("Net loss reported — review cost structure and revenue drivers.");
          recommendations.push("Conduct profitability analysis by product line and customer segment.");
        }
      }

      if (expenses !== undefined && expenses > 0) {
        segments.push({
          type: "observation",
          label: "Expense Summary",
          content: `Total expenses of ${this.formatCurrency(Math.abs(expenses), config.currency)}.`,
          metric: "expenses",
          value: Math.abs(expenses),
          severity: "neutral",
        });

        const topExpenseIncreases = this.findTopIncreases(totalRows, "expenses");
        if (topExpenseIncreases.length > 0) {
          segments.push({
            type: "risk",
            label: "Expense Increases",
            content: `Largest expense increases: ${topExpenseIncreases.slice(0, 3).map((e) => `${e.label} (${this.formatPercent(e.changePct ?? 0)})`).join(", ")}.`,
            severity: "warning",
          });
          risks.push(`Expense increases detected in ${topExpenseIncreases[0].label}.`);
        }
      }

      if (config.comparison !== "none" && revenue !== undefined) {
        const revChange = this.findVariancePercent(variances, "revenue");
        if (revChange !== undefined && Math.abs(revChange) > 10) {
          segments.push({
            type: "trend",
            label: "Revenue Trend",
            content: `Revenue ${revChange >= 0 ? "increased" : "decreased"} by ${this.formatPercent(Math.abs(revChange))} vs ${config.comparison.replace("-", " ")}.`,
            metric: "revenue",
            change: revChange,
            severity: revChange >= 0 ? "positive" : "negative",
          });
        }
      }
    }

    if (reportType === "balance-sheet") {
      const assets = totals["total-assets"] ?? totals["assets"];
      const liabilities = totals["total-liabilities"] ?? totals["liabilities"];
      const equity = totals["total-equity"] ?? totals["equity"];

      if (assets !== undefined) {
        keyMetrics.push({
          label: "Total Assets",
          value: this.formatCurrency(Math.abs(assets), config.currency),
          change: this.findVarianceChange(variances, "total-assets", config),
          trend: Math.abs(assets) >= 0 ? "up" : "down",
        });
      }
      if (liabilities !== undefined) {
        keyMetrics.push({
          label: "Total Liabilities",
          value: this.formatCurrency(Math.abs(liabilities), config.currency),
          change: this.findVarianceChange(variances, "total-liabilities", config),
          trend: "neutral",
        });
      }
      if (equity !== undefined) {
        keyMetrics.push({
          label: "Total Equity",
          value: this.formatCurrency(Math.abs(equity), config.currency),
          change: this.findVarianceChange(variances, "total-equity", config),
          trend: equity >= 0 ? "up" : "down",
        });
      }

      if (liabilities !== undefined && assets !== undefined && assets !== 0) {
        const debtRatio = Math.abs(liabilities) / Math.abs(assets);
        segments.push({
          type: "insight",
          label: "Debt-to-Asset Ratio",
          content: `Debt-to-asset ratio is ${(debtRatio * 100).toFixed(1)}%, indicating ${debtRatio > 0.6 ? "elevated" : "healthy"} leverage.`,
          metric: "debt-ratio",
          value: debtRatio,
          severity: debtRatio > 0.6 ? "warning" : debtRatio > 0.8 ? "negative" : "positive",
        });
        if (debtRatio > 0.8) {
          risks.push("High debt-to-asset ratio — review leverage and debt service capacity.");
          recommendations.push("Evaluate debt restructuring options and working capital optimization.");
        }
      }

      const workingCapital = assets !== undefined && liabilities !== undefined
        ? Math.abs(assets) - Math.abs(liabilities) : undefined;
      if (workingCapital !== undefined) {
        segments.push({
          type: "observation",
          label: "Working Capital",
          content: workingCapital >= 0
            ? `Positive working capital of ${this.formatCurrency(workingCapital, config.currency)} — sufficient short-term liquidity.`
            : `Negative working capital of ${this.formatCurrency(Math.abs(workingCapital), config.currency)} — potential liquidity constraint.`,
          metric: "working-capital",
          value: Math.abs(workingCapital),
          severity: workingCapital >= 0 ? "positive" : "negative",
        });
        if (workingCapital < 0) {
          risks.push("Negative working capital — review short-term liquidity and debt maturity profile.");
          recommendations.push("Optimize working capital through receivables collection and payables management.");
        }
      }
    }

    if (reportType === "cash-flow") {
      const operating = totals["operating-cash-flow"] ?? totals["operating"];
      const investing = totals["investing-cash-flow"] ?? totals["investing"];
      const financing = totals["financing-cash-flow"] ?? totals["financing"];

      if (operating !== undefined) {
        const isPositive = operating >= 0;
        segments.push({
          type: "insight",
          label: "Operating Cash Flow",
          content: isPositive
            ? `Positive operating cash flow of ${this.formatCurrency(Math.abs(operating), config.currency)} — core operations generating cash.`
            : `Negative operating cash flow of ${this.formatCurrency(Math.abs(operating), config.currency)} — operations consuming cash.`,
          metric: "operating-cash-flow",
          value: Math.abs(operating),
          severity: isPositive ? "positive" : "negative",
        });
        keyMetrics.push({
          label: "Operating Cash Flow",
          value: this.formatCurrency(Math.abs(operating), config.currency),
          change: this.findVarianceChange(variances, "operating-cash-flow", config),
          trend: isPositive ? "up" : "down",
        });
        if (!isPositive) {
          risks.push("Negative operating cash flow — core business is not self-funding.");
          recommendations.push("Review working capital management and accounts receivable collection.");
        }
      }
      if (investing !== undefined) {
        segments.push({
          type: "observation",
          label: "Investing Activities",
          content: `Net cash ${investing >= 0 ? "from" : "used in"} investing activities: ${this.formatCurrency(Math.abs(investing), config.currency)}.`,
          metric: "investing-cash-flow",
          value: Math.abs(investing),
          severity: "neutral",
        });
      }
      if (financing !== undefined) {
        segments.push({
          type: "observation",
          label: "Financing Activities",
          content: `Net cash ${financing >= 0 ? "from" : "used in"} financing activities: ${this.formatCurrency(Math.abs(financing), config.currency)}.`,
          metric: "financing-cash-flow",
          value: Math.abs(financing),
          severity: "neutral",
        });
      }
    }

    if (reportType === "treasury-report" || reportType === "cash-position") {
      const totalCash = totals["total-cash"] ?? totals["cash-balance"];
      if (totalCash !== undefined) {
        keyMetrics.push({
          label: "Total Cash Position",
          value: this.formatCurrency(Math.abs(totalCash), config.currency),
          change: this.findVarianceChange(variances, "total-cash", config),
          trend: totalCash >= 0 ? "up" : "down",
        });
        segments.push({
          type: "observation",
          label: "Cash Position",
          content: `Total cash position is ${this.formatCurrency(Math.abs(totalCash), config.currency)}.`,
          metric: "total-cash",
          value: Math.abs(totalCash),
          severity: totalCash >= 0 ? "positive" : "negative",
        });
      }
      const liquidityRisk = totalCash !== undefined && Math.abs(totalCash) < 100000;
      if (liquidityRisk) {
        risks.push("Low cash reserves — review near-term liquidity and funding requirements.");
        recommendations.push("Evaluate short-term borrowing or accelerated receivables collection.");
      }
    }

    if (reportType === "aged-receivables" || reportType === "aged-payables") {
      const totalOverdue = totals["overdue"] ?? totals["total-overdue"];
      if (totalOverdue !== undefined && totalOverdue > 0) {
        risks.push(`${reportType === "aged-receivables" ? "Receivables" : "Payables"} overdue amount: ${this.formatCurrency(Math.abs(totalOverdue), config.currency)}.`);
        segments.push({
          type: "risk",
          label: "Overdue Items",
          content: `${reportType === "aged-receivables" ? "Customer" : "Vendor"} overdue balance of ${this.formatCurrency(Math.abs(totalOverdue), config.currency)} requires attention.`,
          metric: "overdue",
          value: Math.abs(totalOverdue),
          severity: "warning",
        });
        recommendations.push(`Follow up on ${reportType === "aged-receivables" ? "overdue customer accounts" : "aging vendor payables"}.`);
      }
    }

    if (reportType === "budget-vs-actual") {
      const totalVariance = totals["total-variance"] ?? totals["variance"];
      if (totalVariance !== undefined) {
        segments.push({
          type: totalVariance >= 0 ? "insight" : "risk",
          label: "Budget Variance",
          content: totalVariance >= 0
            ? `Favorable budget variance of ${this.formatCurrency(Math.abs(totalVariance), config.currency)}.`
            : `Unfavorable budget variance of ${this.formatCurrency(Math.abs(totalVariance), config.currency)}.`,
          metric: "budget-variance",
          value: Math.abs(totalVariance),
          severity: totalVariance >= 0 ? "positive" : "negative",
        });
        if (totalVariance < 0) {
          risks.push("Unfavorable budget variance detected — review spending vs plan.");
          recommendations.push("Identify variance drivers and update forecast assumptions.");
        }
      }
    }

    if (reportType === "fx-exposure") {
      const totalExposure = totals["total-exposure"] ?? totals["net-exposure"];
      if (totalExposure !== undefined && Math.abs(totalExposure) > 0) {
        const direction = totalExposure >= 0 ? "long" : "short";
        segments.push({
          type: "risk",
          label: "FX Exposure",
          content: `Net ${direction} FX exposure of ${this.formatCurrency(Math.abs(totalExposure), config.currency)}.`,
          metric: "fx-exposure",
          value: Math.abs(totalExposure),
          severity: "warning",
        });
        risks.push(`Net ${direction} FX exposure of ${this.formatCurrency(Math.abs(totalExposure), config.currency)}.`);
        recommendations.push("Review hedging strategy for current FX exposure positions.");
      }
    }

    if (segments.length === 0) {
      segments.push({
        type: "observation",
        label: "Report Summary",
        content: `Generated ${reportType.replace(/-/g, " ")} report with ${totalRows.length} data rows across ${sections.length} sections.`,
        severity: "neutral",
      });
    }

    return {
      summary: this.buildSummary(segments, reportType),
      segments,
      keyMetrics,
      risks: [...new Set(risks)],
      recommendations: [...new Set(recommendations)],
      generatedAt: new Date().toISOString(),
      model: "rule-based",
    };
  }

  static formatSummary(summary: string): string {
    const lines = summary.split(". ").filter(Boolean);
    return lines.map((l) => l.charAt(0).toUpperCase() + l.slice(1) + (l.endsWith(".") ? "" : ".")).join(" ");
  }

  private static flattenRows(rows: ReportRow[]): ReportRow[] {
    const result: ReportRow[] = [];
    for (const row of rows) {
      result.push(row);
      if (row.children) {
        result.push(...this.flattenRows(row.children));
      }
    }
    return result;
  }

  private static extractTotals(sections: ReportSection[]): Record<string, number> {
    const totals: Record<string, number> = {};
    for (const section of sections) {
      if (section.totals) {
        Object.assign(totals, section.totals);
      }
      if (section.subtotals) {
        for (const key of Object.keys(section.subtotals)) {
          const sub = section.subtotals[key];
          if (sub) {
            const vals = Object.values(sub);
            totals[`subtotal-${key}`] = vals.reduce((a, b) => a + b, 0);
          }
        }
      }
      for (const row of section.rows) {
        this.collectTotalsFromRow(row, totals);
      }
    }
    return totals;
  }

  private static collectTotalsFromRow(row: ReportRow, acc: Record<string, number>): void {
    if (row.type === "total") {
      const vals = Object.values(row.values).filter((v): v is number => typeof v === "number");
      if (vals.length > 0) {
        acc[row.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")] = vals.reduce((a, b) => a + b, 0);
      }
    }
    if (row.children) {
      for (const child of row.children) {
        this.collectTotalsFromRow(child, acc);
      }
    }
  }

  private static extractVariances(sections: ReportSection[]): Record<string, number> {
    const variances: Record<string, number> = {};
    const flatRows = sections.flatMap((s) => this.flattenRows(s.rows));
    for (const row of flatRows) {
      if (row.variance) {
        const key = row.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const vals = Object.values(row.variance);
        if (vals.length > 0) {
          variances[key] = vals.reduce((a, b) => a + b, 0);
        }
      }
    }
    return variances;
  }

  private static findVarianceChange(
    variances: Record<string, number>,
    label: string,
    config: ReportConfig,
  ): string {
    if (config.comparison === "none") return "";
    const val = variances[label];
    if (val === undefined) return "";
    const prefix = val >= 0 ? "+" : "";
    return `${prefix}${this.formatCurrency(val, config.currency)}`;
  }

  private static findVariancePercent(
    variances: Record<string, number>,
    label: string,
  ): number | undefined {
    return variances[`${label}-pct`] ?? variances[`${label}-percent`];
  }

  private static findTopIncreases(
    rows: ReportRow[],
    _category: string,
  ): Array<{ label: string; changePct?: number }> {
    return rows
      .filter((r) => r.variance && r.type !== "total" && r.type !== "subtotal")
      .map((r) => {
        const vals = Object.values(r.variance ?? {});
        const sum = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) : 0;
        const pcts = Object.values(r.variancePercent ?? {});
        const pct = pcts.length > 0 ? pcts.reduce((a, b) => a + b, 0) / pcts.length : undefined;
        return { label: r.label, change: sum, changePct: pct };
      })
      .filter((r) => r.change > 0)
      .sort((a, b) => b.change - a.change);
  }

  private static buildSummary(segments: AICommentarySegment[], reportType: string): string {
    const insights = segments.filter((s) => s.type === "insight" || s.type === "observation");
    const risks = segments.filter((s) => s.type === "risk");
    const trends = segments.filter((s) => s.type === "trend");

    const parts: string[] = [];
    parts.push(`Financial commentary for ${reportType.replace(/-/g, " ")} report.`);

    if (insights.length > 0) {
      parts.push(`Key observations: ${insights.map((i) => i.label).join(", ")}.`);
    }
    if (trends.length > 0) {
      parts.push(`Trends: ${trends.map((t) => t.content).join(" ")}`);
    }
    if (risks.length > 0) {
      parts.push(`${risks.length} risk factor${risks.length > 1 ? "s" : ""} identified for attention.`);
    }

    return parts.join(" ");
  }

  private static formatCurrency(value: number, _currency: string): string {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  }

  private static formatPercent(value: number): string {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  }
}
