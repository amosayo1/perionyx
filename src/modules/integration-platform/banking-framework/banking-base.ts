import type { BankConnectionData } from "../types";

export interface StatementFormat {
  type: "mt940" | "camt.053" | "iso20022" | "open-banking" | "csv" | "custom";
  parser: (content: string) => Promise<BankStatementData>;
}

export interface BankStatementData {
  accountNumber: string;
  iban?: string;
  swiftCode?: string;
  currency: string;
  balance: { opening: number; closing: number; date: string };
  transactions: BankTransaction[];
}

export interface BankTransaction {
  id: string;
  date: string;
  valueDate?: string;
  amount: number;
  currency: string;
  reference?: string;
  description?: string;
  counterparty?: string;
  counterpartyAccount?: string;
  category?: string;
  type: "debit" | "credit";
}

export class BankingConnector {
  private parsers: Map<string, StatementFormat["parser"]> = new Map();

  constructor() {
    this.registerBuiltinParsers();
  }

  private registerBuiltinParsers(): void {
    this.parsers.set("mt940", this.parseMT940.bind(this));
    this.parsers.set("camt.053", this.parseCAMT053.bind(this));
    this.parsers.set("iso20022", this.parseISO20022.bind(this));
    this.parsers.set("open-banking", this.parseOpenBanking.bind(this));
  }

  registerParser(format: string, parser: StatementFormat["parser"]): void {
    this.parsers.set(format, parser);
  }

  async parseStatement(format: string, content: string): Promise<BankStatementData> {
    const parser = this.parsers.get(format);
    if (!parser) throw new Error(`Unsupported statement format: ${format}`);
    return parser(content);
  }

