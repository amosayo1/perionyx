import type { ProcurementService } from "./services/procurement-service";
import type {
  Vendor, VendorPerformance, VendorDocument,
  PurchaseRequest, PRItem,
  PurchaseOrder, POItem,
  Contract,
  CatalogItem,
  Receipt, ReceiptItem,
  Invoice, InvoiceItem, MatchResult,
  ApprovalRequest,
  Payment,
  SpendAnalytic, ProcurementKPI, ProcurementForecast,
  ProcurementAlert, ProcurementRecommendation,
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

const COMPANY_IDS = ["co_001", "co_002", "co_003", "co_004", "co_005"] as const;
const LEGAL_ENTITIES = ["le_001", "le_002", "le_003", "le_004"] as const;
const USERS = ["Amos Ayodeji", "Sarah Chen", "James Miller", "Emma Wilson", "Lisa Patel", "Michael Brown", "Jennifer Davis"] as const;

const VENDOR_NAMES = [
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
  "ClearView Supply", "BrightStar Components", "FirstLine Distributors", "PrimeSource Industrial", "KeyStone Supply",
  "CornerStone Manufacturing", "Foundation Parts", "Bedrock Materials", "Granite Industrial", "Quarry Supply",
  "Fusion Components", "Pulse Manufacturing", "Dynamic Supply", "Innovative Parts", "NextGen Industrial",
  "TechSphere Solutions", "DataFlow Components", "NetConnect Supply", "GridWorks Industrial", "Circuit Manufacturing",
  "PowerLine Distributors", "EnergyCore Supply", "VoltMaster Industrial", "Amped Components", "Current Solutions",
  "StreamLine Supply", "FlowControl Parts", "Pipeline Industrial", "Channel Manufacturing", "Conduit Distributors",
  "PathFinder Supply", "TrailBlazer Components", "GuideStar Industrial", "Compass Solutions", "NorthStar Manufacturing",
  "Maple Leaf Supply", "Cedar Creek Industrial", "Pine Ridge Components", "Oak Valley Parts", "BirchWood Supply",
  "Harbor View Industrial", "Coastal Supply Co", "Seaside Distributors", "BayFront Manufacturing", "ShoreLine Parts",
  "CrestWave Supply", "TidePool Components", "Oceanic Industrial", "Marine Solutions", "DeepBlue Manufacturing",
  "SkyHigh Supply", "Cloud Nine Parts", "AeroSpace Components", "StratoSphere Industrial", "AtmoSphere Solutions",
  "TerraFirma Supply", "EarthWorks Manufacturing", "GeoLogic Parts", "LandMark Industrial", "Terrain Distributors",
  "Apex Logistics", "Crestline Freight", "Summit Transport", "Meridian Shipping", "Pinnacle Logistics",
  "Horizon Freight Solutions", "Titan Transport Co", "Nova Logistics", "Atlas Shipping", "CoreLine Transport",
  "Integra Logistics", "Phoenix Transport", "Sterling Shipping", "Elite Logistics", "Premier Freight",
  "Vanguard Transport", "Frontier Logistics", "Legacy Shipping", "Concord Transport", "Trident Logistics",
  "Gateway Shipping", "Sapphire Transport", "Diamond Logistics", "Platinum Freight", "GoldStar Shipping",
  "Ironclad Logistics", "SteelCraft Transport", "Titanium Shipping", "CopperState Logistics", "BrassWorks Transport",
  "Alpine Logistics", "Pacific Rim Shipping", "Atlantic Transport", "Northern Star Logistics", "Southern Cross Freight",
  "Eastern Transport", "Western Logistics", "Central Shipping", "Metro Logistics", "CityLine Transport",
  "BayState Logistics", "RiverRun Shipping", "LakeView Transport", "MountainTop Logistics", "ValleyForge Freight",
  "Redwood Transport", "Blue Ridge Logistics", "GreenField Shipping", "WhiteCap Transport", "BlackStone Logistics",
  "ClearView Freight", "BrightStar Logistics", "FirstLine Shipping", "PrimeSource Transport", "KeyStone Logistics",
  "CornerStone Shipping", "Foundation Transport", "Bedrock Logistics", "Granite Freight", "Quarry Transport",
  "Fusion Logistics", "Pulse Shipping", "Dynamic Transport", "Innovative Logistics", "NextGen Freight",
  "TechSphere Transport", "DataFlow Logistics", "NetConnect Shipping", "GridWorks Transport", "Circuit Logistics",
  "PowerLine Freight", "EnergyCore Shipping", "VoltMaster Logistics", "Amped Transport", "Current Logistics",
  "StreamLine Shipping", "FlowControl Transport", "Pipeline Logistics", "Channel Freight", "Conduit Shipping",
  "PathFinder Logistics", "TrailBlazer Transport", "GuideStar Logistics", "Compass Shipping", "NorthStar Transport",
  "Maple Leaf Logistics", "Cedar Creek Transport", "Pine Ridge Shipping", "Oak Valley Logistics", "BirchWood Freight",
  "Harbor View Transport", "Coastal Logistics", "Seaside Shipping", "BayFront Transport", "ShoreLine Logistics",
  "CrestWave Shipping", "TidePool Transport", "Oceanic Logistics", "Marine Freight", "DeepBlue Shipping",
  "SkyHigh Logistics", "Cloud Nine Transport", "AeroSpace Shipping", "StratoSphere Logistics", "AtmoSphere Transport",
  "TerraFirma Logistics", "EarthWorks Shipping", "GeoLogic Transport", "LandMark Logistics", "Terrain Freight",
  "Quantum Manufacturing", "Vector Components", "Matrix Supply Co", "Binary Parts", "Digital Industrial",
  "Synergy Solutions", "Catalyst Supply", "FusionPoint Manufacturing", "NexGen Components", "Optimum Distributors",
  "Vivid Industrial", "Prism Supply Chain", "Spectrum Parts", "Chromatic Manufacturing", "Radiance Solutions",
  "Lucent Supply", "GlowStar Components", "Beacon Industrial", "Torch Manufacturing", "Lantern Supply Co",
  "Evergreen Industrial", "SpringField Components", "SummerSet Supply", "Autumn Ridge Parts", "WinterHaven Manufacturing",
  "FairView Supply", "BroadWay Industrial", "MainStreet Components", "CrossRoads Parts", "FourCorners Supply",
  "Peninsula Manufacturing", "Island Supply Co", "Archipelago Parts", "CapePoint Industrial", "Headland Components",
  "Crystal Clear Supply", "GemStone Manufacturing", "Jewel Parts", "Pearl Industrial", "Coral Reef Components",
  "SunBelt Supply", "Delta Manufacturing", "Estuary Parts", "RiverBend Industrial", "CreekSide Components",
  "MeadowView Supply", "Prairie Industrial", "PlainField Parts", "GrassLand Manufacturing", "FieldStone Components",
  "Highland Supply", "LowLand Manufacturing", "RidgeLine Parts", "CrestView Industrial", "Peak Performance Supply",
  "ApexPro Components", "Superior Manufacturing", "Ultimate Supply Co", "PrimeLine Parts", "Select Industrial",
  "Choice Components", "BestValue Supply", "TopNotch Manufacturing", "FirstClass Parts", "PremiumPlus Industrial",
  "ElitePro Supply", "MasterCraft Components", "Expert Manufacturing", "ProSource Parts", "Specialty Industrial Supply",
  "Century Manufacturing", "Millennium Components", "Era Supply Co", "Age Industrial", "Epoch Parts",
  "Phase Manufacturing", "Stage Components", "Cycle Supply", "Rhythm Industrial", "Tempo Parts",
  "Swift Logistics", "Rapid Supply Co", "Express Manufacturing", "QuickShip Parts", "FastTrack Industrial",
  "Direct Source Supply", "StraightLine Components", "TrueNorth Manufacturing", "PurePath Parts", "ClearRoute Industrial",
  "United Manufacturing", "Allied Supply Co", "Consolidated Parts", "Amalgamated Industrial", "Federated Components",
  "National Supply Chain", "Regional Manufacturing", "Local Parts Co", "Domestic Industrial", "Civic Components",
  "Shield Manufacturing", "Guardian Supply", "Sentinel Parts", "Defender Industrial", "Protector Components",
  "Triumph Manufacturing", "Victory Supply Co", "Champion Parts", "Award Industrial", "Honor Components",
  "Crown Manufacturing", "Royal Supply Co", "Regal Parts", "Imperial Industrial", "Sovereign Components",
  "Fidelity Supply", "Integrity Manufacturing", "Honest Parts", "Trust Industrial", "Reliant Components",
  "SureLine Supply", "Certain Manufacturing", "Assured Parts", "Guaranteed Industrial", "Warranted Components",
  "Everest Supply", "SummitPro Manufacturing", "PeakLine Parts", "Zenith Industrial", "ApexPeak Components",
  "Orion Supply Co", "Vega Manufacturing", "Sirius Parts", "Andromeda Industrial", "Galaxy Components",
  "SolarWind Supply", "Lunar Manufacturing", "Stellar Parts", "Cosmic Industrial", "Nebula Components",
  "Infinity Supply Co", "Eternal Manufacturing", "Perpetual Parts", "Endless Industrial", "Unlimited Components",
  "Thunder Supply", "Lightning Manufacturing", "Storm Parts", "Cyclone Industrial", "Hurricane Components",
  "Falcon Supply Co", "Eagle Manufacturing", "Hawk Parts", "Raven Industrial", "Phoenix Components",
  "Tiger Manufacturing", "Lion Supply Co", "Panther Parts", "Jaguar Industrial", "Leopard Components",
  "Wolf Supply Co", "Bear Manufacturing", "Fox Parts", "Deer Industrial", "Hawk Components",
  "Maple Supply Co", "Oak Manufacturing", "Pine Parts", "Cedar Industrial", "Birch Components",
  "Iron Mountain Supply", "Stone Ridge Manufacturing", "Rock Solid Parts", "Boulder Industrial", "Pebble Components",
  "Arctic Supply Co", "Glacier Manufacturing", "Frost Parts", "Polar Industrial", "Tundra Components",
  "Desert Supply Co", "Sand Manufacturing", "Dune Parts", "Oasis Industrial", "Mirage Components",
  "Forest Supply Co", "Woodland Manufacturing", "Grove Parts", "Thicket Industrial", "Timber Components",
  "Canyon Supply Co", "Mesa Manufacturing", "Butte Parts", "Plateau Industrial", "Valley Components",
  "Beacon Hill Supply", "Bunker Manufacturing", "Fortress Parts", "Tower Industrial", "Spire Components",
  "Jade Manufacturing", "Ruby Supply Co", "Emerald Parts", "Topaz Industrial", "Amber Components",
  "Indigo Supply Co", "Violet Manufacturing", "Crimson Parts", "Scarlet Industrial", "Azure Components",
  "Heritage Supply", "LegacyPro Manufacturing", "Tradition Parts", "Classic Industrial", "Timeless Components",
  "Principal Supply Co", "Cardinal Manufacturing", "Capital Parts", "Senatorial Industrial", "Diplomat Components",
  "Envoy Supply Co", "Consul Manufacturing", "Ambassador Parts", "Attaché Industrial", "Delegate Components",
  "Acumen Supply", "Sage Manufacturing", "Wise Parts", "BrightMind Industrial", "Clever Components",
  "Dynamic Solutions", "Vibrant Manufacturing", "Energetic Supply", "Lively Parts", "Active Industrial",
  "Momentum Supply", "Impulse Manufacturing", "Thrust Parts", "Drive Industrial", "Motion Components",
  "Anchor Supply Co", "Dock Manufacturing", "Port Parts", "Wharf Industrial", "Pier Components",
  "Tidal Supply Co", "Wave Manufacturing", "Current Parts", "Stream Industrial", "Ripple Components",
  "Blossom Supply", "Bloom Manufacturing", "Flora Parts", "Garden Industrial", "Meadow Components",
  "Fountain Supply", "Spring Manufacturing", "Well Parts", "Aqua Industrial", "Brook Components",
];

function getPaymentMethod(): "wire" | "ach" | "check" | "credit-card" | "virtual-card" | "ach-same-day" {
  return pick(["wire", "ach", "check", "credit-card", "virtual-card", "ach-same-day"]);
}

function getPOStatus(hasReceipts: boolean = false): "draft" | "approved" | "sent" | "acknowledged" | "partially-received" | "fully-received" | "closed" | "cancelled" {
  if (hasReceipts) return pick(["partially-received", "fully-received", "closed"]);
  return pick(["draft", "approved", "sent", "acknowledged", "cancelled"]);
}

function generateVendors(svc: ProcurementService): void {
  const categories: Array<"supplier" | "contractor" | "consultant" | "service-provider" | "distributor" | "manufacturer"> = [
    "supplier", "contractor", "consultant", "service-provider", "distributor", "manufacturer",
  ];
  const riskLevels: Array<"low" | "medium" | "high" | "critical"> = ["low", "medium", "high", "critical"];
  const statuses: Array<"active" | "inactive" | "blocked" | "pending" | "suspended"> = [
    "active", "active", "active", "active", "inactive", "blocked", "pending", "suspended",
  ];

  for (let i = 0; i < 800; i++) {
    const vn = VENDOR_NAMES[i];
    const prefix = String(i + 1).padStart(4, "0");
    const companyId = pick(COMPANY_IDS);
    const vendor: Vendor = {
      id: `ven_${prefix}`,
      code: `V${prefix}`,
      name: vn,
      legalName: `${vn} Inc.`,
      status: pick(statuses),
      riskLevel: pick(riskLevels),
      category: pick(categories),
      taxId: `TAX-${rand(10000000, 99999999)}`,
      taxCountry: pick(["US", "US", "US", "GB", "CA", "DE", "JP"]),
      currency: "USD",
      billingAddress: `${rand(100, 9999)} ${pick(["Main St", "Oak Ave", "Industrial Blvd", "Park Lane", "Market St"])}, ${pick(["New York", "Chicago", "San Francisco", "Dallas", "Atlanta", "Seattle", "Boston"])}, ${pick(["NY", "IL", "CA", "TX", "GA", "WA", "MA"])} ${rand(10000, 99999)}`,
      shippingAddress: `${rand(100, 9999)} ${pick(["Warehouse Dr", "Distribution Ct", "Logistics Way", "Commerce Blvd", "Supply Rd"])}, ${pick(["Newark", "Memphis", "Louisville", "Dallas", "Atlanta"])}, ${pick(["NJ", "TN", "KY", "TX", "GA"])} ${rand(10000, 99999)}`,
      paymentTerms: pick(["Net30", "Net45", "Net60", "2/10 Net30"]),
      paymentMethod: getPaymentMethod(),
      creditLimit: rand(50000, 5000000),
      currencyCreditLimit: rand(50000, 5000000),
      bankAccount: `****${rand(1000, 9999)}`,
      bankName: pick(["Chase", "Bank of America", "Wells Fargo", "Citi", "HSBC"]),
      bankCountry: "US",
      preferred: Math.random() > 0.7,
      preferredRank: Math.random() > 0.7 ? rand(1, 10) : undefined,
      isBlocked: Math.random() > 0.92,
      blockReason: Math.random() > 0.92 ? pick(["Compliance issue", "Payment dispute", "Inactive", "Risk hold"]) : undefined,
      rating: rand(1, 100),
      totalSpend: round2(Math.random() * 5000000),
      totalOrders: rand(1, 500),
      avgPaymentDays: rand(15, 60),
      onboardingDate: daysAgo(rand(60, 730)),
      lastOrderDate: Math.random() > 0.1 ? daysAgo(rand(1, 90)) : undefined,
      contactName: pick(USERS),
      contactEmail: `contact@${vn.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      contactPhone: `+1${rand(200, 999)}${rand(100, 999)}${rand(1000, 9999)}`,
      companyId,
      tags: [pick(categories), pick(["premium", "standard", "economy"])],
      createdAt: daysAgo(rand(60, 730)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.vendors.addVendor(vendor);

    if (Math.random() > 0.4) {
      const perf: VendorPerformance = {
        id: `vperf_${prefix}_${rand(1, 4)}`,
        vendorId: vendor.id,
        period: pick(["2025-Q1", "2025-Q2", "2025-Q3", "2025-Q4", "2026-Q1"]),
        onTimeDelivery: rand(60, 100),
        qualityScore: rand(70, 100),
        responseTime: rand(1, 72),
        invoiceAccuracy: rand(80, 100),
        returnRate: round2(Math.random() * 10),
        overallScore: rand(65, 100),
        totalOrders: rand(5, 100),
        totalAmount: round2(Math.random() * 500000),
        createdAt: daysAgo(rand(1, 180)),
      };
      svc.vendors.addPerformance(perf);
    }

    if (Math.random() > 0.6) {
      const doc: VendorDocument = {
        id: `vdoc_${prefix}_${rand(1, 3)}`,
        vendorId: vendor.id,
        type: pick(["W-9", "COI", "MSA", "SOW", "NDA", "License"]),
        name: pick(["W-9 Form", "Certificate of Insurance", "Master Service Agreement", "Statement of Work", "NDA", "Business License"]),
        reference: `REF-${rand(10000, 99999)}`,
        expiryDate: Math.random() > 0.3 ? daysAgo(rand(-30, 365)) : undefined,
        status: pick(["valid", "valid", "valid", "expired", "pending"]),
        createdAt: daysAgo(rand(30, 365)),
        updatedAt: daysAgo(rand(1, 30)),
      };
      svc.vendors.addDocument(doc);
    }
  }
}

function generatePurchaseRequests(svc: ProcurementService): void {
  const departments = ["Engineering", "Sales", "Marketing", "Finance", "Operations", "IT", "HR", "Legal", "Procurement", "R&D"];
  const categories = ["IT Hardware", "Software", "Office Supplies", "Consulting", "Marketing", "Travel", "Facilities", "Raw Materials", "Packaging", "Logistics", "Maintenance", "Training"];
  const units = ["ea", "box", "case", "pallet", "lbs", "kg", "hours", "days", "months", "service"];
  const urgencies: Array<"low" | "medium" | "high" | "critical"> = ["low", "medium", "medium", "high", "critical"];

  for (let i = 0; i < 1500; i++) {
    const prefix = String(i + 1).padStart(5, "0");
    const companyId = pick(COMPANY_IDS);
    const numItems = rand(1, 5);
    const items: PRItem[] = [];
    let totalAmount = 0;

    for (let j = 0; j < numItems; j++) {
      const qty = rand(1, 100);
      const unitPrice = round2(Math.random() * 5000 + 1);
      const totalPrice = round2(qty * unitPrice);
      totalAmount += totalPrice;
      items.push({
        id: `pri_${prefix}_${j + 1}`,
        prId: `pr_${prefix}`,
        lineNumber: j + 1,
        description: `${pick(categories)} - ${pick(["Standard", "Premium", "Basic", "Deluxe", "Enterprise"])} ${pick(["Package", "Bundle", "Kit", "Set", "Supply"])}`,
        category: pick(categories),
        quantity: qty,
        unit: pick(units),
        unitPrice,
        totalPrice,
        currency: "USD",
        needByDate: daysAgo(rand(-30, 60)),
        vendorId: `ven_${String(rand(1, 800)).padStart(4, "0")}`,
        accountCode: pick(["ACCT-001", "ACCT-002", "ACCT-003", "ACCT-004"]),
        costCenter: Math.random() > 0.3 ? pick(["CC-001", "CC-002", "CC-003", "CC-004", "CC-005"]) : undefined,
        project: Math.random() > 0.5 ? pick(["PROJ-A", "PROJ-B", "PROJ-C"]) : undefined,
      });
    }

    const status: "draft" | "submitted" | "approved" | "rejected" | "cancelled" | "converted" = pick(["draft", "submitted", "approved", "rejected", "cancelled", "converted", "approved", "approved"]);
    const pr: PurchaseRequest = {
      id: `pr_${prefix}`,
      prNumber: svc.purchaseRequests.generatePRNumber(),
      title: `${pick(["Request for", "Purchase of", "Acquisition of", "Procurement of", "Order for"])} ${pick(categories)}`,
      description: `Purchase request ${i + 1} for ${pick(categories)} purposes`,
      status,
      department: pick(departments),
      requestedBy: pick(USERS),
      requesterEmail: `${pick(USERS).toLowerCase().replace(/\s+/g, ".")}@company.com`,
      approverId: Math.random() > 0.3 ? pick(USERS) : undefined,
      items,
      totalAmount: round2(totalAmount),
      currency: "USD",
      budgetCode: Math.random() > 0.3 ? pick(["BG-001", "BG-002", "BG-003", "BG-004"]) : undefined,
      budgetValidated: Math.random() > 0.3,
      urgency: pick(urgencies),
      notes: Math.random() > 0.5 ? `Urgent request for ${pick(["Q4", "Q1", "project", "compliance"])}` : undefined,
      rejectionReason: status === "rejected" ? pick(["Budget exceeded", "Insufficient justification", "Duplicate request"]) : undefined,
      companyId,
      entityId: pick(LEGAL_ENTITIES),
      createdAt: daysAgo(rand(1, 180)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.purchaseRequests.addPR(pr);
  }
}

function generatePurchaseOrders(svc: ProcurementService): void {
  const departments = ["Engineering", "Sales", "Marketing", "Finance", "Operations", "IT", "HR", "Legal", "Procurement", "R&D"];
  const categories = ["IT Hardware", "Software", "Office Supplies", "Consulting", "Marketing", "Travel", "Facilities", "Raw Materials", "Packaging", "Logistics", "Maintenance", "Training"];
  const units = ["ea", "box", "case", "pallet", "lbs", "kg", "hours", "days", "months", "service"];

  for (let i = 0; i < 1200; i++) {
    const prefix = String(i + 1).padStart(5, "0");
    const vendorId = `ven_${String(rand(1, 800)).padStart(4, "0")}`;
    const vendor = svc.vendors.getVendor(vendorId);
    const companyId = pick(COMPANY_IDS);
    const numItems = rand(1, 5);
    const items: POItem[] = [];
    let totalAmount = 0;

    for (let j = 0; j < numItems; j++) {
      const qty = rand(1, 200);
      const unitPrice = round2(Math.random() * 5000 + 1);
      const totalPrice = round2(qty * unitPrice);
      totalAmount += totalPrice;
      items.push({
        id: `poi_${prefix}_${j + 1}`,
        poId: `po_${prefix}`,
        lineNumber: j + 1,
        description: `${pick(categories)} - ${pick(["Standard", "Premium", "Basic", "Deluxe", "Enterprise"])} ${pick(["Item", "Product", "Service", "Material"])}`,
        category: pick(categories),
        quantity: qty,
        unit: pick(units),
        unitPrice,
        totalPrice,
        currency: "USD",
        receivedQuantity: 0,
        receivedValue: 0,
        billedQuantity: 0,
        billedValue: 0,
        expectedDeliveryDate: daysAgo(rand(-30, 60)),
        accountCode: pick(["ACCT-001", "ACCT-002", "ACCT-003", "ACCT-004"]),
        costCenter: Math.random() > 0.3 ? pick(["CC-001", "CC-002", "CC-003", "CC-004", "CC-005"]) : undefined,
        project: Math.random() > 0.5 ? pick(["PROJ-A", "PROJ-B", "PROJ-C"]) : undefined,
      });
    }

    const expectedDelivery = daysAgo(rand(-30, 60));
    const hasReceipts = Math.random() > 0.4;
    const po: PurchaseOrder = {
      id: `po_${prefix}`,
      poNumber: svc.purchaseOrders.generatePONumber(),
      type: pick(["standard", "standard", "standard", "blanket", "service", "capital", "contract"]),
      status: getPOStatus(hasReceipts),
      title: `${pick(["Purchase Order for", "Order of", "Procurement of"])} ${pick(categories)}`,
      description: `Purchase order ${i + 1}`,
      vendorId,
      vendorName: vendor?.name ?? "Unknown Vendor",
      vendorCode: vendor?.code ?? "V0000",
      prId: Math.random() > 0.5 ? `pr_${String(rand(1, 1500)).padStart(5, "0")}` : undefined,
      contractId: Math.random() > 0.6 ? `ctr_${String(rand(1, 350)).padStart(4, "0")}` : undefined,
      items,
      totalAmount: round2(totalAmount),
      currency: "USD",
      exchangeRate: 1,
      paymentTerms: pick(["Net30", "Net45", "Net60", "2/10 Net30"]),
      shippingTerms: pick(["FOB Origin", "FOB Destination", "CIF", "EXW"]),
      expectedDeliveryDate: expectedDelivery,
      department: pick(departments),
      budgetCode: pick(["BG-001", "BG-002", "BG-003", "BG-004"]),
      approvedBy: Math.random() > 0.4 ? pick(USERS) : undefined,
      approvedAt: Math.random() > 0.4 ? daysAgo(rand(1, 60)) : undefined,
      receivedAmount: hasReceipts ? round2(totalAmount * (0.5 + Math.random() * 0.5)) : 0,
      receivedPercent: hasReceipts ? round2(50 + Math.random() * 50) : 0,
      billedAmount: hasReceipts ? round2(totalAmount * (0.3 + Math.random() * 0.7)) : 0,
      companyId,
      entityId: pick(LEGAL_ENTITIES),
      tags: [pick(categories), pick(["urgent", "standard", "recurring"])],
      createdAt: daysAgo(rand(1, 180)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.purchaseOrders.addPO(po);
  }
}

function generateInvoices(svc: ProcurementService): void {
  const units = ["ea", "box", "case", "pallet", "lbs", "kg", "hours", "days", "months", "service"];

  for (let i = 0; i < 900; i++) {
    const prefix = String(i + 1).padStart(5, "0");
    const vendorId = `ven_${String(rand(1, 800)).padStart(4, "0")}`;
    const vendor = svc.vendors.getVendor(vendorId);
    const companyId = pick(COMPANY_IDS);
    const poId = Math.random() > 0.2 ? `po_${String(rand(1, 1200)).padStart(5, "0")}` : undefined;
    const po = poId ? svc.purchaseOrders.getPO(poId) : undefined;
    const numItems = rand(1, 4);
    const items: InvoiceItem[] = [];
    let totalAmount = 0;
    let totalTax = 0;

    for (let j = 0; j < numItems; j++) {
      const qty = rand(1, 50);
      const unitPrice = round2(Math.random() * 5000 + 1);
      const totalPrice = round2(qty * unitPrice);
      const taxRate = pick([0, 0, 0, 5, 8, 10, 12, 20]);
      const taxAmount = round2(totalPrice * taxRate / 100);
      totalAmount += totalPrice;
      totalTax += taxAmount;
      items.push({
        id: `invi_${prefix}_${j + 1}`,
        invoiceId: `inv_${prefix}`,
        lineNumber: j + 1,
        description: `Invoice line ${j + 1} for ${pick(["supplies", "services", "materials", "equipment"])}`,
        quantity: qty,
        unit: pick(units),
        unitPrice,
        totalPrice,
        taxRate,
        taxAmount,
        poItemId: po ? po.items[j]?.id : undefined,
        accountCode: pick(["ACCT-001", "ACCT-002", "ACCT-003", "ACCT-004"]),
        costCenter: Math.random() > 0.3 ? pick(["CC-001", "CC-002", "CC-003"]) : undefined,
        project: Math.random() > 0.5 ? pick(["PROJ-A", "PROJ-B"]) : undefined,
      });
    }

    const matchType: "2-way" | "3-way" = pick(["2-way", "3-way"]);
    const isMatched = Math.random() > 0.35;
    const status: "draft" | "submitted" | "matched" | "approved" | "paid" | "disputed" | "cancelled" = isMatched ? pick(["matched", "approved", "paid"]) : pick(["draft", "submitted", "disputed", "cancelled"]);

    const inv: Invoice = {
      id: `inv_${prefix}`,
      invoiceNumber: svc.invoiceMatching.generateInvoiceNumber(),
      vendorId,
      vendorName: vendor?.name ?? "Unknown Vendor",
      vendorCode: vendor?.code ?? "V0000",
      poId,
      poNumber: po?.poNumber,
      status,
      items,
      invoiceDate: daysAgo(rand(1, 90)),
      dueDate: daysAgo(rand(-30, 60)),
      receivedDate: daysAgo(rand(1, 90)),
      totalAmount: round2(totalAmount),
      taxAmount: round2(totalTax),
      totalWithTax: round2(totalAmount + totalTax),
      currency: "USD",
      exchangeRate: 1,
      paymentTerms: pick(["Net30", "Net45", "Net60"]),
      notes: Math.random() > 0.5 ? `Invoice for ${pick(["Q4 delivery", "monthly services", "project completion"])}` : undefined,
      disputeReason: status === "disputed" ? pick(["Price mismatch", "Quantity discrepancy", "Damaged goods", "Late delivery"]) : undefined,
      paidDate: status === "paid" ? daysAgo(rand(1, 30)) : undefined,
      paymentId: status === "paid" ? `pmt_${String(rand(1, 500)).padStart(5, "0")}` : undefined,
      matchStatus: isMatched ? "matched" : pick(["pending", "exception"]),
      matchType,
      matchScore: isMatched ? round2(95 + Math.random() * 5) : round2(Math.random() * 50),
      companyId,
      entityId: pick(LEGAL_ENTITIES),
      createdAt: daysAgo(rand(1, 90)),
      updatedAt: daysAgo(rand(1, 14)),
    };
    svc.invoiceMatching.addInvoice(inv);

    if (isMatched && po) {
      for (const item of items) {
        const poItem = po.items[item.lineNumber - 1];
        if (!poItem) continue;
        if (matchType === "2-way") {
          const result = svc.invoiceMatching.perform2WayMatch(item, { quantity: poItem.quantity, unitPrice: poItem.unitPrice });
          const matchResult: MatchResult = {
            ...result,
            id: `match_${prefix}_${item.lineNumber}`,
            createdAt: daysAgo(rand(1, 30)),
          };
          svc.invoiceMatching.addMatchResult(matchResult);
        } else {
          const receipt = pick(svc.receiving.getAllReceipts().filter(r => r.poId === po.id));
          const receiptItem = receipt?.items.find(ri => ri.lineNumber === item.lineNumber);
          const result = svc.invoiceMatching.perform3WayMatch(
            item,
            { quantity: poItem.quantity, unitPrice: poItem.unitPrice },
            { quantityAccepted: receiptItem?.quantityAccepted ?? poItem.quantity },
          );
          const matchResult: MatchResult = {
            ...result,
            id: `match_${prefix}_${item.lineNumber}`,
            receiptItemId: receiptItem?.id,
            createdAt: daysAgo(rand(1, 30)),
          };
          svc.invoiceMatching.addMatchResult(matchResult);
        }
      }
    }
  }
}

function generateReceipts(svc: ProcurementService): void {
  for (let i = 0; i < 700; i++) {
    const prefix = String(i + 1).padStart(5, "0");
    const poId = `po_${String(rand(1, 1200)).padStart(5, "0")}`;
    const po = svc.purchaseOrders.getPO(poId);
    if (!po) continue;
    const vendorId = po.vendorId;
    const vendor = svc.vendors.getVendor(vendorId);
    const companyId = pick(COMPANY_IDS);
    const isComplete = Math.random() > 0.3;
    const isGoods = Math.random() > 0.4;
    const numItems = po.items.length;
    const items: ReceiptItem[] = [];

    for (let j = 0; j < numItems; j++) {
      const poItem = po.items[j];
      const qtyOrdered = poItem.quantity;
      const qtyReceived = isComplete ? qtyOrdered : rand(1, qtyOrdered);
      const qtyAccepted = round2(qtyReceived * (0.8 + Math.random() * 0.2));
      const qtyRejected = qtyReceived - qtyAccepted;
      items.push({
        id: `reci_${prefix}_${j + 1}`,
        receiptId: `rcpt_${prefix}`,
        poItemId: poItem.id,
        lineNumber: j + 1,
        description: poItem.description,
        quantityOrdered: qtyOrdered,
        quantityReceived: qtyReceived,
        quantityAccepted: qtyAccepted,
        quantityRejected: qtyRejected,
        unitPrice: poItem.unitPrice,
        totalPrice: round2(qtyAccepted * poItem.unitPrice),
        rejectReason: qtyRejected > 0 ? pick(["Damaged", "Wrong item", "Quality issue", "Expired"]) : undefined,
      });
    }

    const receipt: Receipt = {
      id: `rcpt_${prefix}`,
      receiptNumber: svc.receiving.generateReceiptNumber(),
      type: isGoods ? "goods" : "service",
      poId: po.id,
      poNumber: po.poNumber,
      vendorId,
      vendorName: vendor?.name ?? "Unknown",
      items,
      receivedDate: daysAgo(rand(1, 60)),
      receivedBy: pick(USERS),
      status: isComplete ? "complete" : "partial",
      notes: Math.random() > 0.5 ? `Receipt for PO ${po.poNumber}` : undefined,
      companyId,
      createdAt: daysAgo(rand(1, 60)),
      updatedAt: daysAgo(rand(1, 14)),
    };
    svc.receiving.addReceipt(receipt);
  }
}

function generateContracts(svc: ProcurementService): void {
  const contractTypes = ["Service Agreement", "Supply Agreement", "Maintenance Contract", "Software License", "Consulting Agreement", "Lease Agreement", "Partnership Agreement", "NDA"];
  const departments = ["Engineering", "Sales", "Marketing", "Finance", "Operations", "IT", "HR", "Legal", "Procurement", "R&D"];

  for (let i = 0; i < 350; i++) {
    const prefix = String(i + 1).padStart(4, "0");
    const vendorId = `ven_${String(rand(1, 800)).padStart(4, "0")}`;
    const vendor = svc.vendors.getVendor(vendorId);
    const companyId = pick(COMPANY_IDS);
    const startDate = daysAgo(rand(-365, 0));
    const durationMonths = rand(3, 36);
    const endDate = new Date(startDate.getTime() + durationMonths * 30 * DAY);

    const contract: Contract = {
      id: `ctr_${prefix}`,
      contractNumber: svc.contracts.generateContractNumber(),
      title: `${pick(["Master", "Standard", "Enterprise", "Strategic"])} ${pick(contractTypes)} - ${vendor?.name ?? "Vendor"}`,
      description: `Contract ${i + 1} for ${pick(["services", "supplies", "maintenance", "consulting"])}`,
      status: pick(["active", "active", "active", "draft", "expired", "terminated", "renewed"]),
      vendorId,
      vendorName: vendor?.name ?? "Unknown",
      type: pick(contractTypes),
      value: round2(Math.random() * 2000000 + 10000),
      currency: "USD",
      startDate,
      endDate,
      renewalDate: Math.random() > 0.5 ? new Date(endDate.getTime() - 30 * DAY) : undefined,
      autoRenew: Math.random() > 0.5,
      paymentTerms: pick(["Net30", "Net45", "Net60", "Monthly", "Quarterly"]),
      department: pick(departments),
      budgetCode: pick(["BG-001", "BG-002", "BG-003", "BG-004"]),
      attachments: rand(0, 8),
      notes: Math.random() > 0.4 ? `Key ${pick(["vendor", "supplier", "partner"])} agreement` : undefined,
      companyId,
      createdAt: daysAgo(rand(30, 365)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.contracts.addContract(contract);
  }
}

function generateApprovals(svc: ProcurementService): void {
  const entityTypes: Array<"pr" | "po" | "invoice" | "contract" | "payment"> = ["pr", "po", "invoice", "contract", "payment"];

  for (let i = 0; i < 200; i++) {
    const prefix = String(i + 1).padStart(4, "0");
    const companyId = pick(COMPANY_IDS);
    const entityType = pick(entityTypes);
    const entityNum = rand(1, entityType === "pr" ? 1500 : entityType === "po" ? 1200 : entityType === "invoice" ? 900 : entityType === "contract" ? 350 : 500);
    const entityPrefix = entityType === "pr" ? "pr_" : entityType === "po" ? "po_" : entityType === "invoice" ? "inv_" : entityType === "contract" ? "ctr_" : "pmt_";
    const entityPad = entityType === "contract" ? 4 : 5;
    const entityId = `${entityPrefix}${String(entityNum).padStart(entityPad, "0")}`;
    const maxLevel = rand(1, 4);
    const isApproved = Math.random() > 0.4;
    const isDelegated = Math.random() > 0.8;
    const isEscalated = Math.random() > 0.85;

    const approval: ApprovalRequest = {
      id: `apr_${prefix}`,
      entityType,
      entityId,
      entityNumber: `${entityType.toUpperCase()}-${String(entityNum).padStart(entityPad, "0")}`,
      title: `${pick(["Approve", "Review", "Authorize"])} ${entityType} ${entityNum}`,
      amount: round2(Math.random() * 500000),
      currency: "USD",
      requesterId: pick(USERS),
      currentApproverId: pick(USERS),
      originalApproverId: pick(USERS),
      status: isApproved ? pick(["approved", "rejected"]) : "pending",
      level: rand(1, maxLevel),
      maxLevel,
      isDelegated,
      isEscalated,
      comments: isApproved ? pick(["Approved", "Changes requested", "Approved with conditions"]) : undefined,
      decidedAt: isApproved ? daysAgo(rand(1, 14)) : undefined,
      escalationMinutes: rand(60, 10080),
      dueDate: daysAgo(rand(-7, 14)),
      companyId,
      createdAt: daysAgo(rand(1, 60)),
      updatedAt: daysAgo(rand(1, 14)),
    };
    svc.approvals.addApproval(approval);
  }
}

function generatePayments(svc: ProcurementService): void {
  const paymentMethods: Array<"wire" | "ach" | "check" | "credit-card" | "virtual-card" | "ach-same-day"> = ["wire", "ach", "check", "credit-card", "virtual-card", "ach-same-day"];

  for (let i = 0; i < 500; i++) {
    const prefix = String(i + 1).padStart(5, "0");
    const vendorId = `ven_${String(rand(1, 800)).padStart(4, "0")}`;
    const vendor = svc.vendors.getVendor(vendorId);
    const companyId = pick(COMPANY_IDS);
    const numInvoices = rand(1, 5);
    const invoiceIds: string[] = [];
    for (let j = 0; j < numInvoices; j++) {
      invoiceIds.push(`inv_${String(rand(1, 900)).padStart(5, "0")}`);
    }
    const isPaid = Math.random() > 0.3;

    const payment: Payment = {
      id: `pmt_${prefix}`,
      paymentNumber: svc.payments.generatePaymentNumber(),
      vendorId,
      vendorName: vendor?.name ?? "Unknown",
      invoiceIds,
      totalAmount: round2(Math.random() * 250000 + 100),
      currency: "USD",
      exchangeRate: 1,
      method: pick(paymentMethods),
      status: isPaid ? pick(["paid", "processing", "scheduled"]) : pick(["pending", "failed", "cancelled"]),
      scheduledDate: daysAgo(rand(-30, 30)),
      paidDate: isPaid ? daysAgo(rand(1, 14)) : undefined,
      bankAccount: `****${rand(1000, 9999)}`,
      bankName: pick(["Chase", "Bank of America", "Wells Fargo", "Citi", "HSBC"]),
      reference: `REF-${rand(100000, 999999)}`,
      notes: Math.random() > 0.5 ? `Payment for ${pick(["monthly", "quarterly", "outstanding"])} invoices` : undefined,
      approvedBy: Math.random() > 0.4 ? pick(USERS) : undefined,
      approvedAt: Math.random() > 0.4 ? daysAgo(rand(1, 14)) : undefined,
      companyId,
      createdAt: daysAgo(rand(1, 60)),
      updatedAt: daysAgo(rand(1, 14)),
    };
    svc.payments.addPayment(payment);
  }
}

function generateCatalogItems(svc: ProcurementService): void {
  const categories = ["IT Hardware", "Software", "Office Supplies", "Raw Materials", "Packaging", "Maintenance", "Lab Equipment", "Safety", "Cleaning", "Furniture"];
  const units = ["ea", "box", "case", "pallet", "lbs", "kg", "roll", "pack", "set", "bundle"];

  for (let i = 0; i < 400; i++) {
    const prefix = String(i + 1).padStart(4, "0");
    const vendorId = `ven_${String(rand(1, 800)).padStart(4, "0")}`;
    const vendor = svc.vendors.getVendor(vendorId);
    const companyId = pick(COMPANY_IDS);

    const item: CatalogItem = {
      id: `cat_${prefix}`,
      name: `${pick(["Premium", "Standard", "Basic", "Deluxe", "Pro", "Enterprise", "Economy"])} ${pick(categories)} ${pick(["Item", "Product", "Supply", "Material"])} ${prefix}`,
      description: `Catalog item ${i + 1} in ${pick(categories)} category`,
      category: pick(categories),
      vendorId,
      vendorName: vendor?.name ?? "Unknown",
      unitPrice: round2(Math.random() * 5000 + 1),
      currency: "USD",
      unit: pick(units),
      minimumOrder: rand(1, 10),
      leadTime: rand(1, 30),
      isPreferred: Math.random() > 0.7,
      isActive: Math.random() > 0.1,
      companyId,
      tags: [pick(categories), pick(["in-stock", "backorder", "discontinued"])],
      createdAt: daysAgo(rand(30, 365)),
      updatedAt: daysAgo(rand(1, 30)),
    };
    svc.catalog.addItem(item);
  }
}

function generateExpensesAndKPIs(svc: ProcurementService): void {
  const dimensions = ["department", "category", "vendor", "project", "cost-center"];
  const departments = ["Engineering", "Sales", "Marketing", "Finance", "Operations", "IT", "HR", "Legal", "Procurement"];
  const categories = ["IT Hardware", "Software", "Office Supplies", "Consulting", "Marketing", "Facilities", "Raw Materials", "Packaging", "Logistics"];
  const periods = ["2025-Q1", "2025-Q2", "2025-Q3", "2025-Q4", "2026-Q1", "2026-Q2"];

  for (let i = 0; i < 300; i++) {
    const prefix = String(i + 1).padStart(4, "0");
    const companyId = pick(COMPANY_IDS);
    const period = pick(periods);
    const dim = pick(dimensions);
    const dimVal = dim === "department" ? pick(departments) : dim === "category" ? pick(categories) : dim === "vendor" ? `ven_${String(rand(1, 800)).padStart(4, "0")}` : dim === "project" ? pick(["PROJ-A", "PROJ-B", "PROJ-C"]) : pick(["CC-001", "CC-002", "CC-003"]);

    const totalSpend = round2(Math.random() * 2000000 + 10000);
    const budgetConsumed = round2(totalSpend * (0.5 + Math.random() * 0.5));
    const budgetTotal = round2(budgetConsumed + Math.random() * 500000);

    const analytic: SpendAnalytic = {
      id: `sa_${prefix}`,
      dimension: dim,
      dimensionValue: dimVal,
      period,
      totalSpend,
      totalOrders: rand(5, 200),
      totalInvoices: rand(3, 150),
      avgOrderValue: round2(totalSpend / Math.max(rand(5, 200), 1)),
      savingsAmount: round2(Math.random() * 50000),
      savingsPercent: round2(Math.random() * 15),
      budgetConsumed,
      budgetRemaining: round2(budgetTotal - budgetConsumed),
      budgetPercent: round2((budgetConsumed / budgetTotal) * 100),
      currency: "USD",
      companyId,
      createdAt: daysAgo(rand(1, 90)),
    };
    svc.expenses.addAnalytic(analytic);
  }

  const kpiDefs = [
    { name: "Total Spend", unit: "USD", cat: "spend" as const },
    { name: "Spend per Department", unit: "USD", cat: "spend" as const },
    { name: "Spend per Category", unit: "USD", cat: "spend" as const },
    { name: "Active Vendors", unit: "count", cat: "vendor" as const },
    { name: "Vendor On-Time Rate", unit: "percent", cat: "vendor" as const },
    { name: "Vendor Quality Score", unit: "percent", cat: "vendor" as const },
    { name: "Vendor Risk Score", unit: "score", cat: "vendor" as const },
    { name: "PO Cycle Time", unit: "days", cat: "efficiency" as const },
    { name: "Invoice Processing Time", unit: "days", cat: "efficiency" as const },
    { name: "Receipt-to-Invoice Match Rate", unit: "percent", cat: "efficiency" as const },
    { name: "Purchase Request Approval Time", unit: "hours", cat: "efficiency" as const },
    { name: "Cost Savings", unit: "USD", cat: "savings" as const },
    { name: "Savings as % of Spend", unit: "percent", cat: "savings" as const },
    { name: "Contract Compliance Rate", unit: "percent", cat: "compliance" as const },
    { name: "Policy Compliance Rate", unit: "percent", cat: "compliance" as const },
    { name: "Budget Adherence", unit: "percent", cat: "compliance" as const },
  ];

  for (const def of kpiDefs) {
    const kpi: ProcurementKPI = {
      id: `kpi_proc_${def.name.toLowerCase().replace(/\s+/g, "_")}`,
      name: def.name,
      value: rand(0, 100),
      previousValue: rand(0, 100),
      target: rand(60, 100),
      unit: def.unit,
      category: def.cat,
      trend: pick(["up", "down", "stable"] as const),
      status: pick(["good", "good", "warning", "critical"] as const),
      companyId: pick(COMPANY_IDS),
      period: pick(periods),
      date: NOW,
    };
    svc.expenses.addKPI(kpi);
  }

  for (let i = 0; i < 300; i++) {
    const prefix = String(i + 1).padStart(4, "0");
    const forecast: ProcurementForecast = {
      id: `fc_proc_${prefix}`,
      companyId: pick(COMPANY_IDS),
      metric: pick(["spend", "savings", "orders", "invoices"] as const),
      period: pick(["1M", "3M", "6M", "1Y"]),
      currentValue: rand(100000, 10000000),
      forecastValue: rand(100000, 10000000),
      lowerBound: rand(-2000000, 0),
      upperBound: rand(0, 2000000),
      confidence: round2(60 + Math.random() * 35),
      trend: pick(["increasing", "decreasing", "stable"] as const),
      date: NOW,
    };
    svc.expenses.addForecast(forecast);
  }
}

function generateAlertsAndRecommendations(svc: ProcurementService): void {
  const alertTypes = ["budget", "vendor-risk", "policy-violation", "approval-delay", "match-exception", "payment-overdue", "contract-expiry", "duplicate-invoice"];

  for (let i = 0; i < 200; i++) {
    const prefix = String(i + 1).padStart(4, "0");
    const isCritical = Math.random() > 0.7;
    const alert: ProcurementAlert = {
      id: `alert_${prefix}`,
      severity: isCritical ? "critical" : pick(["warning", "warning", "info"]),
      type: pick(alertTypes),
      title: `${pick(["Budget threshold exceeded", "Vendor risk detected", "Policy violation", "Approval pending", "Matching exception", "Payment overdue", "Contract expiring", "Possible duplicate invoice"])}`,
      message: `Alert ${i + 1}: ${pick(["Action required", "Review needed", "Immediate attention", "Please investigate"])}`,
      companyId: pick(COMPANY_IDS),
      actionRequired: isCritical,
      dismissed: false,
      createdAt: daysAgo(rand(1, 30)),
    };
    svc.analytics.addAlert(alert);
  }

  const recTypes = ["vendor-consolidation", "early-payment", "bulk-purchase", "contract-negotiation", "category-optimization", "process-automation"];

  for (let i = 0; i < 300; i++) {
    const prefix = String(i + 1).padStart(4, "0");
    const rec: ProcurementRecommendation = {
      id: `rec_${prefix}`,
      type: pick(recTypes),
      title: pick([
        "Consolidate vendor spend for better rates",
        "Take early payment discount",
        "Bulk purchase for volume discount",
        "Renegotiate contract terms",
        "Optimize category sourcing strategy",
        "Automate approval workflow",
      ]),
      description: `Recommendation ${i + 1}: ${pick(["Estimated savings of 5-15%", "Improve working capital", "Reduce processing time", "Enhance compliance"])}`,
      impact: pick(["high", "medium", "low"]),
      confidence: round2(60 + Math.random() * 35),
      companyId: pick(COMPANY_IDS),
      implemented: Math.random() > 0.8,
      createdAt: daysAgo(rand(1, 60)),
    };
    svc.analytics.addRecommendation(rec);
  }
}

export function seedProcurementData(svc: ProcurementService): void {
  console.log("Seeding procurement data...");

  generateCatalogItems(svc);
  console.log(`  ${svc.catalog.count()} catalog items created`);

  generateVendors(svc);
  console.log(`  ${svc.vendors.count()} vendors created`);

  generatePurchaseRequests(svc);
  console.log(`  ${svc.purchaseRequests.count()} purchase requests created`);

  generatePurchaseOrders(svc);
  console.log(`  ${svc.purchaseOrders.count()} purchase orders created`);

  generateContracts(svc);
  console.log(`  ${svc.contracts.count()} contracts created`);

  generateReceipts(svc);
  console.log(`  ${svc.receiving.count()} receipts created`);

  generateInvoices(svc);
  console.log(`  ${svc.invoiceMatching.count()} invoices created`);

  generateApprovals(svc);
  console.log(`  ${svc.approvals.count()} approval requests created`);

  generatePayments(svc);
  console.log(`  ${svc.payments.count()} payments created`);

  generateExpensesAndKPIs(svc);
  console.log(`  ${svc.expenses.getAllAnalytics().length} spend analytics`);
  console.log(`  ${svc.expenses.getAllKPIs().length} KPIs`);
  console.log(`  ${svc.expenses.getAllForecasts().length} forecasts created`);

  generateAlertsAndRecommendations(svc);
  console.log(`  ${svc.analytics.getAllAlerts().length} alerts`);
  console.log(`  ${svc.analytics.getAllRecommendations().length} recommendations created`);

  console.log("Procurement seed data complete.");
}
