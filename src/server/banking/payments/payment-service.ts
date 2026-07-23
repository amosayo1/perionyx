import type { IBankProvider } from "../providers/interface";
import type { PaymentInitiationRequest } from "../providers/interface";
import type { BankConnection, PaymentRail, BankAccount } from "../domain/types";

export interface PaymentOrder {
  id: string;
  connectionId: string;
  accountId: string;
  companyId: string;
  amount: number;
  currency: string;
  counterpartyName: string;
  counterpartyIban?: string;
  counterpartyBic?: string;
  counterpartyAccountNumber?: string;
  counterpartyRoutingNumber?: string;
  reference: string;
  paymentRail: PaymentRail;
  status: PaymentStatus;
  priority: "normal" | "high" | "urgent";
  scheduledDate?: string;
  submittedAt?: string;
  settledAt?: string;
  failedAt?: string;
  failureReason?: string;
  externalPaymentId?: string;
  metadata: Record<string, unknown>;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export enum PaymentStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  SUBMITTED = "SUBMITTED",
  PROCESSING = "PROCESSING",
  SETTLED = "SETTLED",
  FAILED = "FAILED",
  REJECTED = "REJECTED",
  RETURNED = "RETURNED",
  REVERSED = "REVERSED",
  CANCELLED = "CANCELLED",
}

export interface PaymentValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class BankingPaymentService {
  private orders = new Map<string, PaymentOrder>();

  validatePayment(order: Partial<PaymentOrder>): PaymentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!order.amount || order.amount <= 0) {
      errors.push("Amount must be positive");
    }
    if (!order.currency || order.currency.length !== 3) {
      errors.push("Valid ISO 4217 currency code required");
    }
    if (!order.counterpartyName) {
      errors.push("Counterparty name is required");
    }
    if (!order.reference) {
      errors.push("Payment reference is required");
    }
    if (order.amount && order.amount > 1_000_000_000) {
      warnings.push("Amount exceeds $1B — review required");
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  async submitPayment(
    provider: IBankProvider,
    connection: BankConnection,
    order: PaymentOrder,
  ): Promise<{ success: boolean; externalPaymentId?: string; status: string; message?: string }> {
    const request: PaymentInitiationRequest = {
      accountId: order.accountId,
      amount: order.amount,
      currency: order.currency,
      counterpartyName: order.counterpartyName,
      counterpartyIban: order.counterpartyIban,
      counterpartyBic: order.counterpartyBic,
      counterpartyAccountNumber: order.counterpartyAccountNumber,
      counterpartyRoutingNumber: order.counterpartyRoutingNumber,
      reference: order.reference,
      paymentRail: order.paymentRail,
      scheduledDate: order.scheduledDate,
      priority: order.priority,
      metadata: order.metadata,
    };

    const result = await provider.initiatePayment(connection, request);

    return {
      success: result.success,
      externalPaymentId: result.paymentId,
      status: result.status,
      message: result.message,
    };
  }

  async trackPaymentStatus(
    provider: IBankProvider,
    connection: BankConnection,
    externalPaymentId: string,
  ): Promise<{ status: string; settledAt?: string; failureReason?: string }> {
    const result = await provider.getPaymentStatus(connection, externalPaymentId);

    const order = Array.from(this.orders.values()).find(
      (o) => o.externalPaymentId === externalPaymentId,
    );

    if (order) {
      order.status = result.status as PaymentStatus;
      if (result.settlementDate) order.settledAt = result.settlementDate;
      if (result.failureReason) order.failureReason = result.failureReason;
      order.updatedAt = new Date().toISOString();
      this.orders.set(order.id, order);
    }

    return {
      status: result.status,
      settledAt: result.settlementDate,
      failureReason: result.failureReason,
    };
  }

  createOrder(params: Omit<PaymentOrder, "id" | "version" | "createdAt" | "updatedAt">): PaymentOrder {
    const order: PaymentOrder = {
      ...params,
      id: crypto.randomUUID(),
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.orders.set(order.id, order);
    return order;
  }

  getOrder(orderId: string): PaymentOrder | undefined {
    return this.orders.get(orderId);
  }

  getOrdersByConnection(connectionId: string): PaymentOrder[] {
    return Array.from(this.orders.values()).filter(
      (o) => o.connectionId === connectionId,
    );
  }

  getOrdersByStatus(status: PaymentStatus): PaymentOrder[] {
    return Array.from(this.orders.values()).filter((o) => o.status === status);
  }
}

export const bankingPaymentService = new BankingPaymentService();