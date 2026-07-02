export type FinancialMessageType =
  | "pain.001"
  | "pain.002"
  | "camt.052"
  | "camt.053"
  | "camt.054"
  | "mt103"
  | "mt202"
  | "mt900"
  | "mt910"
  | "mt940"
  | "mt950";

export type MessageDirection = "sent" | "received";

export type PaymentInstructionStatus = "accepted" | "pending" | "rejected" | "settled";

export interface NormalizedPaymentInstruction {
  messageId: string;
  type: FinancialMessageType;
  direction: MessageDirection;
  createdAt: string;
  senderBic?: string;
  receiverBic?: string;
  amount: string;
  currency: string;
  debtorName?: string;
  debtorAccount?: string;
  debtorBic?: string;
  creditorName?: string;
  creditorAccount?: string;
  creditorBic?: string;
  remittanceInfo?: string;
  status: PaymentInstructionStatus;
  statusReason?: string;
}

export interface NormalizedBankStatement {
  messageId: string;
  type: "camt.053" | "mt940" | "mt950";
  accountId: string;
  accountCurrency: string;
  openingBalance: string;
  closingBalance: string;
  closingDate: string;
  entries: NormalizedStatementEntry[];
}

export interface NormalizedStatementEntry {
  entryId: string;
  amount: string;
  currency: string;
  debitCredit: "DEBIT" | "CREDIT";
  bookingDate: string;
  valueDate?: string;
  transactionType?: string;
  counterpartyName?: string;
  counterpartyAccount?: string;
  counterpartyBic?: string;
  remittanceInfo?: string;
  bankReference?: string;
}

export interface NormalizedPaymentStatusReport {
  messageId: string;
  type: "pain.002" | "camt.054";
  originalMessageId: string;
  status: PaymentInstructionStatus;
  statusReason?: string;
  settledAmount?: string;
  settledDate?: string;
  charges?: string;
}

export interface NormalizedAccountStatement {
  messageId: string;
  type: "camt.052" | "camt.053";
  accountId: string;
  currency: string;
  entries: NormalizedStatementEntry[];
}

export class Iso20022MessageBuilder {
  static createPaymentInstruction(instruction: NormalizedPaymentInstruction): Record<string, unknown> {
    return {
      messageId: instruction.messageId,
      type: instruction.type,
      amount: instruction.amount,
      currency: instruction.currency,
      debtor: { name: instruction.debtorName, account: instruction.debtorAccount },
      creditor: { name: instruction.creditorName, account: instruction.creditorAccount },
      remittanceInfo: instruction.remittanceInfo,
    };
  }

  static parseBankStatement(data: Record<string, unknown>): NormalizedBankStatement | null {
    if (!data || !data.messageId) return null;
    return {
      messageId: String(data.messageId),
      type: (data.type as NormalizedBankStatement["type"]) ?? "camt.053",
      accountId: String(data.accountId ?? ""),
      accountCurrency: String(data.accountCurrency ?? "USD"),
      openingBalance: String(data.openingBalance ?? "0"),
      closingBalance: String(data.closingBalance ?? "0"),
      closingDate: String(data.closingDate ?? new Date().toISOString()),
      entries: ((data.entries ?? []) as any[]).map((e: any) => ({
        entryId: String(e.entryId ?? ""),
        amount: String(e.amount ?? "0"),
        currency: String(e.currency ?? "USD"),
        debitCredit: e.debitCredit === "DEBIT" ? "DEBIT" : "CREDIT",
        bookingDate: String(e.bookingDate ?? new Date().toISOString()),
        valueDate: e.valueDate ? String(e.valueDate) : undefined,
        transactionType: e.transactionType ? String(e.transactionType) : undefined,
        counterpartyName: e.counterpartyName ? String(e.counterpartyName) : undefined,
        counterpartyAccount: e.counterpartyAccount ? String(e.counterpartyAccount) : undefined,
        counterpartyBic: e.counterpartyBic ? String(e.counterpartyBic) : undefined,
        remittanceInfo: e.remittanceInfo ? String(e.remittanceInfo) : undefined,
        bankReference: e.bankReference ? String(e.bankReference) : undefined,
      })),
    };
  }
}
