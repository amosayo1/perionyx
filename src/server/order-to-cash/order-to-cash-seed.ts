import type { OrderToCashService } from "./services/order-to-cash-service";
import type {
  Customer, CustomerContact, PriceRecord, Quotation, QuotationItem,
  SalesOrder, SalesOrderItem, Contract, Invoice, InvoiceItem,
  CashReceipt, CashApplication, ARRecord, CollectionCase, CreditProfile,
  RevenueSchedule, O2CKPI, O2CForecast, O2CAlert, O2CRecommendation, O2CForecastRecord,
  CustomerStatus, CustomerRiskRating, CustomerGroup, SalesOrderStatus, QuotationStatus,
  BillingType, ARStatus, AgingBucket, CollectionStatus, CreditDecision,
  RevenueRecognitionMethod, RevenueRecognitionStatus, CashApplicationStatus,
  CashApplicationMethod, ContractType, ContractStatus, FulfillmentStatus,
  ShippingStatus, ApprovalStatus, InvoiceStatus,
} from "./types";

const NOW = new Date();
const DAY = 86400000;

function daysAgo(n: number): Date {
  return new Date(NOW.getTime() - n * DAY);
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const COMPANY_IDS: readonly string[] = ["co_001", "co_002", "co_003", "co_004", "co_005"];
const USERS: readonly string[] = ["Amos Ayodeji", "Sarah Chen", "James Miller", "Emma Wilson", "Lisa Patel", "Michael Brown", "Jennifer Davis"];
const CCY: readonly string[] = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "MXN", "BRL", "INR"];
const CUSTOMER_NAMES: readonly string[] = [
  "Acme Corp", "GlobalTech Industries", "Precision Parts Ltd", "Apex Solutions", "Meridian Enterprises",
  "Pinnacle Systems", "Vertex Manufacturing", "Crestline Supply", "Summit Distribution", "Horizon Materials",
  "Titan Components", "NovaTech Solutions", "Atlas Industrial", "CoreLogic Supply", "Integra Services",
  "Phoenix Manufacturing", "Sterling Partners", "Elite Procurement", "Premier Supplies", "Vanguard Materials",
  "Frontier Industrial", "Legacy Manufacturing", "Concord Supply Chain", "Trident Components", "Gateway Distributors",
  "Sapphire Solutions", "Diamond Supply Co", "Platinum Parts", "GoldStar Manufacturing", "Silverline Industrial",
  "Ironclad Supply", "SteelCraft Industries", "Titanium Solutions", "CopperState Components", "BrassWorks Ltd",
  "Alpine Industrial", "Pacific Rim Supply", "Atlantic Distribution", "Northern Star Materials", "Southern Cross Supply",
  "Eastern Solutions", "Western Industrial", "Central Supply Chain", "Metro Manufacturing", "CityLine Components",
  "BayState Supply", "RiverRun Distribution", "LakeView Industrial", "MountainTop Materials", "ValleyForge Parts",
  "Redwood Supply Co", "Blue Ridge Manufacturing", "GreenField Industrial", "WhiteCap Solutions", "BlackStone Materials",
  "First Rate Solutions", "Premier Service Corp", "Allied Business Group", "United Supply Chain", "National Parts Depot",
  "Liberty Industrial Supply", "Heritage Manufacturing", "Legacy Supply Group", "Continental Components", "Global Parts Network",
  "Enterprise Solutions Inc", "Strategic Supply Partners", "Innovative Manufacturing", "Superior Industrial Supply",
  "Reliable Parts Co", "Quality Supply Chain", "Advanced Components Ltd", "Integrated Solutions Corp", "Dynamic Manufacturing",
  "NextGen Supply", "Precision Engineering", "Superior Products Inc", "Apex Manufacturing", "Alpha Supply Chain",
  "Beta Components", "Gamma Industries", "Delta Supply Co", "Epsilon Manufacturing", "Zeta Industrial",
  "Omega Parts Ltd", "Sigma Supply Chain", "Lambda Components", "Kappa Industries", "Theta Supply Co",
  "NexGen Technologies", "Urban Supply Chain", "Metro Parts Depot", "Capital Industrial Supply", "Commonwealth Components",
  "First Class Supply", "Premier Parts Co", "Sterling Supply Chain", "Platinum Industrial", "Gold Standard Supply",
  "Silver Crown Components", "Bronze Star Industries", "Iron Gate Supply", "Steel Door Manufacturing", "Titan Works",
];

const PRODUCT_CODES: readonly string[] = ["PROD-001", "PROD-002", "PROD-003", "PROD-004", "PROD-005", "PROD-006", "PROD-007", "PROD-008", "PROD-009", "PROD-010"];
const PRODUCT_NAMES: readonly string[] = ["Widget Alpha", "Widget Beta", "Gadget X1", "Gadget X2", "Component Y", "Assembly Z", "Part 1000", "Part 2000", "System A", "System B"];
const UNITS: readonly string[] = ["each", "box", "kg", "m", "L", "set", "pallet"];
const SALES_REPS: readonly string[] = USERS;
const SHIPPING_METHODS: readonly string[] = ["Standard", "Express", "Overnight", "Freight", "Pickup"];
const CARRIERS: readonly string[] = ["FedEx", "UPS", "DHL", "USPS", "FreightLine"];
const DEPARTMENTS: readonly string[] = ["Sales", "Operations", "Engineering", "Services", "Support"];
const BANKS: readonly string[] = ["Chase-OP-001", "BofA-OP-002", "Wells-OP-003", "Citi-OP-004", "HSBC-OP-005"];