  private async parseMT940(content: string): Promise<BankStatementData> {
    const lines = content.split("\n");
    const transactions: BankTransaction[] = [];
    let accountNumber = "";
    let openingBalance = 0;
    let closingBalance = 0;
    let currency = "EUR";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith(":25:")) {
        accountNumber = trimmed.slice(4).trim();
      } else if (trimmed.startsWith(":60F:") || trimmed.startsWith(":60M:")) {
        const balStr = trimmed.slice(5).trim();
        currency = balStr.slice(0, 3);
        const sign = balStr[3] === "D" ? -1 : 1;
        openingBalance = sign * parseFloat(balStr.slice(5) || "0") / 100;
      } else if (trimmed.startsWith(":62F:") || trimmed.startsWith(":62M:")) {
        const balStr = trimmed.slice(5).trim();
        const sign = balStr[3] === "D" ? -1 : 1;
        closingBalance = sign * parseFloat(balStr.slice(5) || "0") / 100;
      } else if (trimmed.startsWith(":61:")) {
        const parts = trimmed.slice(4).trim().split(/\n/);
        const txnLine = parts[0].trim();
        const descParts = parts.slice(1);
        const dateStr = txnLine.slice(0, 6);
        const sign = txnLine[6] === "D" ? "debit" as const : "credit" as const;
        const amountStr = txnLine.slice(10, 24)?.trim() || "0";
        const amount = parseFloat(amountStr.replace(",", ".")) / (amountStr.includes(",") ? 1 : 100);
        const ref = txnLine.slice(24)?.trim();
        const description = descParts.join(" ").replace(/:86:/, "").replace(/:86\?/, "").trim();
        const year = dateStr.slice(0, 2);
        const month = dateStr.slice(2, 4);
        const day = dateStr.slice(4, 6);
        const fullYear = parseInt(year) > 50 ? `19${year}` : `20${year}`;
        transactions.push({
          id: `mt940-${transactions.length + 1}`,
          date: `${fullYear}-${month}-${day}`,
          amount: Math.abs(amount),
          currency,
          reference: ref,
          description,
          type: sign,
        });
      }
    }
    return { accountNumber, currency, balance: { opening: openingBalance, closing: closingBalance, date: new Date().toISOString() }, transactions };
  }

  private async parseCAMT053(content: string): Promise<BankStatementData> {
    const transactions: BankTransaction[] = [];
    const acctMatch = content.match(/<AcctId>[\s\S]*?<IBAN>(.*?)<\/IBAN>/);
    const iban = acctMatch?.[1] || "";
    const opnMatch = content.match(/<Bal>[\s\S]*?<Cd>OPBD<\/Cd>[\s\S]*?<Amt Ccy="(\w+)">([\d.]+)<\/Amt>[\s\S]*?<CdtDbtInd>(DBIT|CRDT)<\/CdtDbtInd>/);
    const clMatch = content.match(/<Bal>[\s\S]*?<Cd>CLBD<\/Cd>[\s\S]*?<Amt Ccy="(\w+)">([\d.]+)<\/Amt>[\s\S]*?<CdtDbtInd>(DBIT|CRDT)<\/CdtDbtInd>/);
    const currency = opnMatch?.[1] || "EUR";
    const openingBalance = opnMatch ? (opnMatch[3] === "DBIT" ? -1 : 1) * parseFloat(opnMatch[2]) : 0;
    const closingBalance = clMatch ? (clMatch[3] === "DBIT" ? -1 : 1) * parseFloat(clMatch[2]) : 0;
    const txnRegex = /<Ntry>[\s\S]*?<Amt Ccy="(\w+)">([\d.]+)<\/Amt>[\s\S]*?<CdtDbtInd>(DBIT|CRDT)<\/CdtDbtInd>[\s\S]*?<BookgDt>[\s\S]*?<Dt>(\d{4}-\d{2}-\d{2})<\/Dt>[\s\S]*?(?:<NtryDtls>[\s\S]*?<Ustrd>(.*?)<\/Ustrd>)?/g;
    let match;
    while ((match = txnRegex.exec(content)) !== null) {
      const sign = match[3] === "DBIT" ? "debit" as const : "credit" as const;
      transactions.push({
        id: `camt-${transactions.length + 1}`,
        date: match[4],
        amount: parseFloat(match[2]),
        currency: match[1],
        description: match[5]?.trim(),
        type: sign,
      });
    }
    return { accountNumber: "", iban, currency, balance: { opening: openingBalance, closing: closingBalance, date: new Date().toISOString() }, transactions };
  }

  private async parseISO20022(content: string): Promise<BankStatementData> {
    const stripped = content.replace(/<[^>]+:/g, "<").replace(/<\/[^>]+:/g, "</");
    return this.parseCAMT053(stripped);
  }

  private async parseOpenBanking(content: string): Promise<BankStatementData> {
    try {
      const json = JSON.parse(content);
      const transactions: BankTransaction[] = (json.transactions ?? json.Data?.Transaction ?? []).map((t: Record<string, unknown>, i: number) => ({
        id: `ob-${i + 1}`,
        date: String(t.bookingDateTime ?? t.valueDateTime ?? t.date ?? ""),
        amount: Math.abs(Number(t.amount ?? (t.Amount as Record<string, unknown>)?.Amount ?? 0)),
        currency: String(t.currency ?? (t.Amount as Record<string, unknown>)?.Currency ?? "GBP"),
        reference: String(t.reference ?? t.TransactionReference ?? ""),
        description: String(t.description ?? t.TransactionInformation ?? ""),
        counterparty: String(t.creditorName ?? t.debtorName ?? ""),
        type: (Number(t.amount ?? 0) < 0 ? "debit" : "credit") as "debit" | "credit",
      }));
      const balance = json.balances?.[0] ?? json.Data?.Balance?.[0] ?? {};
      return {
        accountNumber: String(json.account?.id ?? json.Data?.AccountId ?? ""),
        iban: String(json.account?.iban ?? ""),
        currency: String(balance.currency ?? "GBP"),
        balance: { opening: Number(balance.opening ?? 0), closing: Number(balance.closing ?? balance.amount ?? 0), date: String(balance.date ?? new Date().toISOString()) },
        transactions,
      };
    } catch {
      throw new Error("Invalid Open Banking JSON format");
    }
  }

  async validateBankConnection(connection: BankConnectionData): Promise<{ valid: boolean; error?: string }> {
    if (!connection.iban && !connection.accountNumber) {
      return { valid: false, error: "IBAN or account number required" };
    }
    if (connection.iban && !/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(connection.iban)) {
      return { valid: false, error: "Invalid IBAN format" };
    }
    return { valid: true };
  }
}
