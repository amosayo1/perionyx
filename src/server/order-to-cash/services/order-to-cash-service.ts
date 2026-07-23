import { CustomerService } from "../domain/customers/customers-service";
import { SalesOrderService } from "../domain/sales-orders/sales-orders-service";
import { PricingService } from "../domain/pricing/pricing-service";
import { QuotationService } from "../domain/quotations/quotations-service";
import { O2CContractService } from "../domain/contracts/contracts-service";
import { FulfillmentService } from "../domain/fulfillment/fulfillment-service";
import { ShippingService } from "../domain/shipping/shipping-service";
import { BillingService } from "../domain/billing/billing-service";
import { ARService } from "../domain/accounts-receivable/accounts-receivable-service";
import { CollectionsService } from "../domain/collections/collections-service";
import { CreditService } from "../domain/credit/credit-service";
import { RevenueRecognitionService } from "../domain/revenue-recognition/revenue-recognition-service";
import { CashApplicationService } from "../domain/cash-application/cash-application-service";
import { O2CAnalyticsService } from "../domain/analytics/analytics-service";
import { O2CForecastService } from "../domain/forecast/forecast-service";

export interface O2CAggregateMetrics {
  totalCustomers: number;
  totalOrders: number;
  totalInvoices: number;
  totalRevenue: number;
  totalOutstanding: number;
  totalOverdue: number;
  totalCashReceipts: number;
  totalUnappliedCash: number;
  dso: number;
  fulfillmentRate: number;
  activeContracts: number;
  collectionCases: number;
  creditProfiles: number;
  activeAlerts: number;
  pendingRecommendations: number;
}

export class OrderToCashService {
  customers: CustomerService;
  salesOrders: SalesOrderService;
  pricing: PricingService;
  quotations: QuotationService;
  contracts: O2CContractService;
  fulfillment: FulfillmentService;
  shipping: ShippingService;
  billing: BillingService;
  ar: ARService;
  collections: CollectionsService;
  credit: CreditService;
  revenueRecognition: RevenueRecognitionService;
  cashApplication: CashApplicationService;
  analytics: O2CAnalyticsService;
  forecast: O2CForecastService;

  constructor() {
    this.customers = new CustomerService();
    this.salesOrders = new SalesOrderService();
    this.pricing = new PricingService();
    this.quotations = new QuotationService();
    this.contracts = new O2CContractService();
    this.fulfillment = new FulfillmentService();
    this.shipping = new ShippingService();
    this.billing = new BillingService();
    this.ar = new ARService();
    this.collections = new CollectionsService();
    this.credit = new CreditService();
    this.revenueRecognition = new RevenueRecognitionService();
    this.cashApplication = new CashApplicationService();
    this.analytics = new O2CAnalyticsService();
    this.forecast = new O2CForecastService();
  }

  getAggregateMetrics(): O2CAggregateMetrics {
    const customers = this.customers.getAllCustomers();
    const orders = this.salesOrders.getAllOrders();
    const invoices = this.billing.getAllInvoices();
    const receipts = this.cashApplication.getAllReceipts();
    const arRecords = this.ar.getAllARRecords();
    const alerts = this.analytics.getAllAlerts();
    const recommendations = this.analytics.getAllRecommendations();

    const totalRevenue = customers.reduce((s, c) => s + c.totalRevenue, 0);
    const totalOutstanding = invoices.reduce((s, i) => s + i.amountOutstanding, 0);
    const totalOverdue = invoices.filter(i => i.arStatus === "overdue").reduce((s, i) => s + i.amountOutstanding, 0);
    const totalUnappliedCash = receipts.filter(r => r.unappliedAmount > 0).reduce((s, r) => s + r.unappliedAmount, 0);
    const totalCashReceipts = receipts.reduce((s, r) => s + r.amount, 0);
    const avgPaymentDays = customers.length > 0 ? customers.reduce((s, c) => s + c.avgPaymentDays, 0) / customers.length : 0;
    const fulfilled = orders.filter(o => o.fulfillmentStatus === "completed").length;
    const fulfillmentRate = orders.length > 0 ? (fulfilled / orders.length) * 100 : 0;

    return {
      totalCustomers: this.customers.count(),
      totalOrders: this.salesOrders.count(),
      totalInvoices: this.billing.count(),
      totalRevenue,
      totalOutstanding,
      totalOverdue,
      totalCashReceipts,
      totalUnappliedCash,
      dso: Math.round((totalOutstanding / (totalRevenue / 365)) * 100) / 100 || 0,
      fulfillmentRate: Math.round(fulfillmentRate * 100) / 100,
      activeContracts: this.contracts.getActive().length,
      collectionCases: this.collections.count(),
      creditProfiles: this.credit.count(),
      activeAlerts: alerts.filter(a => !a.dismissed).length,
      pendingRecommendations: recommendations.filter(r => !r.implemented).length,
    };
  }
}

export const orderToCashService = new OrderToCashService();