const STATUSES: Record<string, readonly string[]> = {
  customer: ["active", "active", "active", "active", "inactive", "inactive", "blocked", "pending", "prospect"],
  risk: ["low", "low", "low", "medium", "medium", "high", "critical"],
  group: ["enterprise", "mid-market", "mid-market", "small-business", "government", "non-profit", "partner"],
  order: ["draft", "submitted", "approved", "confirmed", "partially-fulfilled", "completed", "completed", "completed", "cancelled", "returned"],
  quote: ["draft", "sent", "sent", "accepted", "expired", "cancelled"],
  invoice: ["draft", "submitted", "approved", "paid", "paid", "paid", "disputed", "cancelled", "written-off"],
  ar: ["open", "open", "overdue", "overdue", "paid", "disputed", "written-off", "partially-paid"],
  bucket: ["current", "current", "current", "1-30", "1-30", "31-60", "61-90", "91-plus"],
  collection: ["active", "active", "resolved", "escalated", "promise-to-pay"],
  creditDec: ["approved", "approved", "approved", "denied", "pending-review", "reduced"],
  billing: ["one-time", "one-time", "one-time", "recurring", "subscription", "milestone", "progress", "manual", "automatic"],
  revMethod: ["immediate", "deferred", "accrued", "milestone", "subscription", "project"],
  revStatus: ["scheduled", "recognized", "recognized", "deferred", "cancelled"],
  contract: ["draft", "active", "active", "active", "expired", "terminated", "renewed"],
  contractType: ["annual", "monthly", "multi-year", "perpetual", "usage-based"],
  fulfillment: ["pending", "in-progress", "completed", "completed", "partial", "cancelled"],
  shipping: ["pending", "picked", "packed", "shipped", "in-transit", "delivered", "delivered", "returned"],
  cashAppStatus: ["applied", "applied", "partial", "unapplied", "disputed"],
  cashAppMethod: ["automatic", "automatic", "manual"],
};

function genCreditLimit(): number {
  return pick([25000, 50000, 100000, 150000, 250000, 500000, 1000000, 2000000]);
}

function genCustomerTags(): string[] {
  const all = ["VIP", "High-Value", "New", "At-Risk", "Strategic", "Partner", "Enterprise", "Startup", "International", "Domestic"];
  const count = rand(0, 3);
  const tags: string[] = [];
  for (let i = 0; i < count; i++) {
    const t = pick(all);
    if (!tags.includes(t)) tags.push(t);
  }
  return tags;
}

let customerIdx = 0;
let contactIdx = 0;
let priceIdx = 0;
let quoteIdx = 0;
let quoteItemIdx = 0;
let orderIdx = 0;
let orderItemIdx = 0;
let contractIdx = 0;
let invoiceIdx = 0;
let invoiceItemIdx = 0;
let receiptIdx = 0;
let appIdx = 0;
let arIdx = 0;
let caseIdx = 0;
let creditIdx = 0;
let revIdx = 0;
let kpiIdx = 0;
let forecastIdx = 0;
let alertIdx = 0;
let recIdx = 0;
let forecastRecordIdx = 0;
let fulfillmentIdx = 0;
let shipmentIdx = 0;

export function seedOrderToCash(svc: OrderToCashService): void {
  seedCustomers(svc);
  seedPricing(svc);
  seedQuotations(svc);
  seedContracts(svc);
  seedSalesOrders(svc);
  seedFulfillment(svc);
  seedShipping(svc);
  seedInvoices(svc);
  seedAR(svc);
  seedCashReceipts(svc);
  seedCollections(svc);
  seedCredit(svc);
  seedRevenueRecognition(svc);
  seedKPIs(svc);
  seedForecasts(svc);
  seedAlerts(svc);
  seedRecommendations(svc);
  seedForecastRecords(svc);
}

