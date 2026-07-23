import { type CompanyBootstrapConfig } from "./types"

export interface CompanyRecord {
  id: string
  name: string
  legalName: string
  taxId: string
  fiscalYearStart: number
  fiscalYearEnd: number
  baseCurrency: string
  reportingCurrency: string
  country: string
  timezone: string
  chartOfAccountsTemplate: string
  departments: string[]
  businessUnits: string[]
  enableTax: boolean
  enableTreasury: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ChartOfAccountsEntry {
  code: string
  name: string
  type: "asset" | "liability" | "equity" | "revenue" | "expense"
  category: string
  normalBalance: "debit" | "credit"
}

export class CompanyBootstrap {
  private companies: Map<string, CompanyRecord> = new Map()

  async bootstrap(config: CompanyBootstrapConfig): Promise<CompanyRecord> {
    const id = `comp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const now = new Date()

    const company: CompanyRecord = {
      id,
      name: config.companyName,
      legalName: config.legalName ?? config.companyName,
      taxId: config.taxId ?? "",
      fiscalYearStart: config.fiscalYearStart,
      fiscalYearEnd: config.fiscalYearEnd,
      baseCurrency: config.baseCurrency,
      reportingCurrency: config.reportingCurrency,
      country: config.country ?? "US",
      timezone: config.timezone ?? "America/New_York",
      chartOfAccountsTemplate: config.chartOfAccountsTemplate ?? "standard",
      departments: config.departments,
      businessUnits: config.businessUnits,
      enableTax: config.enableTax,
      enableTreasury: config.enableTreasury,
      createdAt: now,
      updatedAt: now,
    }

    await this.createCompanyRecord(company)
    await this.createChartOfAccounts(company)
    await this.createDepartments(company)
    await this.createBusinessUnits(company)
    await this.configureFiscalYear(company)
    await this.configureCurrencies(company)

    if (config.enableTax) {
      await this.configureTaxSettings(company)
    }
    if (config.enableTreasury) {
      await this.configureTreasurySettings(company)
    }

    this.companies.set(id, company)
    return company
  }

  async getCompany(id: string): Promise<CompanyRecord | null> {
    return this.companies.get(id) ?? null
  }

  async updateCompany(id: string, updates: Partial<CompanyBootstrapConfig>): Promise<CompanyRecord | null> {
    const company = this.companies.get(id)
    if (!company) return null

    const updated: CompanyRecord = {
      ...company,
      ...(updates.companyName && { name: updates.companyName }),
      ...(updates.legalName && { legalName: updates.legalName }),
      ...(updates.taxId && { taxId: updates.taxId }),
      ...(updates.fiscalYearStart && { fiscalYearStart: updates.fiscalYearStart }),
      ...(updates.baseCurrency && { baseCurrency: updates.baseCurrency }),
      ...(updates.country && { country: updates.country }),
      ...(updates.timezone && { timezone: updates.timezone }),
      updatedAt: new Date(),
    }

    if (updates.fiscalYearStart) {
      updated.fiscalYearEnd = this.computeFiscalYearEnd(updates.fiscalYearStart)
    }

    this.companies.set(id, updated)
    return updated
  }

  getDefaultChartOfAccounts(): ChartOfAccountsEntry[] {
    return [
      { code: "1000", name: "Cash and Cash Equivalents", type: "asset", category: "current", normalBalance: "debit" },
      { code: "1100", name: "Accounts Receivable", type: "asset", category: "current", normalBalance: "debit" },
      { code: "1200", name: "Inventory", type: "asset", category: "current", normalBalance: "debit" },
      { code: "1300", name: "Prepaid Expenses", type: "asset", category: "current", normalBalance: "debit" },
      { code: "1400", name: "Fixed Assets", type: "asset", category: "non-current", normalBalance: "debit" },
      { code: "1500", name: "Accumulated Depreciation", type: "asset", category: "non-current", normalBalance: "credit" },
      { code: "2000", name: "Accounts Payable", type: "liability", category: "current", normalBalance: "credit" },
      { code: "2100", name: "Accrued Liabilities", type: "liability", category: "current", normalBalance: "credit" },
      { code: "2200", name: "Short-term Debt", type: "liability", category: "current", normalBalance: "credit" },
      { code: "2300", name: "Long-term Debt", type: "liability", category: "non-current", normalBalance: "credit" },
      { code: "2400", name: "Deferred Revenue", type: "liability", category: "current", normalBalance: "credit" },
      { code: "3000", name: "Common Stock", type: "equity", category: "paid-in-capital", normalBalance: "credit" },
      { code: "3100", name: "Retained Earnings", type: "equity", category: "retained-earnings", normalBalance: "credit" },
      { code: "3200", name: "Treasury Stock", type: "equity", category: "treasury", normalBalance: "debit" },
      { code: "4000", name: "Revenue", type: "revenue", category: "operating", normalBalance: "credit" },
      { code: "4100", name: "Service Revenue", type: "revenue", category: "operating", normalBalance: "credit" },
      { code: "4200", name: "Interest Income", type: "revenue", category: "non-operating", normalBalance: "credit" },
      { code: "5000", name: "Cost of Goods Sold", type: "expense", category: "operating", normalBalance: "debit" },
      { code: "5100", name: "Salaries and Wages", type: "expense", category: "operating", normalBalance: "debit" },
      { code: "5200", name: "Rent and Utilities", type: "expense", category: "operating", normalBalance: "debit" },
      { code: "5300", name: "Depreciation", type: "expense", category: "non-operating", normalBalance: "debit" },
    ]
  }

  getDefaultDepartments(): string[] {
    return [
      "Engineering",
      "Product",
      "Design",
      "Marketing",
      "Sales",
      "Finance",
      "Legal",
      "Operations",
      "Human Resources",
      "Customer Support",
    ]
  }

  getDefaultBusinessUnits(): string[] {
    return [
      "Corporate",
      "North America",
      "Europe",
      "Asia Pacific",
      "Latin America",
    ]
  }

  private computeFiscalYearEnd(startMonth: number): number {
    return startMonth > 1 ? startMonth - 1 : 12
  }

  private async createCompanyRecord(_company: CompanyRecord): Promise<void> {
    await Promise.resolve()
  }

  private async createChartOfAccounts(_company: CompanyRecord): Promise<void> {
    await Promise.resolve()
  }

  private async createDepartments(_company: CompanyRecord): Promise<void> {
    await Promise.resolve()
  }

  private async createBusinessUnits(_company: CompanyRecord): Promise<void> {
    await Promise.resolve()
  }

  private async configureFiscalYear(_company: CompanyRecord): Promise<void> {
    await Promise.resolve()
  }

  private async configureCurrencies(_company: CompanyRecord): Promise<void> {
    await Promise.resolve()
  }

  private async configureTaxSettings(_company: CompanyRecord): Promise<void> {
    await Promise.resolve()
  }

  private async configureTreasurySettings(_company: CompanyRecord): Promise<void> {
    await Promise.resolve()
  }
}

export const companyBootstrap = new CompanyBootstrap()
