import { accountingService } from "../../../../server/accounting";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { DeprecationBanner } from "../../../../components/enterprise/deprecation-banner";
import { TrialBalanceTable } from "../../../../components/accounting/trial-balance-table";
import { IncomeStatementView } from "../../../../components/accounting/income-statement-view";
import { BalanceSheetView } from "../../../../components/accounting/balance-sheet-view";
import { CashFlowStatementView } from "../../../../components/accounting/cash-flow-statement-view";

export default function FinancialStatementsPage() {
  const accounts = accountingService.coa.getAllAccounts();
  const balances = accountingService.ledger.getAllBalances();
  const periods = accountingService.periods.getAllPeriods();
  const currentPeriod = periods.find((p) => p.status === "open") || periods[periods.length - 1];
  const trialBalance = currentPeriod ? accountingService.ledger.generateTrialBalance(currentPeriod.id, accounts) : [];
  const tbStatement = currentPeriod ? accountingService.statements.generateTrialBalance(trialBalance, "co_001", currentPeriod.id) : null;
  const statements = accountingService.statements.getAllStatements();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Financial Statements" description="Trial balance, balance sheet, income statement" />
      <DeprecationBanner redirectTo="/general-ledger" redirectLabel="Use General Ledger instead" />
      <div className="mt-6 space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-300">Trial Balance</h3>
          <TrialBalanceTable rows={trialBalance.slice(0, 30)} />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <IncomeStatementView statement={tbStatement || { id: "tmp", type: "income-statement", companyId: "co_001", periodId: currentPeriod?.id || "", name: "Income Statement", currency: "USD", rows: accounts.filter((a) => a.type === "revenue" || a.type === "cost-of-sales" || a.type === "operating-expense").map((a, i) => ({ id: `r_${i}`, statementId: "tmp", accountId: a.id, accountCode: a.code, accountName: a.name, level: a.level, type: "account", amount: (balances.find((b) => b.accountId === a.id && b.periodId === currentPeriod?.id)?.endingBalance || 0), isBold: false, isItalic: false, indent: a.level, order: i })), totalDebits: 0, totalCredits: 0, generatedBy: "system", generatedAt: new Date(), status: "final" }} />
          <BalanceSheetView statement={tbStatement || { id: "tmp_bs", type: "balance-sheet", companyId: "co_001", periodId: currentPeriod?.id || "", name: "Balance Sheet", currency: "USD", rows: accounts.filter((a) => a.type === "asset" || a.type === "liability" || a.type === "equity").map((a, i) => ({ id: `bs_${i}`, statementId: "tmp_bs", accountId: a.id, accountCode: a.code, accountName: a.name, level: a.level, type: "account", amount: (balances.find((b) => b.accountId === a.id && b.periodId === currentPeriod?.id)?.endingBalance || 0), isBold: false, isItalic: false, indent: a.level, order: i })), totalDebits: 0, totalCredits: 0, generatedBy: "system", generatedAt: new Date(), status: "final" }} />
        </div>
      </div>
    </PageContainer>
  );
}
