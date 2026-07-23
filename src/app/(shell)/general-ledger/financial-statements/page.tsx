import { glService } from "../../../../server/gl";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { FinancialStatementViewer } from "../../../../components/gl/financial-statement-viewer";
import { BalanceSheetCard } from "../../../../components/gl/balance-sheet-card";
import { IncomeStatementCard } from "../../../../components/gl/income-statement-card";
import { CashFlowCard } from "../../../../components/gl/cash-flow-card";

export default async function FinancialStatementsPage() {
  const statements = glService.financialStatements.getAllStatements();
  const balanceSheets = glService.financialStatements.getAllBalanceSheets();
  const incomeStatements = glService.financialStatements.getAllIncomeStatements();
  const cashFlowStatements = glService.financialStatements.getAllCashFlowStatements();

  const latestBS = balanceSheets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  const latestIS = incomeStatements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  const latestCF = cashFlowStatements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Financial Statements"
        description="Balance sheet, income statement, cash flow, and retained earnings"
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {latestBS && <BalanceSheetCard data={latestBS} />}
        {latestIS && <IncomeStatementCard data={latestIS} />}
        {latestCF && <CashFlowCard data={latestCF} />}
      </div>
      <FinancialStatementViewer statements={statements} />
    </PageContainer>
  );
}