function seedCustomers(svc: OrderToCashService): void {
  for (let i = 0; i < 1500; i++) {
    const name = CUSTOMER_NAMES[i % CUSTOMER_NAMES.length] + (i >= CUSTOMER_NAMES.length ? ` #${Math.floor(i / CUSTOMER_NAMES.length) + 1}` : "");
    const code = `CUST-${String(i + 1).padStart(5, "0")}`;
    const creditLimit = genCreditLimit();
    const utilization = round2(creditLimit * rand(10, 90) / 100);
    const customerSince = daysAgo(rand(30, 1095));
    const status = pick(STATUSES.customer) as CustomerStatus;
    const isBlocked = status === "blocked";
    const totalOrders = rand(1, 200);
    const totalInvoices = rand(1, totalOrders * 2);
    const avgPaymentDays = rand(15, 90);
    const totalRevenue = round2(rand(10000, 5000000));
    const lifetimeValue = round2(totalRevenue * (1 + rand(5, 30) / 100));
    const ccy = pick(CCY);

    const customer: Customer = {
      id: `o2c_cust_${i + 1}`,
      code,
      name,
      legalName: `${name} Ltd`,
      status,
      riskRating: pick(STATUSES.risk) as CustomerRiskRating,
      group: pick(STATUSES.group) as CustomerGroup,
      taxId: `TAX-${String(rand(10000, 99999))}`,
      taxCountry: "US",
      currency: ccy,
      paymentTerms: pick(["Net 30", "Net 60", "Net 15", "Due on Receipt", "Net 45"]),
      billingAddress: `${rand(100, 9999)} ${pick(["Main St", "Oak Ave", "Market St", "Broadway", "Park Blvd"])}, ${pick(["New York", "Chicago", "Houston", "San Francisco", "Denver"])}, ${pick(["NY", "IL", "TX", "CA", "CO"])} ${String(rand(10000, 99999))}`,
      shippingAddress: `${rand(100, 9999)} ${pick(["Industrial Dr", "Commerce Blvd", "Trade Way", "Distribution Ct", "Warehouse Ave"])}, ${pick(["Newark", "Memphis", "Dallas", "Oakland", "Louisville"])}, ${pick(["NJ", "TN", "TX", "CA", "KY"])} ${String(rand(10000, 99999))}`,
      phone: `+1-${rand(200, 999)}-${rand(100, 999)}-${String(rand(1000, 9999))}`,
      email: `info@${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      website: `https://www.${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      creditLimit,
      creditUtilization: utilization,
      creditAvailable: round2(creditLimit - utilization),
      creditOnHold: pick([false, false, false, true]),
      totalRevenue,
      totalOrders,
      totalInvoices,
      avgPaymentDays,
      lifetimeValue,
      customerSince,
      lastOrderDate: daysAgo(rand(1, 60)),
      preferred: pick([false, false, false, true]),
      isBlocked,
      companyId: pick(COMPANY_IDS),
      tags: genCustomerTags(),
      createdAt: customerSince,
      updatedAt: daysAgo(rand(0, 7)),
    };
    svc.customers.addCustomer(customer);

    const numContacts = rand(1, 4);
    for (let j = 0; j < numContacts; j++) {
      const contact: CustomerContact = {
        id: `o2c_contact_${++contactIdx}`,
        customerId: customer.id,
        firstName: pick(["John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Maria", "James", "Patricia"]),
        lastName: pick(["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]),
        email: `contact${j + 1}@${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        phone: `+1-${rand(200, 999)}-${rand(100, 999)}-${String(rand(1000, 9999))}`,
        title: pick(["CFO", "Controller", "AP Manager", "Procurement Director", "CEO", "VP Finance", "Treasurer", "Operations Manager"]),
        department: pick(["Finance", "Accounting", "Procurement", "Operations", "Executive"]),
        isPrimary: j === 0,
        createdAt: daysAgo(rand(30, 365)),
        updatedAt: daysAgo(rand(0, 30)),
      };
      svc.customers.addContact(contact);
    }
  }
}

function seedPricing(svc: OrderToCashService): void {
  for (let i = 0; i < 500; i++) {
    const productIdx = rand(0, PRODUCT_CODES.length - 1);
    const price: PriceRecord = {
      id: `o2c_price_${++priceIdx}`,
      productCode: PRODUCT_CODES[productIdx],
      productName: PRODUCT_NAMES[productIdx],
      unit: pick(UNITS),
      unitPrice: round2(rand(10, 25000)),
      currency: pick(CCY),
      customerId: pick([undefined, ...Array.from({ length: 50 }, (_, j) => `o2c_cust_${rand(1, 1500)}`)]),
      customerGroup: pick(STATUSES.group) as CustomerGroup,
      minQuantity: rand(1, 100),
      effectiveFrom: daysAgo(rand(0, 365)),
      effectiveTo: pick([daysAgo(-rand(30, 365)), undefined]),
      isActive: pick([true, true, true, false]),
      companyId: pick(COMPANY_IDS),
      createdAt: daysAgo(rand(30, 365)),
      updatedAt: daysAgo(rand(0, 30)),
    };
    svc.pricing.addPrice(price);
  }
}

function seedQuotations(svc: OrderToCashService): void {
  const customers = svc.customers.getAllCustomers();
  for (let i = 0; i < 1200; i++) {
    const customer = pick(customers);
    const numItems = rand(1, 10);
    const items: QuotationItem[] = [];
    let subtotal = 0;
    for (let j = 0; j < numItems; j++) {
      const productIdx = rand(0, PRODUCT_CODES.length - 1);
      const qty = rand(1, 500);
      const unitPrice = round2(rand(10, 5000));
      const discPct = pick([0, 0, 0, 5, 5, 10, 10, 15, 20]);
      const totalPrice = round2(qty * unitPrice * (1 - discPct / 100));
      subtotal += totalPrice;
      items.push({
        id: `o2c_quoteitem_${++quoteItemIdx}`,
        quotationId: `o2c_quote_${i + 1}`,
        lineNumber: j + 1,
        description: PRODUCT_NAMES[productIdx],
        productCode: PRODUCT_CODES[productIdx],
        quantity: qty,
        unit: pick(UNITS),
        unitPrice,
        discountPercent: discPct,
        totalPrice,
      });
    }
    const discPct = pick([0, 0, 5, 5, 10]);
    const discAmt = round2(subtotal * discPct / 100);
    const afterDisc = subtotal - discAmt;
    const taxAmt = round2(afterDisc * 0.08);
    const totalAmt = round2(afterDisc + taxAmt);

    const quote: Quotation = {
      id: `o2c_quote_${i + 1}`,
      quoteNumber: `Q-${String(i + 1).padStart(6, "0")}`,
      customerId: customer.id,
      customerName: customer.name,
      status: pick(STATUSES.quote) as QuotationStatus,
      items,
      subtotal: round2(subtotal),
      discountPercent: discPct,
      discountAmount: discAmt,
      taxAmount: taxAmt,
      totalAmount: totalAmt,
      currency: customer.currency,
      validUntil: daysAgo(rand(-30, 60)),
      notes: pick(["", "", "", "Volume discount applied", "Special pricing for long-term partner"]),
      salesRep: pick(SALES_REPS),
      companyId: customer.companyId,
      createdAt: daysAgo(rand(15, 180)),
      updatedAt: daysAgo(rand(0, 15)),
    };
    svc.quotations.addQuotation(quote);
  }
}

function seedContracts(svc: OrderToCashService): void {
  const customers = svc.customers.getAllCustomers();
  for (let i = 0; i < 300; i++) {
    const customer = pick(customers);
    const startDate = daysAgo(rand(30, 730));
    const durationMonths = pick([3, 6, 12, 12, 12, 24, 24, 36, 60]);
    const endDate = new Date(startDate.getTime() + durationMonths * 30 * DAY);
    const autoRenew = pick([true, true, false]);
    const status = pick(STATUSES.contract) as ContractStatus;

    const contract: Contract = {
      id: `o2c_contract_${++contractIdx}`,
      contractNumber: `CTR-${String(contractIdx).padStart(5, "0")}`,
      customerId: customer.id,
      customerName: customer.name,
      type: pick(STATUSES.contractType) as ContractType,
      status,
      startDate,
      endDate,
      renewalDate: autoRenew ? endDate : (pick([endDate, undefined])),
      autoRenew,
      value: round2(rand(10000, 2000000)),
      currency: customer.currency,
      billingFrequency: pick(["Monthly", "Quarterly", "Annually", "One-time"]),
      billingType: pick(STATUSES.billing) as BillingType,
      paymentTerms: pick(["Net 30", "Net 60", "Due on Receipt"]),
      notes: pick(["", "", "", "Enterprise agreement", "Strategic partnership"]),
      companyId: customer.companyId,
      createdAt: startDate,
      updatedAt: daysAgo(rand(0, 30)),
    };
    svc.contracts.addContract(contract);
  }
}

function seedSalesOrders(svc: OrderToCashService): void {
  const customers = svc.customers.getAllCustomers();
  for (let i = 0; i < 2500; i++) {
    const customer = pick(customers);
    const numItems = rand(1, 15);
    const items: SalesOrderItem[] = [];
    let subtotal = 0;
    for (let j = 0; j < numItems; j++) {
      const productIdx = rand(0, PRODUCT_CODES.length - 1);
      const qty = rand(1, 1000);
      const qtyFulfilled = pick([0, qty, rand(0, qty)]);
      const unitPrice = round2(rand(10, 5000));
      const discPct = pick([0, 0, 0, 5, 10, 15]);
      const totalPrice = round2(qty * unitPrice * (1 - discPct / 100));
      subtotal += totalPrice;
      items.push({
        id: `o2c_orderitem_${++orderItemIdx}`,
        orderId: `o2c_order_${i + 1}`,
        lineNumber: j + 1,
        description: PRODUCT_NAMES[productIdx],
        productCode: PRODUCT_CODES[productIdx],
        productName: PRODUCT_NAMES[productIdx],
        quantity: qty,
        quantityFulfilled: qtyFulfilled,
        quantityInvoiced: pick([0, qty, rand(0, qty)]),
        unit: pick(UNITS),
        unitPrice,
        discountPercent: discPct,
        totalPrice,
        taxRate: 0.08,
        taxAmount: round2(totalPrice * 0.08),
        accountCode: pick(["4000", "4100", "4200", "4300"]),
        costCenter: pick(["CC-SALES", "CC-OPS", "CC-ENG", undefined]),
        project: pick(["", "", "", "Proj-A", "Proj-B"]),
        notes: pick(["", "", "", "Rush order", "Backorder acceptable"]),
      });
    }
    const discPct = pick([0, 0, 5, 5, 10]);
    const discAmt = round2(subtotal * discPct / 100);
    const afterDisc = subtotal - discAmt;
    const taxAmt = round2(afterDisc * 0.08);
    const shippingCost = round2(rand(0, 500));
    const totalAmt = round2(afterDisc + taxAmt + shippingCost);
    const orderStatus = pick(STATUSES.order) as SalesOrderStatus;
    const fulfStatus = orderStatus === "completed" ? "completed" as FulfillmentStatus : orderStatus === "cancelled" ? "cancelled" as FulfillmentStatus : pick(STATUSES.fulfillment) as FulfillmentStatus;
    const fulfilledCount = items.filter(it => it.quantityFulfilled >= it.quantity).length;
    const fulfPct = items.length > 0 ? Math.round((fulfilledCount / items.length) * 100) : 0;

    const order: SalesOrder = {
      id: `o2c_order_${i + 1}`,
      orderNumber: `SO-${String(i + 1).padStart(6, "0")}`,
      customerId: customer.id,
      customerName: customer.name,
      customerCode: customer.code,
      status: orderStatus,
      type: pick(["standard", "standard", "standard", "rush", "backorder", "replacement"] as const),
      quotationId: pick([`o2c_quote_${rand(1, 1200)}`, undefined]),
      contractId: pick([`o2c_contract_${rand(1, 300)}`, undefined]),
      items,
      subtotal: round2(subtotal),
      discountPercent: discPct,
      discountAmount: discAmt,
      taxAmount: taxAmt,
      totalAmount: totalAmt,
      currency: customer.currency,
      exchangeRate: customer.currency === "USD" ? 1 : round2(rand(75, 140) / 100),
      paymentTerms: pick(["Net 30", "Net 60", "Net 15", "Due on Receipt"]),
      billingType: pick(STATUSES.billing) as BillingType,
      requestedDeliveryDate: daysAgo(rand(-30, 60)),
      promisedDeliveryDate: daysAgo(rand(-15, 45)),
      actualDeliveryDate: orderStatus === "completed" ? daysAgo(rand(1, 30)) : undefined,
      shippingMethod: pick(SHIPPING_METHODS),
      shippingCost,
      trackingNumber: pick([`TRK${String(rand(100000, 999999))}`, undefined]),
      fulfillmentStatus: fulfStatus,
      fulfillmentPercent: fulfPct,
      invoiceStatus: pick(["pending", "invoiced", "partial"] as const),
      salesRep: pick(SALES_REPS),
      department: pick(DEPARTMENTS),
      notes: pick(["", "", "", "Priority customer", "Requires special handling"]),
      approvalStatus: orderStatus === "draft" ? "pending" as ApprovalStatus : pick(["pending", "approved", "approved", "approved", "rejected", "escalated"] as const),
      companyId: customer.companyId,
      entityId: pick(["le_001", "le_002", undefined]),
      createdAt: daysAgo(rand(15, 180)),
      updatedAt: daysAgo(rand(0, 15)),
    };
    svc.salesOrders.addOrder(order);
  }
}

function seedFulfillment(svc: OrderToCashService): void {
  const orders = svc.salesOrders.getAllOrders().filter(o => o.status !== "draft" && o.status !== "cancelled");
  for (const order of orders.slice(0, 1200)) {
    const f: import("./types").Fulfillment = {
      id: `o2c_fulfillment_${++fulfillmentIdx}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerName: order.customerName,
      status: pick(STATUSES.fulfillment) as FulfillmentStatus,
      items: order.items,
      fulfillmentDate: pick([daysAgo(rand(1, 60)), undefined]),
      notes: pick(["", "", "Partially fulfilled", "All items in stock"]),
      companyId: order.companyId,
      createdAt: daysAgo(rand(10, 90)),
      updatedAt: daysAgo(rand(0, 10)),
    };
    svc.fulfillment.addFulfillment(f);
  }
}

function seedShipping(svc: OrderToCashService): void {
  const fulfillments = svc.fulfillment.getAllFulfillments().filter(f => f.status === "completed" || f.status === "partial");
  for (const f of fulfillments.slice(0, 800)) {
    const s: import("./types").Shipment = {
      id: `o2c_shipment_${++shipmentIdx}`,
      orderId: f.orderId,
      orderNumber: f.orderNumber,
      customerId: f.customerId,
      customerName: f.customerName,
      trackingNumber: `TRK-${String(shipmentIdx).padStart(6, "0")}`,
      carrier: pick(CARRIERS),
      status: pick(STATUSES.shipping) as ShippingStatus,
      items: f.items,
      shipDate: daysAgo(rand(1, 30)),
      deliveryDate: daysAgo(rand(-5, 25)),
      shippingCost: round2(rand(25, 500)),
      shippingAddress: `${rand(100, 9999)} Warehouse Ave, ${pick(["Memphis", "Dallas", "Louisville"])}`,
      notes: pick(["", "", "Handle with care", "Signature required"]),
      companyId: f.companyId,
      createdAt: daysAgo(rand(10, 60)),
      updatedAt: daysAgo(rand(0, 10)),
    };
    svc.shipping.addShipment(s);
  }
}

function seedInvoices(svc: OrderToCashService): void {
  const customers = svc.customers.getAllCustomers();
  const orders = svc.salesOrders.getAllOrders();
  for (let i = 0; i < 1000; i++) {
    const order = pick(orders);
    const customer = svc.customers.getCustomer(order.customerId) ?? pick(customers);
    const invDate = daysAgo(rand(5, 120));
    const dueDate = new Date(invDate.getTime() + 30 * DAY);
    const numItems = rand(1, order.items.length);
    const usedItems = order.items.slice(0, numItems);
    const items: InvoiceItem[] = [];
    let subtotal = 0;
    for (let j = 0; j < usedItems.length; j++) {
      const oi = usedItems[j];
      const totalPrice = round2(oi.unitPrice * oi.quantity);
      subtotal += totalPrice;
      items.push({
        id: `o2c_invitem_${++invoiceItemIdx}`,
        invoiceId: `o2c_invoice_${i + 1}`,
        lineNumber: j + 1,
        description: oi.description,
        productCode: oi.productCode,
        quantity: oi.quantity,
        unit: oi.unit,
        unitPrice: oi.unitPrice,
        totalPrice,
        taxRate: 0.08,
        taxAmount: round2(totalPrice * 0.08),
        salesOrderItemId: oi.id,
        accountCode: oi.accountCode,
        costCenter: oi.costCenter,
        project: oi.project,
      });
    }
    const discAmt = round2(subtotal * pick([0, 0, 5, 10]) / 100);
    const afterDisc = subtotal - discAmt;
    const taxAmt = round2(afterDisc * 0.08);
    const totalAmt = round2(afterDisc + taxAmt);
    const paidAmt = pick([0, totalAmt, round2(totalAmt * rand(30, 70) / 100)]);
    const outstanding = round2(totalAmt - paidAmt);
    const daysOverdue = outstanding > 0 ? rand(1, 90) : 0;
    const arStatus = paidAmt >= totalAmt ? "paid" as ARStatus : daysOverdue > 0 ? "overdue" as ARStatus : "open" as ARStatus;

    const inv: Invoice = {
      id: `o2c_invoice_${i + 1}`,
      invoiceNumber: `INV-${String(i + 1).padStart(6, "0")}`,
      customerId: customer.id,
      customerName: customer.name,
      customerCode: customer.code,
      salesOrderId: order.id,
      contractId: pick([`o2c_contract_${rand(1, 300)}`, undefined]),
      status: pick(STATUSES.invoice) as InvoiceStatus,
      type: "standard",
      items,
      subtotal: round2(subtotal),
      discountAmount: discAmt,
      taxAmount: taxAmt,
      totalAmount: totalAmt,
      amountDue: totalAmt,
      amountPaid: paidAmt,
      amountOutstanding: outstanding,
      currency: order.currency,
      exchangeRate: order.exchangeRate,
      invoiceDate: invDate,
      dueDate,
      paidDate: paidAmt >= totalAmt ? daysAgo(rand(1, 30)) : undefined,
      paymentTerms: order.paymentTerms,
      notes: pick(["", "", "", "Please remit promptly"]),
      disputeReason: arStatus === "disputed" ? "Incorrect amount billed" : undefined,
      arStatus,
      agingBucket: daysOverdue === 0 ? "current" as AgingBucket : daysOverdue <= 30 ? "1-30" as AgingBucket : daysOverdue <= 60 ? "31-60" as AgingBucket : daysOverdue <= 90 ? "61-90" as AgingBucket : "91-plus" as AgingBucket,
      daysOverdue,
      billingType: order.billingType,
      revenueScheduleId: pick([`o2c_revsched_${rand(1, 250)}`, undefined]),
      companyId: customer.companyId,
      entityId: order.entityId,
      createdAt: invDate,
      updatedAt: daysAgo(rand(0, 10)),
    };
    svc.billing.addInvoice(inv);
  }

  for (let i = 0; i < 600; i++) {
    const customer = pick(customers);
    const invDate = daysAgo(rand(5, 90));
    const dueDate = new Date(invDate.getTime() + 30 * DAY);
    const totalAmt = round2(rand(100, 50000));
    const items: InvoiceItem[] = [{
      id: `o2c_invitem_${++invoiceItemIdx}`,
      invoiceId: `o2c_creditnote_${i + 1}`,
      lineNumber: 1,
      description: "Credit note adjustment",
      productCode: "CREDIT-ADJ",
      quantity: 1,
      unit: "each",
      unitPrice: -totalAmt,
      totalPrice: -totalAmt,
      taxRate: 0.08,
      taxAmount: round2(-totalAmt * 0.08),
    }];

    const cn: Invoice = {
      id: `o2c_creditnote_${i + 1}`,
      invoiceNumber: `CN-${String(i + 1).padStart(6, "0")}`,
      customerId: customer.id,
      customerName: customer.name,
      customerCode: customer.code,
      salesOrderId: pick([`o2c_order_${rand(1, 2500)}`, undefined]),
      status: pick(["approved", "paid", "paid"] as const),
      type: "credit",
      items,
      subtotal: -totalAmt,
      discountAmount: 0,
      taxAmount: round2(-totalAmt * 0.08),
      totalAmount: -round2(totalAmt * 1.08),
      amountDue: 0,
      amountPaid: 0,
      amountOutstanding: 0,
      currency: customer.currency,
      exchangeRate: 1,
      invoiceDate: invDate,
      dueDate,
      paymentTerms: "Net 30",
      arStatus: "paid",
      agingBucket: "current",
      daysOverdue: 0,
      billingType: "one-time",
      companyId: customer.companyId,
      createdAt: invDate,
      updatedAt: daysAgo(rand(0, 10)),
    };
    svc.billing.addInvoice(cn);
  }

  for (let i = 0; i < 400; i++) {
    const customer = pick(customers);
    const invDate = daysAgo(rand(5, 90));
    const dueDate = new Date(invDate.getTime() + 30 * DAY);
    const totalAmt = round2(rand(50, 25000));
    const items: InvoiceItem[] = [{
      id: `o2c_invitem_${++invoiceItemIdx}`,
      invoiceId: `o2c_debitnote_${i + 1}`,
      lineNumber: 1,
      description: "Debit note adjustment",
      productCode: "DEBIT-ADJ",
      quantity: 1,
      unit: "each",
      unitPrice: totalAmt,
      totalPrice: totalAmt,
      taxRate: 0.08,
      taxAmount: round2(totalAmt * 0.08),
    }];

    const dn: Invoice = {
      id: `o2c_debitnote_${i + 1}`,
      invoiceNumber: `DN-${String(i + 1).padStart(6, "0")}`,
      customerId: customer.id,
      customerName: customer.name,
      customerCode: customer.code,
      status: pick(["submitted", "approved", "paid"] as const),
      type: "debit",
      items,
      subtotal: totalAmt,
      discountAmount: 0,
      taxAmount: round2(totalAmt * 0.08),
      totalAmount: round2(totalAmt * 1.08),
      amountDue: round2(totalAmt * 1.08),
      amountPaid: 0,
      amountOutstanding: round2(totalAmt * 1.08),
      currency: customer.currency,
      exchangeRate: 1,
      invoiceDate: invDate,
      dueDate,
      paymentTerms: "Net 30",
      arStatus: "open",
      agingBucket: "current",
      daysOverdue: 0,
      billingType: "one-time",
      companyId: customer.companyId,
      createdAt: invDate,
      updatedAt: daysAgo(rand(0, 10)),
    };
    svc.billing.addInvoice(dn);
  }
}

function seedAR(svc: OrderToCashService): void {
  const invoices = svc.billing.getAllInvoices();
  for (const inv of invoices) {
    const ar: ARRecord = {
      id: `o2c_ar_${++arIdx}`,
      customerId: inv.customerId,
      customerName: inv.customerName,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      totalAmount: inv.totalAmount,
      amountDue: inv.amountDue,
      amountPaid: inv.amountPaid,
      amountOutstanding: inv.amountOutstanding,
      currency: inv.currency,
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      daysOverdue: inv.daysOverdue,
      status: inv.arStatus,
      agingBucket: inv.agingBucket,
      dispute: inv.status === "disputed",
      disputeReason: inv.disputeReason,
      companyId: inv.companyId,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
    };
    svc.ar.addARRecord(ar);
  }
}

function seedCashReceipts(svc: OrderToCashService): void {
  const customers = svc.customers.getAllCustomers();
  const invoices = svc.billing.getAllInvoices().filter(i => i.type === "standard");
  for (let i = 0; i < 1800; i++) {
    const customer = pick(customers);
    const amount = round2(rand(500, 200000));
    const appliedAmount = pick([amount, 0, round2(amount * rand(30, 90) / 100)]);
    const unappliedAmount = round2(amount - appliedAmount);
    const numInvoiceIds = rand(1, 5);
    const invIds: string[] = [];
    for (let j = 0; j < numInvoiceIds; j++) {
      const inv = pick(invoices);
      if (!invIds.includes(inv.id)) invIds.push(inv.id);
    }
    const status = appliedAmount >= amount ? "applied" as CashApplicationStatus : appliedAmount === 0 ? "unapplied" as CashApplicationStatus : "partial" as CashApplicationStatus;

    const receipt: CashReceipt = {
      id: `o2c_receipt_${++receiptIdx}`,
      receiptNumber: `RCPT-${String(receiptIdx).padStart(6, "0")}`,
      customerId: customer.id,
      customerName: customer.name,
      amount,
      currency: customer.currency,
      exchangeRate: 1,
      receivedDate: daysAgo(rand(1, 90)),
      method: pick(["Wire Transfer", "ACH", "Check", "Credit Card", "Direct Deposit"]),
      reference: `REF-${String(rand(100000, 999999))}`,
      bankAccount: pick(BANKS),
      status,
      applicationMethod: pick(STATUSES.cashAppMethod) as CashApplicationMethod,
      appliedAmount,
      unappliedAmount,
      invoiceIds: invIds,
      notes: pick(["", "", "", "Payment in full", "Partial payment"]),
      companyId: customer.companyId,
      createdAt: daysAgo(rand(5, 90)),
      updatedAt: daysAgo(rand(0, 10)),
    };
    svc.cashApplication.addReceipt(receipt);

    if (appliedAmount > 0) {
      const amtPerInv = round2(appliedAmount / invIds.length);
      for (const invId of invIds) {
        const app: CashApplication = {
          id: `o2c_cashapp_${++appIdx}`,
          receiptId: receipt.id,
          invoiceId: invId,
          invoiceNumber: invoices.find(i => i.id === invId)?.invoiceNumber ?? `INV-${invId}`,
          appliedAmount: amtPerInv,
          currency: customer.currency,
          exchangeRate: 1,
          appliedDate: receipt.receivedDate,
          status: "applied" as CashApplicationStatus,
          createdBy: pick(USERS),
          createdAt: receipt.receivedDate,
        };
        svc.cashApplication.addApplication(app);
      }
    }
  }
}

function seedCollections(svc: OrderToCashService): void {
  const overdueAR = svc.ar.getOverdue().slice(0, 500);
  for (const ar of overdueAR) {
    const c: CollectionCase = {
      id: `o2c_case_${++caseIdx}`,
      customerId: ar.customerId,
      customerName: ar.customerName,
      invoiceId: ar.invoiceId,
      invoiceNumber: ar.invoiceNumber,
      amount: ar.amountOutstanding,
      currency: ar.currency,
      status: pick(STATUSES.collection) as CollectionStatus,
      assignee: pick(USERS),
      action: pick(["call", "email", "letter", "visit", "escalate", "write-off"] as const),
      notes: pick(["Initial contact made", "Second reminder sent", "Escalated to manager", "Customer promised payment", ""]),
      promiseDate: pick([daysAgo(rand(-30, 30)), undefined]),
      promiseAmount: pick([ar.amountOutstanding, round2(ar.amountOutstanding * rand(30, 80) / 100), undefined]),
      contactName: pick(["John Smith", "Jane Doe", "Mike Johnson"]),
      contactEmail: `ar@${ar.customerName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      escalationLevel: pick([0, 0, 0, 1, 1, 2]),
      companyId: ar.companyId,
      createdAt: daysAgo(rand(5, 60)),
      updatedAt: daysAgo(rand(0, 10)),
    };
    svc.collections.addCase(c);
  }
}

function seedCredit(svc: OrderToCashService): void {
  const customers = svc.customers.getAllCustomers();
  for (const customer of customers) {
    const utilizationPct = customer.creditLimit > 0 ? round2((customer.creditUtilization / customer.creditLimit) * 100) : 0;
    const riskScore = rand(200, 850);
    const riskRating: CustomerRiskRating = riskScore >= 700 ? "low" : riskScore >= 600 ? "medium" : riskScore >= 400 ? "high" : "critical";
    const onHold = customer.creditOnHold;
    const decision: CreditDecision = onHold ? "pending-review" : riskScore >= 650 ? "approved" : riskScore >= 500 ? "reduced" : "denied";

    const profile: CreditProfile = {
      id: `o2c_credit_${++creditIdx}`,
      customerId: customer.id,
      customerName: customer.name,
      creditLimit: customer.creditLimit,
      creditUtilization: customer.creditUtilization,
      creditAvailable: customer.creditAvailable,
      utilizationPercent: utilizationPct,
      onHold,
      holdReason: onHold ? pick(["Exceeds credit limit", "Payment default", "High risk score", "Manual review required"]) : undefined,
      riskScore,
      riskRating,
      lastReviewDate: daysAgo(rand(30, 180)),
      reviewedBy: pick(USERS),
      decision,
      decisionDate: daysAgo(rand(5, 180)),
      companyId: customer.companyId,
      createdAt: daysAgo(rand(30, 365)),
      updatedAt: daysAgo(rand(0, 30)),
    };
    svc.credit.addProfile(profile);
  }
}

function seedRevenueRecognition(svc: OrderToCashService): void {
  const customers = svc.customers.getAllCustomers();
  for (let i = 0; i < 250; i++) {
    const customer = pick(customers);
    const totalAmount = round2(rand(10000, 500000));
    const numPeriods = pick([1, 1, 3, 6, 12, 12, 24]);
    const method = pick(STATUSES.revMethod) as RevenueRecognitionMethod;
    const recognized = numPeriods > 1 ? round2(totalAmount / numPeriods * rand(1, numPeriods)) : totalAmount;
    const deferred = round2(totalAmount - recognized);
    const status: RevenueRecognitionStatus = deferred === 0 ? "recognized" : numPeriods > 1 && recognized > 0 ? "deferred" : "scheduled";

    const sched: RevenueSchedule = {
      id: `o2c_revsched_${++revIdx}`,
      invoiceId: pick([`o2c_invoice_${rand(1, 1000)}`, undefined]),
      salesOrderId: pick([`o2c_order_${rand(1, 2500)}`, undefined]),
      customerId: customer.id,
      customerName: customer.name,
      method,
      totalAmount,
      recognizedAmount: recognized,
      deferredAmount: deferred,
      status,
      scheduledDate: daysAgo(rand(0, 365)),
      recognitionDate: pick([daysAgo(rand(1, 60)), undefined]),
      periods: numPeriods,
      currentPeriod: numPeriods > 1 ? rand(1, numPeriods) : 1,
      companyId: customer.companyId,
      createdAt: daysAgo(rand(30, 365)),
      updatedAt: daysAgo(rand(0, 30)),
    };
    svc.revenueRecognition.addSchedule(sched);
  }
}

function seedKPIs(svc: OrderToCashService): void {
  const kpiDefs: Array<{ name: string; category: O2CKPI["category"]; unit: string; target: number }> = [
    { name: "Revenue", category: "revenue", unit: "USD", target: 10000000 },
    { name: "DSO", category: "efficiency", unit: "days", target: 30 },
    { name: "Collection Rate", category: "collections", unit: "%", target: 95 },
    { name: "Credit Utilization", category: "credit", unit: "%", target: 60 },
    { name: "Customer Satisfaction", category: "customer", unit: "score", target: 90 },
    { name: "Order Fulfillment Rate", category: "efficiency", unit: "%", target: 98 },
    { name: "Invoice Accuracy", category: "efficiency", unit: "%", target: 99 },
    { name: "Cash Application Rate", category: "collections", unit: "%", target: 90 },
    { name: "Revenue Growth", category: "revenue", unit: "%", target: 15 },
    { name: "Customer Lifetime Value", category: "customer", unit: "USD", target: 500000 },
  ];

  for (const coId of COMPANY_IDS) {
    for (const def of kpiDefs) {
      for (let m = 0; m < 6; m++) {
        const value = round2(def.target * rand(60, 120) / 100);
        const prevValue = round2(def.target * rand(50, 110) / 100);
        const kpi: O2CKPI = {
          id: `o2c_kpi_${++kpiIdx}`,
          name: def.name,
          value,
          previousValue: prevValue,
          target: def.target,
          unit: def.unit,
          category: def.category,
          trend: value > prevValue ? "up" as const : value < prevValue ? "down" as const : "stable" as const,
          status: value >= def.target * 0.9 ? "good" as const : value >= def.target * 0.7 ? "warning" as const : "critical" as const,
          companyId: coId,
          period: `2026-${String(m + 1).padStart(2, "0")}`,
          date: daysAgo((5 - m) * 30),
        };
        svc.analytics.addKPI(kpi);
      }
    }
  }
}

function seedForecasts(svc: OrderToCashService): void {
  const metrics = ["revenue", "collections", "invoices", "dso"] as const;
  for (const coId of COMPANY_IDS) {
    for (const metric of metrics) {
      for (let m = 0; m < 6; m++) {
        const currentValue = round2(rand(100000, 5000000));
        const forecastValue = round2(currentValue * (1 + rand(-10, 20) / 100));
        const bounds = round2(forecastValue * rand(5, 20) / 100);
        const f: O2CForecast = {
          id: `o2c_forecast_${++forecastIdx}`,
          companyId: coId,
          metric,
          period: `2026-${String(m + 1).padStart(2, "0")}`,
          currentValue,
          forecastValue,
          lowerBound: round2(forecastValue - bounds),
          upperBound: round2(forecastValue + bounds),
          confidence: round2(rand(60, 95)),
          trend: forecastValue > currentValue ? "increasing" as const : forecastValue < currentValue ? "decreasing" as const : "stable" as const,
          date: daysAgo((5 - m) * 30),
        };
        svc.analytics.addForecast(f);
      }
    }
  }
}

function seedAlerts(svc: OrderToCashService): void {
  const alertTypes = [
    { severity: "critical" as const, type: "dso-breach", title: "DSO Exceeds Threshold", message: "Days Sales Outstanding has exceeded the 45-day threshold" },
    { severity: "warning" as const, type: "overdue-concentration", title: "Overdue Concentration Risk", message: "More than 30% of AR is concentrated in customers over 60 days past due" },
    { severity: "critical" as const, type: "credit-limit", title: "Credit Limit Breach", message: "Customer credit utilization has exceeded approved limit" },
    { severity: "warning" as const, type: "collection-delay", title: "Collection Delay Detected", message: "Average collection period has increased by 5 days vs last month" },
    { severity: "info" as const, type: "forecast-update", title: "Revenue Forecast Updated", message: "Q2 revenue forecast has been updated based on latest pipeline data" },
    { severity: "warning" as const, type: "cash-application-gap", title: "Unapplied Cash Balance High", message: "Unapplied cash receipts exceed $100K - review required" },
    { severity: "critical" as const, type: "write-off-risk", title: "Potential Write-Off Risk", message: "3 invoices over 90 days past due totaling $75K" },
    { severity: "info" as const, type: "contract-expiry", title: "Upcoming Contract Expirations", message: "5 contracts expiring within the next 30 days" },
    { severity: "warning" as const, type: "fulfillment-delay", title: "Order Fulfillment Delays", message: "10 orders are past their promised delivery dates" },
    { severity: "critical" as const, type: "revenue-recognition", title: "Revenue Recognition Error", message: "Deferred revenue balance does not match expected schedule" },
  ];

  for (const coId of COMPANY_IDS) {
    for (const def of alertTypes) {
      for (let k = 0; k < rand(1, 3); k++) {
        const alert: O2CAlert = {
          id: `o2c_alert_${++alertIdx}`,
          severity: def.severity,
          type: def.type,
          title: def.title,
          message: `${def.message} (${coId})`,
          companyId: coId,
          actionRequired: pick([true, false, false]),
          dismissed: pick([false, false, false, true]),
          createdAt: daysAgo(rand(0, 60)),
        };
        svc.analytics.addAlert(alert);
      }
    }
  }
}

function seedRecommendations(svc: OrderToCashService): void {
  const recTypes = [
    { type: "collection-strategy", title: "Optimize Collection Strategy", description: "Increase collection frequency for high-risk customers", impact: "Reduce DSO by 3-5 days", confidence: 0.85 },
    { type: "credit-policy", title: "Review Credit Limits", description: "Adjust credit limits for customers with low utilization", impact: "Free up $200K credit capacity", confidence: 0.78 },
    { type: "cash-application", title: "Automate Cash Application", description: "Implement AI-based automatic cash application", impact: "Reduce manual effort by 40 hours/month", confidence: 0.92 },
    { type: "discount-offer", title: "Early Payment Discount Program", description: "Offer 2/10 net 30 terms to improve cash flow", impact: "Accelerate collections by 8 days", confidence: 0.81 },
    { type: "dunning", title: "Automated Dunning Process", description: "Implement automated payment reminders and escalation", impact: "Reduce overdue AR by 15%", confidence: 0.88 },
    { type: "revenue-recognition", title: "Revenue Recognition Automation", description: "Automate revenue schedule creation and recognition", impact: "Save 20 hours/month in close process", confidence: 0.76 },
    { type: "contract-renewal", title: "Proactive Contract Renewals", description: "Start renewal process 60 days before expiry", impact: "Increase contract renewal rate by 20%", confidence: 0.83 },
    { type: "fulfillment-optimization", title: "Optimize Fulfillment Process", description: "Prioritize orders based on promised delivery dates", impact: "Improve on-time delivery by 12%", confidence: 0.79 },
    { type: "credit-monitoring", title: "Real-Time Credit Monitoring", description: "Monitor customer credit health indicators in real-time", impact: "Reduce bad debt by 25%", confidence: 0.87 },
    { type: "pricing-optimization", title: "Dynamic Pricing Strategy", description: "Adjust pricing based on customer segment and volume", impact: "Increase margin by 3-5%", confidence: 0.74 },
  ];

  for (const coId of COMPANY_IDS) {
    for (const def of recTypes) {
      for (let k = 0; k < rand(2, 5); k++) {
        const rec: O2CRecommendation = {
          id: `o2c_rec_${++recIdx}`,
          type: def.type,
          title: def.title,
          description: def.description,
          impact: def.impact,
          confidence: round2(def.confidence * (1 + rand(-15, 10) / 100)),
          companyId: coId,
          implemented: pick([false, false, false, true]),
          createdAt: daysAgo(rand(0, 90)),
        };
        svc.analytics.addRecommendation(rec);
      }
    }
  }
}

function seedForecastRecords(svc: OrderToCashService): void {
  const metrics = ["revenue", "collections", "invoices", "dso", "orders", "cash-receipts"] as const;
  for (const coId of COMPANY_IDS) {
    for (const metric of metrics) {
      for (let m = 0; m < 6; m++) {
        const currentValue = round2(rand(50000, 3000000));
        const forecastValue = round2(currentValue * (1 + rand(-15, 25) / 100));
        const bounds = round2(forecastValue * rand(5, 15) / 100);
        const rec: O2CForecastRecord = {
          id: `o2c_fcrecord_${++forecastRecordIdx}`,
          companyId: coId,
          metric,
          period: `2026-${String(m + 1).padStart(2, "0")}`,
          currentValue,
          forecastValue,
          lowerBound: round2(forecastValue - bounds),
          upperBound: round2(forecastValue + bounds),
          confidence: round2(rand(65, 95)),
          trend: forecastValue > currentValue ? "increasing" as const : forecastValue < currentValue ? "decreasing" as const : "stable" as const,
          date: daysAgo((5 - m) * 30),
        };
        svc.forecast.addForecastRecord(rec);
      }
    }
  }
}
