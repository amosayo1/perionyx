import { VendorService } from "../domain/vendors/vendors-service";
import { PurchaseRequestService } from "../domain/purchase-requests/purchase-requests-service";
import { PurchaseOrderService } from "../domain/purchase-orders/purchase-orders-service";
import { ContractService } from "../domain/contracts/contracts-service";
import { CatalogService } from "../domain/catalog/catalog-service";
import { ReceivingService } from "../domain/receiving/receiving-service";
import { InvoiceMatchingService } from "../domain/invoice-matching/invoice-matching-service";
import { ApprovalsService } from "../domain/approvals/approvals-service";
import { PaymentService } from "../domain/payments/payments-service";
import { ExpenseService } from "../domain/expenses/expenses-service";
import { ProcurementAnalyticsService } from "../domain/analytics/analytics-service";
import { ProcurementForecastService } from "../domain/forecast/forecast-service";

export class ProcurementService {
  public vendors: VendorService;
  public purchaseRequests: PurchaseRequestService;
  public purchaseOrders: PurchaseOrderService;
  public contracts: ContractService;
  public catalog: CatalogService;
  public receiving: ReceivingService;
  public invoiceMatching: InvoiceMatchingService;
  public approvals: ApprovalsService;
  public payments: PaymentService;
  public expenses: ExpenseService;
  public analytics: ProcurementAnalyticsService;
  public forecast: ProcurementForecastService;

  constructor() {
    this.vendors = new VendorService();
    this.purchaseRequests = new PurchaseRequestService();
    this.purchaseOrders = new PurchaseOrderService();
    this.contracts = new ContractService();
    this.catalog = new CatalogService();
    this.receiving = new ReceivingService();
    this.invoiceMatching = new InvoiceMatchingService();
    this.approvals = new ApprovalsService();
    this.payments = new PaymentService();
    this.expenses = new ExpenseService();
    this.analytics = new ProcurementAnalyticsService();
    this.forecast = new ProcurementForecastService();
  }

  getTotalVendors(): number {
    return this.vendors.count();
  }

  getTotalPOs(): number {
    return this.purchaseOrders.count();
  }

  getTotalInvoices(): number {
    return this.invoiceMatching.count();
  }

  getTotalReceipts(): number {
    return this.receiving.count();
  }

  getTotalContracts(): number {
    return this.contracts.count();
  }

  getPendingApprovals(): number {
    return this.approvals.getPending().length;
  }
}

export const procurementService = new ProcurementService();
