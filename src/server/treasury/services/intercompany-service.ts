import type { CashMovement } from "../domain/types";
import { FundingType, FundingStatus } from "../domain/types";

export interface IntercompanyLoanTerms {
  principal: number;
  currency: string;
  interestRate: number;
  maturityDate: string;
  repaymentSchedule: "BULLET" | "AMORTIZING" | "INTEREST_ONLY";
}

export interface IntercompanyLoan {
  id: string;
  companyId: string;
  lenderEntityId: string;
  borrowerEntityId: string;
  terms: IntercompanyLoanTerms;
  outstandingBalance: number;
  interestAccrued: number;
  status: "ACTIVE" | "REPAID" | "DEFAULTED";
  originatedAt: string;
  lastPaymentAt: string | null;
}

export class IntercompanyService {
  private loans = new Map<string, IntercompanyLoan>();

  originateLoan(params: {
    companyId: string;
    lenderEntityId: string;
    borrowerEntityId: string;
    terms: IntercompanyLoanTerms;
  }): IntercompanyLoan {
    const loan: IntercompanyLoan = {
      id: `icl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      companyId: params.companyId,
      lenderEntityId: params.lenderEntityId,
      borrowerEntityId: params.borrowerEntityId,
      terms: params.terms,
      outstandingBalance: params.terms.principal,
      interestAccrued: 0,
      status: "ACTIVE",
      originatedAt: new Date().toISOString(),
      lastPaymentAt: null,
    };

    this.loans.set(loan.id, loan);
    return loan;
  }

  recordPayment(loanId: string, paymentAmount: number, currency: string): CashMovement | null {
    const loan = this.loans.get(loanId);
    if (!loan || loan.status !== "ACTIVE") return null;

    const movement: CashMovement = {
      id: `cm-icl-${Date.now()}`,
      companyId: loan.companyId,
      sourceLegalEntityId: loan.borrowerEntityId,
      targetLegalEntityId: loan.lenderEntityId,
      sourceAccountId: "",
      targetAccountId: "",
      currency,
      amount: paymentAmount,
      fundingType: FundingType.INTERCOMPANY_LOAN,
      status: FundingStatus.COMPLETED,
      reason: `Intercompany loan repayment: ${loan.id}`,
      approvalRequired: true,
      approvedById: null,
      executedAt: new Date().toISOString(),
      requestedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      failureReason: null,
      referenceId: `ref-${loan.id}-${Date.now()}`,
    };

    loan.outstandingBalance = Math.max(0, loan.outstandingBalance - paymentAmount);
    loan.lastPaymentAt = movement.executedAt;

    if (loan.outstandingBalance <= 0) {
      loan.status = "REPAID";
    }

    this.loans.set(loanId, loan);

    return movement;
  }

  accrueInterest(loanId: string, days: number): number {
    const loan = this.loans.get(loanId);
    if (!loan || loan.status !== "ACTIVE") return 0;

    const dailyRate = loan.terms.interestRate / 365;
    const accrued = loan.outstandingBalance * dailyRate * days;
    loan.interestAccrued += accrued;

    this.loans.set(loanId, loan);
    return accrued;
  }

  getLoan(loanId: string): IntercompanyLoan | null {
    return this.loans.get(loanId) ?? null;
  }

  getLoansByCompany(companyId: string): IntercompanyLoan[] {
    return Array.from(this.loans.values()).filter((l) => l.companyId === companyId);
  }

  getLoansByEntity(entityId: string): IntercompanyLoan[] {
    return Array.from(this.loans.values()).filter(
      (l) => l.lenderEntityId === entityId || l.borrowerEntityId === entityId,
    );
  }

  getActiveLoans(): IntercompanyLoan[] {
    return Array.from(this.loans.values()).filter((l) => l.status === "ACTIVE");
  }

  getTotalOutstanding(companyId: string): number {
    return this.getLoansByCompany(companyId)
      .filter((l) => l.status === "ACTIVE")
      .reduce((s, l) => s + l.outstandingBalance, 0);
  }
}

export const intercompanyService = new IntercompanyService();
