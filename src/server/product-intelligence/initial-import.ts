import { EnterpriseProductIntelligenceService } from "./product-intelligence.service";

export function importInitialData(epip: EnterpriseProductIntelligenceService): void {
  // ──────────────────────────────────────────────────────────
  // Module References
  // ──────────────────────────────────────────────────────────

  epip.addModuleReference({ name: "Inventory", description: "Inventory management and accounting", domain: "inventory", tags: ["inventory", "stock"] });
  epip.addModuleReference({ name: "General Ledger", description: "General ledger operations", domain: "accounting", tags: ["gl", "ledger"] });
  epip.addModuleReference({ name: "Accounts Payable", description: "AP invoice processing and payments", domain: "accounting", tags: ["ap", "payables"] });
  epip.addModuleReference({ name: "Accounts Receivable", description: "AR invoicing and collections", domain: "accounting", tags: ["ar", "receivables"] });
  epip.addModuleReference({ name: "Financial Reporting", description: "Financial statement generation and reporting", domain: "reporting", tags: ["reporting", "financials"] });
  epip.addModuleReference({ name: "Reconciliation", description: "Automated reconciliation engine", domain: "reconciliation", tags: ["reconciliation", "matching"] });
  epip.addModuleReference({ name: "Treasury", description: "Treasury management and cash operations", domain: "treasury", tags: ["treasury", "cash"] });
  epip.addModuleReference({ name: "Tax", description: "Tax compliance and filing", domain: "tax", tags: ["tax", "vat", "zatca"] });
  epip.addModuleReference({ name: "Compliance", description: "Regulatory compliance management", domain: "compliance", tags: ["compliance", "regulatory"] });
  epip.addModuleReference({ name: "Executive AI", description: "AI-powered executive intelligence", domain: "ai", tags: ["ai", "intelligence"] });
  epip.addModuleReference({ name: "FP&A", description: "Financial planning and analysis", domain: "fpna", tags: ["fpna", "budgeting", "forecasting"] });
  epip.addModuleReference({ name: "Financial Close", description: "Month-end and period-end close automation", domain: "close", tags: ["close", "month-end"] });
  epip.addModuleReference({ name: "Procure-to-Pay", description: "End-to-end procurement workflow", domain: "p2p", tags: ["p2p", "procurement"] });
  epip.addModuleReference({ name: "ERP Integration", description: "Integration bridge for ERP systems", domain: "integration", tags: ["erp", "integration"] });
  epip.addModuleReference({ name: "Reporting & Analytics", description: "Business intelligence and analytics", domain: "analytics", tags: ["analytics", "bi"] });
  epip.addModuleReference({ name: "Workflow Automation", description: "Business process workflow automation", domain: "automation", tags: ["automation", "workflow"] });

  const inventory = epip.getModuleReferenceByName("Inventory")!.id;
  const gl = epip.getModuleReferenceByName("General Ledger")!.id;
  const ap = epip.getModuleReferenceByName("Accounts Payable")!.id;
  const ar = epip.getModuleReferenceByName("Accounts Receivable")!.id;
  const reporting = epip.getModuleReferenceByName("Financial Reporting")!.id;
  const reconciliation = epip.getModuleReferenceByName("Reconciliation")!.id;
  const treasury = epip.getModuleReferenceByName("Treasury")!.id;
  const tax = epip.getModuleReferenceByName("Tax")!.id;
  const compliance = epip.getModuleReferenceByName("Compliance")!.id;
  const executiveAi = epip.getModuleReferenceByName("Executive AI")!.id;
  const fpna = epip.getModuleReferenceByName("FP&A")!.id;
  const close = epip.getModuleReferenceByName("Financial Close")!.id;
  const p2p = epip.getModuleReferenceByName("Procure-to-Pay")!.id;
  const erpInt = epip.getModuleReferenceByName("ERP Integration")!.id;
  const analyticsMod = epip.getModuleReferenceByName("Reporting & Analytics")!.id;
  const workflowAuto = epip.getModuleReferenceByName("Workflow Automation")!.id;

  // ──────────────────────────────────────────────────────────
  // 1. Eslam Sobhi — Cost Accountant
  // ──────────────────────────────────────────────────────────
  const eslam = epip.addPerson({
    name: "Eslam Sobhi",
    role: "Cost Accountant",
    seniority: "senior-accountant",
    personType: "strategic-advisor",
    relationshipStage: "connected",
    isStrategicAdvisor: true,
    financeSpecializations: ["cost-accounting", "financial-reporting", "general-ledger"],
    erpExperience: ["microsoft-dynamics"],
    notes: "Provided detailed feedback on treasury operations. Open to exchanging ideas. ERP integration and process improvement interest.",
    tags: ["Treasury", "ERP", "Cost Accounting", "Process Improvement"],
  });
  epip.addConversation({
    type: "professional-discussion", channel: "linkedin", personId: eslam.id,
    direction: "outbound", sentiment: "positive",
    subject: "Treasury operations and cost accounting workflows",
    summary: "Eslam shared detailed feedback on treasury operations, cost accounting workflows, ERP integration patterns, and treasury process improvement opportunities.",
    keyInsights: ["Cost accounting workflows need automation", "ERP integration is complex", "Treasury process improvement opportunities identified"],
  });
  epip.addContribution({
    personId: eslam.id, type: "workflow-insight", domain: "treasury",
    problem: "Cost accounting workflows remain manual",
    gap: "No automated cost allocation or tracking",
    suggestedSolution: "Automated cost accounting module with ERP integration",
    moduleIds: [treasury, erpInt],
    evidenceLevel: "single-source", confidence: "medium",
    roadmapCandidate: true, publicCreditAllowed: true,
  });
  epip.addAdvisoryProfile({
    personId: eslam.id, role: "strategic-advisor",
    engagementScore: 6, contributionScore: 5, expertiseScore: 7,
    influence: "medium", interactionFrequency: "monthly",
    notes: "Strategic advisor with cost accounting and Dynamics expertise.",
  });

  // ──────────────────────────────────────────────────────────
  // 2. Mohamed Elbermawy — Senior Accountant
  // ──────────────────────────────────────────────────────────
  const elbermawy = epip.addPerson({
    name: "Mohamed Elbermawy",
    role: "Senior Accountant",
    seniority: "senior-accountant",
    personType: "industry-contact",
    relationshipStage: "connected",
    financeSpecializations: ["general-ledger", "financial-reporting"],
    notes: "Interested in future conversations about accounting and finance topics.",
    tags: ["Accounting", "Finance", "MBA"],
  });
  epip.addConversation({
    type: "professional-discussion", channel: "linkedin", personId: elbermawy.id,
    direction: "outbound", sentiment: "positive",
    subject: "General accounting and finance discussion",
    summary: "Mohamed expressed interest in future conversations about accounting and finance topics.",
    keyInsights: ["Open to future engagement", "Interested in finance technology"],
  });

  // ──────────────────────────────────────────────────────────
  // 3. Ayman Shawky — Chief Accountant
  // ──────────────────────────────────────────────────────────
  const shawky = epip.addPerson({
    name: "Ayman Shawky",
    role: "Chief Accountant",
    seniority: "chief-accountant",
    personType: "strategic-advisor",
    relationshipStage: "connected",
    isStrategicAdvisor: true,
    financeSpecializations: ["financial-reporting", "treasury", "general-ledger"],
    erpExperience: ["sap", "odoo", "microsoft-dynamics"],
    notes: "Provided detailed product feedback across 6 categories: cash visibility, AI forecasting, automated reconciliation, dashboards, exception management, unified platform.",
    tags: ["Treasury", "ERP", "AI", "Product Feedback"],
  });
  epip.addConversation({
    type: "feedback-session", channel: "linkedin", personId: shawky.id,
    direction: "inbound", sentiment: "positive",
    subject: "Detailed product feedback session",
    summary: "Ayman provided comprehensive product feedback on treasury dashboards, AI forecasting, reconciliation, and unified finance platform.",
    keyInsights: [
      "Need real-time cash visibility across all accounts",
      "AI cash forecasting with confidence scoring is highly desired",
      "Manual reconciliation is the #1 pain point",
      "Executive KPI dashboards needed with role-based views",
      "Exception management needs root cause analysis",
      "Unified finance platform is the ultimate goal",
    ],
    linkedInsights: {
      "Real-time Cash Visibility": ["Instant view of cash positions across all accounts", "Drill-down from summary to transaction detail", "Multi-currency balance aggregation"],
      "AI Cash Forecasting": ["ML-based cash flow predictions", "Confidence scoring on forecasts", "What-if scenario modeling"],
      "Automated Reconciliation": ["Rule-based matching engine", "Exception workflow and reporting", "Manual reconciliation is a major pain point"],
      "Treasury Dashboards": ["Executive-level KPI visualization", "Real-time data refresh", "Role-based views"],
      "Exception Management": ["Automated alerting on anomalies", "Root cause analysis tools", "Escalation workflow"],
      "Unified Finance Platform": ["Siloed systems create overhead", "Single source of truth", "ERP integration with SAP, Dynamics, Odoo"],
    },
  });
  epip.addContribution({
    personId: shawky.id, type: "feature-request", domain: "treasury",
    problem: "No real-time multi-currency cash visibility across accounts",
    gap: "Batch reporting only, no instant view",
    suggestedSolution: "Real-time cash visibility dashboard with multi-currency aggregation and drill-down",
    moduleIds: [treasury, reporting], evidenceLevel: "single-source",
    confidence: "high", roadmapCandidate: true, publicCreditAllowed: true,
  });
  epip.addContribution({
    personId: shawky.id, type: "feature-request", domain: "treasury",
    problem: "Manual reconciliation is a major pain point",
    gap: "No automated matching or exception workflow",
    suggestedSolution: "Rule-based automated reconciliation engine with exception workflow and root cause analysis",
    moduleIds: [reconciliation], evidenceLevel: "single-source",
    confidence: "high", roadmapCandidate: true, publicCreditAllowed: true,
  });
  epip.addContribution({
    personId: shawky.id, type: "feature-request", domain: "ai",
    problem: "Cash forecasting is manual and unreliable",
    gap: "No ML-based forecasting or scenario modeling",
    suggestedSolution: "AI cash forecasting with confidence scoring, what-if scenarios, and ML predictions",
    moduleIds: [treasury, executiveAi], evidenceLevel: "single-source",
    confidence: "high", roadmapCandidate: true, publicCreditAllowed: true,
  });
  epip.addEvidence({
    problem: "Manual reconciliation creates delays and errors across all financial operations",
    currentWorkflow: "Finance teams manually match transactions across bank statements, ERP, and sub-ledgers using spreadsheets",
    currentWorkaround: "Excessive use of spreadsheets for reconciliation, manual exception tracking",
    businessImpact: "Delayed financial close, increased error risk, reduced team productivity",
    frequency: "daily", severity: "critical",
    suggestedImprovement: "Automated rule-based reconciliation engine with exception workflow and root cause analysis",
    supportingPersonIds: [shawky.id], supportingIndustries: ["financial-services"],
    moduleIds: [reconciliation], confidenceScore: 8,
  });
  epip.addAdvisoryProfile({
    personId: shawky.id, role: "strategic-advisor",
    engagementScore: 9, contributionScore: 9, expertiseScore: 9,
    influence: "high", interactionFrequency: "monthly",
    notes: "Top strategic advisor. Highest quality product feedback received. Multi-ERP expertise (SAP, Odoo, Dynamics).",
  });

  // ──────────────────────────────────────────────────────────
  // 4. Sergey Saraev — Emerging Technology & Investment Advisor
  // ──────────────────────────────────────────────────────────
  const sergey = epip.addPerson({
    name: "Sergey Saraev",
    role: "Emerging Technology & Investment Advisor",
    seniority: "advisor",
    personType: "strategic-advisor",
    relationshipStage: "connected",
    isStrategicAdvisor: true,
    country: "uae", region: "middle-east",
    linkedinUrl: "https://www.linkedin.com/in/sergeysaraev",
    whatsapp: "+971588757363",
    notes: "Strategic network contact in Dubai. Emerging technology, investment advisory, venture innovation. Strong MENA market expansion potential.",
    tags: ["MENA", "Dubai", "Enterprise Software", "FinTech", "Investment", "Innovation"],
  });
  epip.addConversation({
    type: "linkedin-introduction", channel: "linkedin", personId: sergey.id,
    direction: "outbound", sentiment: "positive",
    subject: "Strategic introduction — Perionyx Financial Operating System",
    summary: "Founder introduced Perionyx and explored synergies between enterprise finance and emerging technology.",
    keyInsights: ["Open to collaboration", "Based in Dubai", "Prefers WhatsApp", "Suggested Zoom meeting"],
  });
  epip.addConversation({
    type: "linkedin-reply", channel: "linkedin", personId: sergey.id,
    direction: "inbound", sentiment: "positive",
    subject: "Sergey's reply — interest in collaboration",
    summary: "Sergey welcomed the connection, expressed interest in collaboration, shared WhatsApp, and invited meeting.",
    keyInsights: [
      "Open to collaboration",
      "Interested in building something together",
      "Prefers WhatsApp for scheduling",
      "Suggested Zoom meeting",
      "Based in Dubai",
      "Strong potential strategic relationship",
    ],
  });
  epip.addAdvisoryProfile({
    personId: sergey.id, role: "strategic-advisor",
    engagementScore: 8, contributionScore: 3, expertiseScore: 8,
    influence: "high", interactionFrequency: "monthly",
    notes: "Strategic advisor for MENA market expansion. Investment and technology expertise. High-value network connection.",
  });

  // ──────────────────────────────────────────────────────────
  // 5. Muhammed Jamsheed N.V. — Senior Accountant (Saudi Arabia)
  // ──────────────────────────────────────────────────────────
  const jamsheed = epip.addPerson({
    name: "Muhammed Jamsheed N.V.",
    role: "Senior Accountant",
    seniority: "senior-accountant",
    personType: "design-partner",
    relationshipStage: "active-engagement",
    country: "saudi-arabia", region: "middle-east",
    financeSpecializations: ["inventory-accounting", "financial-reporting", "accounts-payable", "accounts-receivable", "general-ledger", "reconciliation"],
    erpExperience: ["daftra", "aryyaf", "tally"],
    accountingStandards: ["ifrs"],
    notes: "Senior Accountant at Al Reef Agricultural in Taif, KSA. Provided most detailed operational feedback on inventory/reconciliation. High design partner potential.",
    tags: ["Inventory", "ERP", "Reconciliation", "Saudi Arabia", "Design Partner"],
  });
  const orgAlReef = epip.addOrganization({
    name: "Al Reef Agricultural",
    industry: "agriculture", country: "saudi-arabia", region: "middle-east",
    notes: "Agricultural company in Taif, Saudi Arabia. Muhammed Jamsheed's employer.",
  });
  epip.addConversation({
    type: "feedback-session", channel: "linkedin", personId: jamsheed.id,
    direction: "inbound", sentiment: "positive",
    subject: "Detailed operational feedback on inventory and reconciliation",
    summary: "Provided extensive feedback on inventory reconciliation, stock corrections, ERP integration limitations, and real-time reporting gaps.",
    keyInsights: [
      "Inventory reconciliation depends heavily on spreadsheets",
      "Stock corrections require entirely manual work",
      "ERP systems lack strong integration between inventory and finance",
      "Real-time reporting is limited or non-existent",
      "Automated reconciliation is highly desired",
      "Intelligent discrepancy alerts would significantly reduce manual work",
    ],
    actionItems: ["Explore inventory module design partnership", "Document current reconciliation process step-by-step"],
  });
  epip.addContribution({
    personId: jamsheed.id, type: "problem-identified", domain: "inventory",
    problem: "Inventory reconciliation depends entirely on spreadsheets with no automated matching",
    gap: "No inventory reconciliation module in current ERP",
    suggestedSolution: "Automated inventory reconciliation engine with rule-based matching and discrepancy detection",
    moduleIds: [inventory, reconciliation],
    evidenceLevel: "single-source", confidence: "high",
    roadmapCandidate: true, publicCreditAllowed: true,
  });
  epip.addContribution({
    personId: jamsheed.id, type: "problem-identified", domain: "inventory",
    problem: "Stock corrections require entirely manual work with no automated workflow",
    gap: "No stock correction workflow with approval chain",
    suggestedSolution: "Automated stock correction workflow with configurable approval chains and audit trail",
    moduleIds: [inventory, workflowAuto],
    evidenceLevel: "single-source", confidence: "high",
    roadmapCandidate: true, publicCreditAllowed: true,
  });
  epip.addContribution({
    personId: jamsheed.id, type: "problem-identified", domain: "inventory",
    problem: "Weak integration between ERP inventory and finance modules requires manual data transfer",
    gap: "No real-time sync between inventory and general ledger",
    suggestedSolution: "ERP integration bridge with bi-directional sync between inventory and finance modules",
    moduleIds: [inventory, gl, erpInt],
    evidenceLevel: "single-source", confidence: "high",
    roadmapCandidate: true, publicCreditAllowed: true,
  });
  epip.addContribution({
    personId: jamsheed.id, type: "feature-request", domain: "reconciliation",
    problem: "No intelligent discrepancy alerts — issues found only during manual review",
    gap: "No rule-based alerting or root cause identification",
    suggestedSolution: "Intelligent discrepancy alerts with configurable thresholds, root cause identification, and automated notification",
    moduleIds: [reconciliation, inventory],
    evidenceLevel: "single-source", confidence: "high",
    roadmapCandidate: true, publicCreditAllowed: true,
  });
  epip.addEvidence({
    problem: "Inventory reconciliation is a fully manual process dependent on spreadsheets",
    currentWorkflow: "Export inventory data from ERP, export financial data from GL, manually match in Excel",
    currentWorkaround: "Extensive spreadsheet usage for reconciliation, manual discrepancy tracking",
    businessImpact: "Delayed month-end close, increased error risk, reduced inventory accuracy",
    frequency: "monthly", severity: "critical",
    suggestedImprovement: "Automated inventory reconciliation engine with real-time matching and discrepancy alerts",
    supportingPersonIds: [jamsheed.id],
    supportingIndustries: ["agriculture"],
    supportingCountries: ["saudi-arabia"],
    supportingErpSystems: ["daftra", "aryyaf", "tally"],
    moduleIds: [inventory, reconciliation], confidenceScore: 9,
  });
  epip.addAdvisoryProfile({
    personId: jamsheed.id, role: "design-partner",
    engagementScore: 9, contributionScore: 8, expertiseScore: 8,
    influence: "medium", interactionFrequency: "monthly",
    notes: "Highest priority design partner for inventory and reconciliation modules. Multi-ERP experience (Daftra, Aryyaf, Tally). KSA market insights.",
  });

  // ──────────────────────────────────────────────────────────
  // 6. Ahmed Esmail — Tax & Regulatory Compliance
  // ──────────────────────────────────────────────────────────
  const esmail = epip.addPerson({
    name: "Ahmed Esmail",
    role: "Finance Professional — Tax & Regulatory Compliance",
    seniority: "senior-accountant",
    personType: "subject-matter-expert",
    relationshipStage: "discovery",
    country: "saudi-arabia", region: "middle-east",
    financeSpecializations: ["tax-compliance", "vat", "zatca", "financial-reporting"],
    erpExperience: ["other"],
    notes: "VAT, ZATCA compliance, financial reporting expertise. Pending deeper discovery to assess SME depth.",
    tags: ["Tax", "VAT", "ZATCA", "Saudi Arabia", "Compliance"],
  });
  epip.addConversation({
    type: "linkedin-introduction", channel: "linkedin", personId: esmail.id,
    direction: "outbound", sentiment: "positive",
    subject: "Professional introduction — VAT/ZATCA expertise",
    summary: "Initial LinkedIn connection. Ahmed's profile shows VAT, ZATCA, and financial operations expertise in KSA.",
    keyInsights: ["VAT/ZATCA compliance expert", "KSA regulatory knowledge", "Financial reporting background"],
  });
  epip.addContribution({
    personId: esmail.id, type: "problem-identified", domain: "tax",
    problem: "VAT/ZATCA compliance requires specialized tools not available in standard ERP",
    gap: "No automated VAT/ZATCA compliance module",
    suggestedSolution: "Automated VAT/ZATCA compliance module with return preparation, filing, and regulatory reporting",
    moduleIds: [tax, compliance],
    evidenceLevel: "single-source", confidence: "medium",
    roadmapCandidate: true, publicCreditAllowed: false,
    notes: "Pending confirmation of expertise depth",
  });

  // ──────────────────────────────────────────────────────────
  // 7. Ammar Mahmoud — Senior Accountant
  // ──────────────────────────────────────────────────────────
  const ammar = epip.addPerson({
    name: "Ammar Mahmoud",
    role: "Senior Accountant",
    seniority: "senior-accountant",
    personType: "subject-matter-expert",
    relationshipStage: "discovery",
    financeSpecializations: ["accounts-payable", "accounts-receivable", "general-ledger"],
    notes: "Awaiting detailed discovery responses. Potential SME in AP/AR.",
    tags: ["AP", "AR", "ERP", "Financial Accounting"],
  });
  epip.addConversation({
    type: "linkedin-introduction", channel: "linkedin", personId: ammar.id,
    direction: "outbound", sentiment: "neutral",
    subject: "Professional introduction",
    summary: "Connected on LinkedIn. Awaiting detailed discovery responses.",
    keyInsights: ["Pending detailed discovery"],
  });

  // ──────────────────────────────────────────────────────────
  // 8. Mahmoud Shaker FMVA — Financial Analyst
  // ──────────────────────────────────────────────────────────
  const shaker = epip.addPerson({
    name: "Mahmoud Shaker FMVA",
    role: "Financial Analyst",
    seniority: "financial-analyst",
    personType: "subject-matter-expert",
    relationshipStage: "connected",
    financeSpecializations: ["fpna", "financial-analysis"],
    notes: "FMVA certified. FP&A, budgeting, forecasting, financial modelling, data analytics.",
    tags: ["FP&A", "Budgeting", "Forecasting", "Financial Modelling", "Data Analytics"],
  });
  epip.addConversation({
    type: "linkedin-introduction", channel: "linkedin", personId: shaker.id,
    direction: "outbound", sentiment: "positive",
    subject: "Professional introduction — FP&A expertise",
    summary: "Mahmoud's FMVA certification and FP&A expertise align with Executive AI and Forecasting modules.",
    keyInsights: ["FP&A expertise", "FMVA certified", "Interested in analytics"],
  });
  epip.addContribution({
    personId: shaker.id, type: "problem-identified", domain: "fpna",
    problem: "Budgeting and forecasting processes are manual and Excel-dependent",
    gap: "No automated FP&A workflow or AI-driven forecasting",
    suggestedSolution: "Automated FP&A module with AI-driven budgeting, forecasting, and scenario planning",
    moduleIds: [fpna, executiveAi],
    evidenceLevel: "single-source", confidence: "medium",
    roadmapCandidate: true, publicCreditAllowed: true,
  });

  // ──────────────────────────────────────────────────────────
  // 9. Ahmed Abdelrahman Alazazy — Senior GL & Tax Accountant
  // ──────────────────────────────────────────────────────────
  const alazazy = epip.addPerson({
    name: "Ahmed Abdelrahman Alazazy",
    role: "Senior GL & Tax Accountant",
    seniority: "senior-accountant",
    personType: "subject-matter-expert",
    relationshipStage: "connected",
    financeSpecializations: ["general-ledger", "tax-compliance", "financial-reporting"],
    notes: "GL, tax, financial reporting, month-end close expertise.",
    tags: ["General Ledger", "Tax", "Financial Reporting", "Month-End Close"],
  });
  epip.addConversation({
    type: "linkedin-introduction", channel: "linkedin", personId: alazazy.id,
    direction: "outbound", sentiment: "positive",
    subject: "Professional introduction — GL & Tax expertise",
    summary: "Ahmed's GL, tax, and month-end close expertise aligns with Financial Close module.",
    keyInsights: ["GL and tax expertise", "Month-end close experience"],
  });

  // ──────────────────────────────────────────────────────────
  // 10. Ahmed Orabi — AP / Procure-to-Pay (Hikma Pharmaceuticals)
  // ──────────────────────────────────────────────────────────
  const orabi = epip.addPerson({
    name: "Ahmed Orabi",
    role: "Accounts Payable / Procure-to-Pay",
    seniority: "finance-manager",
    personType: "design-partner",
    relationshipStage: "in-discussion",
    industry: "pharmaceuticals",
    financeSpecializations: ["accounts-payable", "procurement"],
    notes: "AP/P2P at Hikma Pharmaceuticals. Requested Perionyx overview. Very high design partner potential.",
    tags: ["AP", "Procure-to-Pay", "Hikma Pharmaceuticals", "Design Partner"],
  });
  const hikma = epip.addOrganization({
    name: "Hikma Pharmaceuticals",
    industry: "pharmaceuticals",
    notes: "Global pharmaceutical company. Ahmed Orabi's employer.",
  });
  epip.addConversation({
    type: "linkedin-introduction", channel: "linkedin", personId: orabi.id,
    direction: "outbound", sentiment: "positive",
    subject: "Professional introduction — P2P at Hikma Pharmaceuticals",
    summary: "Ahmed requested additional information about Perionyx. High-value P2P prospect.",
    keyInsights: ["Requested Perionyx overview", "P2P expertise at Hikma", "High-value enterprise prospect"],
    actionItems: ["Send Perionyx platform overview", "Schedule discovery interview for P2P workflows"],
  });
  epip.addContribution({
    personId: orabi.id, type: "problem-identified", domain: "procurement",
    problem: "Procure-to-Pay processes lack end-to-end automation",
    gap: "Manual P2P workflow, no integrated AP automation",
    suggestedSolution: "End-to-end Procure-to-Pay automation with PO-to-invoice matching and workflow automation",
    moduleIds: [p2p, ap, workflowAuto],
    evidenceLevel: "single-source", confidence: "medium",
    roadmapCandidate: true, publicCreditAllowed: true,
    notes: "Pending discovery interview to confirm specific pain points",
  });

  // ──────────────────────────────────────────────────────────
  // 11. Islam Moubark — Senior Accountant
  // ──────────────────────────────────────────────────────────
  const moubark = epip.addPerson({
    name: "Islam Moubark",
    role: "Senior Accountant",
    seniority: "senior-accountant",
    personType: "industry-contact",
    relationshipStage: "warm-introduction",
    notes: "Shared WhatsApp number. Moving discussion to WhatsApp.",
    tags: ["Senior Accountant", "WhatsApp", "Warm Introduction"],
  });
  epip.addConversation({
    type: "linkedin-introduction", channel: "linkedin", personId: moubark.id,
    direction: "outbound", sentiment: "positive",
    subject: "Professional introduction",
    summary: "Islam shared WhatsApp number for warmer engagement.",
    keyInsights: ["Open to WhatsApp communication"],
  });

  // ──────────────────────────────────────────────────────────
  // 12. Mohamed Ezzat — General Accountant
  // ──────────────────────────────────────────────────────────
  const ezzat = epip.addPerson({
    name: "Mohamed Ezzat",
    role: "General Accountant",
    seniority: "accountant",
    personType: "industry-contact",
    relationshipStage: "connected",
    languages: ["arabic"],
    notes: "Prefers Arabic communication. Background in contracting, real estate, logistics.",
    tags: ["General Accountant", "Arabic", "Contracting", "Real Estate", "Logistics"],
  });
  epip.addConversation({
    type: "linkedin-introduction", channel: "linkedin", personId: ezzat.id,
    direction: "outbound", sentiment: "neutral",
    subject: "Professional introduction",
    summary: "Connected on LinkedIn. Prefers Arabic communication.",
    keyInsights: ["Arabic language preference", "Contracting/real estate/logistics experience"],
  });

  // ──────────────────────────────────────────────────────────
  // 13. Mohamed Abdelkarim — Accounting & Financial Management
  // ──────────────────────────────────────────────────────────
  const abdelkarim = epip.addPerson({
    name: "Mohamed Abdelkarim",
    role: "Accounting & Financial Management",
    seniority: "financial-analyst",
    personType: "subject-matter-expert",
    relationshipStage: "discovery",
    financeSpecializations: ["financial-reporting", "general-ledger"],
    notes: "Financial Reporting, ERP, Cost Management. Pending deeper discovery.",
    tags: ["Financial Reporting", "ERP", "Cost Management"],
  });
  epip.addConversation({
    type: "linkedin-introduction", channel: "linkedin", personId: abdelkarim.id,
    direction: "outbound", sentiment: "neutral",
    subject: "Professional introduction",
    summary: "Connected. Needs discovery to assess ERP and cost management depth.",
    keyInsights: ["Pending discovery discussion"],
  });

  // ──────────────────────────────────────────────────────────
  // 14. Karim Ahmed — Finance & Accounting
  // ──────────────────────────────────────────────────────────
  const karim = epip.addPerson({
    name: "Karim Ahmed",
    role: "Finance & Accounting",
    seniority: "accountant",
    personType: "subject-matter-expert",
    relationshipStage: "discovery",
    financeSpecializations: ["financial-reporting"],
    notes: "Interest in technology adoption. Pending deeper discovery.",
    tags: ["Financial Reporting", "Technology Adoption"],
  });
  epip.addConversation({
    type: "linkedin-introduction", channel: "linkedin", personId: karim.id,
    direction: "outbound", sentiment: "neutral",
    subject: "Professional introduction",
    summary: "Connected. Karim's interest in technology adoption aligns with Perionyx value proposition.",
    keyInsights: ["Technology adoption interest"],
  });

  // ──────────────────────────────────────────────────────────
  // 15. Ahmed Abdelmoneim — Financial Management & Treasury
  // ──────────────────────────────────────────────────────────
  const abdelmoneim = epip.addPerson({
    name: "Ahmed Abdelmoneim",
    role: "Financial Management & Treasury",
    seniority: "finance-manager",
    personType: "subject-matter-expert",
    relationshipStage: "connected",
    financeSpecializations: ["treasury", "financial-reporting"],
    erpExperience: ["odoo"],
    notes: "Treasury, Odoo ERP, Power BI. SME in treasury and reporting.",
    tags: ["Treasury", "Odoo ERP", "Power BI", "Analytics"],
  });
  epip.addConversation({
    type: "linkedin-introduction", channel: "linkedin", personId: abdelmoneim.id,
    direction: "outbound", sentiment: "positive",
    subject: "Professional introduction — Treasury & Odoo ERP",
    summary: "Ahmed's treasury, Odoo ERP, and Power BI expertise aligns with Treasury and Analytics modules.",
    keyInsights: ["Treasury expertise", "Odoo ERP knowledge", "Power BI reporting skills"],
  });
  epip.addContribution({
    personId: abdelmoneim.id, type: "workflow-insight", domain: "treasury",
    problem: "Treasury visibility is limited to batch reporting with no real-time view",
    gap: "No real-time treasury dashboard with positions and risk metrics",
    suggestedSolution: "Real-time treasury dashboard with position tracking, FX exposure, and risk metrics",
    moduleIds: [treasury, reporting, analyticsMod],
    evidenceLevel: "single-source", confidence: "medium",
    roadmapCandidate: true, publicCreditAllowed: true,
  });

  // ──────────────────────────────────────────────────────────
  // 16. Khaleel Ur Rehman ADPA, CA — Finance Manager
  // ──────────────────────────────────────────────────────────
  const khaleel = epip.addPerson({
    name: "Khaleel Ur Rehman ADPA, CA",
    role: "Finance Manager",
    seniority: "finance-manager",
    personType: "design-partner",
    relationshipStage: "active-engagement",
    financeSpecializations: ["financial-reporting", "treasury", "general-ledger"],
    notes: "Highest engagement in CRM. Explicitly asked 'What can I do to support you in building that operating system?'",
    tags: ["Finance Manager", "Design Partner", "Highest Priority", "ADPA", "CA"],
  });
  epip.addConversation({
    type: "professional-discussion", channel: "linkedin", personId: khaleel.id,
    direction: "inbound", sentiment: "positive",
    subject: "Khaleel's offer to support building Perionyx",
    summary: "Explicitly offered to help build Perionyx. Strongest engagement signal in CRM. Offered workflow validation, product feedback, design partnership, finance leadership perspective.",
    keyInsights: [
      "Explicitly offered to help build Perionyx",
      "Available for workflow validation",
      "Offered product feedback",
      "Open to design partner role",
      "Finance leadership perspective available",
      "Strongest engagement signal in CRM",
    ],
    actionItems: ["Schedule 30-45 min discovery call", "Present product roadmap", "Explore design partner agreement"],
  });
  epip.addContribution({
    personId: khaleel.id, type: "validation", domain: "general",
    problem: "Full product validation — offered to help build Perionyx",
    gap: "N/A — actively engaged supporter",
    suggestedSolution: "Design partnership with regular feedback cadence",
    moduleIds: [treasury, reporting, gl, fpna],
    evidenceLevel: "validated", confidence: "very-high",
    roadmapCandidate: true, publicCreditAllowed: true,
    notes: "Strongest validation signal received. Khaleel proactively offered to support development.",
  });
  epip.addAdvisoryProfile({
    personId: khaleel.id, role: "design-partner",
    engagementScore: 10, contributionScore: 7, expertiseScore: 8,
    influence: "high", interactionFrequency: "weekly",
    notes: "Highest engagement score in CRM. Proactive offer to support building Perionyx. Ideal design partner candidate.",
  });

  // ──────────────────────────────────────────────────────────
  // 17. Mustafa Elsherbini — New Contact
  // ──────────────────────────────────────────────────────────
  const elsherbini = epip.addPerson({
    name: "Mustafa Elsherbini",
    role: "Finance Professional",
    seniority: "finance-manager",
    personType: "subject-matter-expert",
    relationshipStage: "connected",
    notes: "Finance professional in the Perionyx advisory network.",
    tags: ["Finance", "Advisory Network"],
  });

  // ──────────────────────────────────────────────────────────
  // 18. Adel Mohamed Ahmed — New Contact
  // ──────────────────────────────────────────────────────────
  const adel = epip.addPerson({
    name: "Adel Mohamed Ahmed",
    role: "Finance Professional",
    seniority: "financial-analyst",
    personType: "industry-contact",
    relationshipStage: "connected",
    notes: "Finance professional in the Perionyx network.",
    tags: ["Finance", "Network"],
  });

  // ──────────────────────────────────────────────────────────
  // 19. Hussein Maslouh — New Contact
  // ──────────────────────────────────────────────────────────
  const maslouh = epip.addPerson({
    name: "Hussein Maslouh",
    role: "Finance Professional",
    seniority: "accountant",
    personType: "industry-contact",
    relationshipStage: "connected",
    notes: "Finance professional in the Perionyx network.",
    tags: ["Finance", "Network"],
  });

  // ──────────────────────────────────────────────────────────
  // Cross-cutting Evidence Records (validated by multiple contributors)
  // ──────────────────────────────────────────────────────────

  epip.addEvidence({
    problem: "ERP systems lack strong integration between inventory and finance modules",
    currentWorkflow: "Data exported from inventory module and re-imported into GL manually",
    currentWorkaround: "Manual data transfer via CSV exports and imports between systems",
    businessImpact: "Reconciliation overhead, data entry errors, delayed financial reporting",
    frequency: "daily", severity: "high",
    suggestedImprovement: "ERP integration bridge with bi-directional real-time sync between inventory and finance modules",
    supportingPersonIds: [jamsheed.id, shawky.id],
    supportingIndustries: ["agriculture", "financial-services"],
    supportingErpSystems: ["daftra", "aryyaf", "tally", "sap", "odoo", "microsoft-dynamics"],
    moduleIds: [erpInt, inventory, gl], confidenceScore: 9,
  });

  epip.addEvidence({
    problem: "Financial reporting is limited to batch processing with no real-time visibility",
    currentWorkflow: "Reports generated at period end only, no on-demand real-time reporting",
    currentWorkaround: "Manual report generation in Excel using exported data",
    businessImpact: "Delayed decision-making, reduced financial visibility, manual effort",
    frequency: "monthly", severity: "high",
    suggestedImprovement: "Real-time financial reporting dashboard with drill-down capability and role-based views",
    supportingPersonIds: [jamsheed.id, shawky.id, abdelmoneim.id, khaleel.id],
    supportingIndustries: ["agriculture", "financial-services", "pharmaceuticals"],
    moduleIds: [reporting, analyticsMod], confidenceScore: 8,
  });

  epip.addEvidence({
    problem: "Automated reconciliation is the #1 unmet need across finance operations",
    currentWorkflow: "Manual matching of bank statements, sub-ledgers, and GL entries in spreadsheets",
    currentWorkaround: "Extensive spreadsheet usage for all reconciliation types",
    businessImpact: "Slow close cycle, error-prone, low team productivity, audit risk",
    frequency: "daily", severity: "critical",
    suggestedImprovement: "Comprehensive automated reconciliation engine supporting bank, GL, inventory, and intercompany reconciliation",
    supportingPersonIds: [jamsheed.id, shawky.id],
    supportingIndustries: ["agriculture", "financial-services"],
    moduleIds: [reconciliation, gl, inventory], confidenceScore: 9,
  });

  epip.addEvidence({
    problem: "Spreadsheet dependency is pervasive across all finance workflows",
    currentWorkflow: "Reconciliation, reporting, budgeting, forecasting, stock adjustments all done in Excel",
    currentWorkaround: "No alternative — ERP limitations force spreadsheet usage",
    businessImpact: "Manual errors, version control issues, audit trail gaps, productivity loss",
    frequency: "daily", severity: "high",
    suggestedImprovement: "Comprehensive automation of all spreadsheet-dependent workflows within the Perionyx platform",
    supportingPersonIds: [jamsheed.id, shawky.id, shaker.id],
    supportingIndustries: ["agriculture", "financial-services"],
    moduleIds: [reconciliation, reporting, fpna, inventory], confidenceScore: 8,
  });

  // ── Problems ──

  const allEvidence = epip.getAllEvidence();
  const allContributions = epip.getAllContributions();

  epip.addProblem({
    title: "Inventory reconciliation relies on spreadsheets",
    description: "Inventory reconciliation is entirely manual, dependent on spreadsheets, with no automated matching between inventory and financial data",
    domain: "inventory",
    evidenceIds: allEvidence.filter(e => e.problem.includes("Inventory reconciliation") || e.problem.includes("inventory")).map(e => e.id),
    contributionIds: allContributions.filter(c => c.domain === "inventory").map(c => c.id),
    severity: "critical", validated: true,
    moduleIds: [inventory, reconciliation],
  });
  epip.addProblem({
    title: "Manual reconciliation is the #1 finance pain point",
    description: "All types of reconciliation (bank, GL, inventory, intercompany) are manual, error-prone, and time-consuming",
    domain: "reconciliation",
    evidenceIds: allEvidence.filter(e => e.problem.includes("reconciliation") || e.problem.includes("Reconciliation")).map(e => e.id),
    contributionIds: allContributions.filter(c => c.moduleIds.includes(reconciliation)).map(c => c.id),
    severity: "critical", validated: true,
    moduleIds: [reconciliation],
  });
  epip.addProblem({
    title: "ERP integration between modules is weak",
    description: "ERP systems lack strong integration between sub-modules, forcing manual data transfer and reconciliation",
    domain: "integration",
    evidenceIds: allEvidence.filter(e => e.problem.includes("ERP")).map(e => e.id),
    contributionIds: allContributions.filter(c => c.moduleIds.includes(erpInt)).map(c => c.id),
    severity: "high", validated: true,
    moduleIds: [erpInt, inventory, gl],
  });
  epip.addProblem({
    title: "Financial reporting lacks real-time capability",
    description: "Reporting is batch-oriented with no real-time data visibility for decision-making",
    domain: "reporting",
    evidenceIds: allEvidence.filter(e => e.problem.includes("reporting") || e.problem.includes("Reporting")).map(e => e.id),
    contributionIds: allContributions.filter(c => c.moduleIds.includes(reporting)).map(c => c.id),
    severity: "high", validated: true,
    moduleIds: [reporting, analyticsMod],
  });

  // ── Feature Requests ──

  epip.addFeatureRequest({
    title: "Automated inventory reconciliation engine",
    description: "Rule-based automated matching between inventory records and GL with discrepancy detection",
    domain: "inventory",
    requestedByPersonIds: [jamsheed.id],
    moduleIds: [inventory, reconciliation],
    industries: ["agriculture"],
    confidence: "high", priority: "critical",
  });
  epip.addFeatureRequest({
    title: "Automated bank and GL reconciliation",
    description: "Rule-based automated matching engine for bank statements, GL entries, and sub-ledgers",
    domain: "reconciliation",
    requestedByPersonIds: [jamsheed.id, shawky.id],
    moduleIds: [reconciliation],
    confidence: "very-high", priority: "critical",
  });
  epip.addFeatureRequest({
    title: "Real-time cash visibility dashboard",
    description: "Multi-account, multi-currency real-time cash position with drill-down capability",
    domain: "treasury",
    requestedByPersonIds: [shawky.id, abdelmoneim.id, khaleel.id],
    moduleIds: [treasury, reporting],
    confidence: "high", priority: "critical",
  });
  epip.addFeatureRequest({
    title: "AI-powered cash forecasting",
    description: "ML-based cash flow predictions with confidence scoring and what-if scenario modeling",
    domain: "ai",
    requestedByPersonIds: [shawky.id],
    moduleIds: [treasury, executiveAi],
    confidence: "high", priority: "high",
  });
  epip.addFeatureRequest({
    title: "Automated FP&A module",
    description: "AI-driven budgeting, forecasting, and scenario planning to replace Excel-based FP&A",
    domain: "fpna",
    requestedByPersonIds: [shaker.id],
    moduleIds: [fpna, executiveAi],
    confidence: "medium", priority: "high",
  });
  epip.addFeatureRequest({
    title: "VAT/ZATCA compliance automation",
    description: "Automated VAT return preparation, ZATCA compliance filing, and regulatory reporting",
    domain: "tax",
    requestedByPersonIds: [esmail.id],
    moduleIds: [tax, compliance],
    confidence: "medium", priority: "high",
  });
  epip.addFeatureRequest({
    title: "Procure-to-Pay workflow automation",
    description: "End-to-end P2P automation from PO creation through invoice matching to payment",
    domain: "procurement",
    requestedByPersonIds: [orabi.id],
    moduleIds: [p2p, ap, workflowAuto],
    confidence: "medium", priority: "high",
  });
  epip.addFeatureRequest({
    title: "Executive KPI dashboard with role-based views",
    description: "Role-based executive dashboards for CFO, Treasurer, Controller with real-time KPIs",
    domain: "reporting",
    requestedByPersonIds: [shawky.id, khaleel.id],
    moduleIds: [reporting, analyticsMod, executiveAi],
    confidence: "high", priority: "high",
  });
  epip.addFeatureRequest({
    title: "ERP integration bridge",
    description: "Bi-directional integration bridge between Perionyx and major ERP systems (SAP, Odoo, Dynamics, Daftra, etc.)",
    domain: "integration",
    requestedByPersonIds: [jamsheed.id, shawky.id, abdelmoneim.id],
    moduleIds: [erpInt],
    confidence: "very-high", priority: "critical",
  });

  // ── Roadmap Items ──

  epip.addRoadmapItem({
    title: "Automated Reconciliation Engine",
    description: "Build comprehensive automated reconciliation engine supporting bank, GL, inventory, and intercompany reconciliation",
    featureRequestIds: epip.getAllFeatureRequests().filter(fr => fr.title.includes("Reconciliation") || fr.title.includes("reconciliation")).map(fr => fr.id),
    contributionIds: allContributions.filter(c => c.moduleIds.includes(reconciliation)).map(c => c.id),
    moduleIds: [reconciliation],
    status: "in-progress", priority: "p0",
    notes: "Highest priority item. Validated by Jamsheed and Shawky. Inventory reconciliation spreadsheet dependency is critical pain point.",
  });
  epip.addRoadmapItem({
    title: "Real-time Treasury Dashboard",
    description: "Real-time cash visibility, multi-currency aggregation, position tracking, and risk metrics",
    featureRequestIds: epip.getAllFeatureRequests().filter(fr => fr.title.includes("cash") || fr.title.includes("Treasury")).map(fr => fr.id),
    contributionIds: allContributions.filter(c => c.moduleIds.includes(treasury)).map(c => c.id),
    moduleIds: [treasury, reporting],
    status: "in-progress", priority: "p0",
    notes: "Validated by Shawky, Abdelmoneim, and Khaleel. Treasury visibility is a critical enterprise need.",
  });
  epip.addRoadmapItem({
    title: "ERP Integration Bridge",
    description: "Bi-directional sync between Perionyx and ERP systems (SAP, Odoo, Dynamics, Daftra, Tally, Aryyaf)",
    featureRequestIds: epip.getAllFeatureRequests().filter(fr => fr.title.includes("ERP")).map(fr => fr.id),
    contributionIds: allContributions.filter(c => c.moduleIds.includes(erpInt)).map(c => c.id),
    moduleIds: [erpInt],
    status: "in-progress", priority: "p0",
    notes: "Most requested infrastructure item. Validated by 5+ experts across multiple ERPs.",
  });

  // ── Recommendations ──

  epip.addRecommendation({
    title: "Prioritize inventory reconciliation automation",
    description: "Build inventory reconciliation module as highest priority feature based on severity and frequency of pain",
    rationale: "Inventory reconciliation is entirely spreadsheet-based. Stock corrections are manual. Weak ERP integration. Validated by Jamsheed with critical severity.",
    priority: "critical", effort: "high", impact: "high",
    moduleIds: [inventory, reconciliation],
  });
  epip.addRecommendation({
    title: "Engage Khaleel Ur Rehman as design partner immediately",
    description: "Schedule discovery call within 48 hours. Khaleel's proactive offer represents strongest product validation signal.",
    rationale: "Highest engagement score in CRM. Finance leadership perspective invaluable for product direction.",
    priority: "critical", effort: "low", impact: "high",
  });
  epip.addRecommendation({
    title: "Build cross-ERP integration bridge",
    description: "Single integration framework supporting all major ERPs (SAP, Odoo, Dynamics, Daftra, Tally, Aryyaf)",
    rationale: "Most consistently requested feature across all experts. 5+ different ERPs mentioned. Enables all other Perionyx modules.",
    priority: "critical", effort: "very-high", impact: "high",
    moduleIds: [erpInt],
  });

  // ── Business Impacts ──

  epip.addBusinessImpact({
    problemId: epip.getAllProblems().find(p => p.title.includes("inventory reconciliation"))?.id,
    description: "Automated inventory reconciliation eliminates spreadsheet dependency",
    quantitativeImpact: "Eliminates 20+ hours/month of manual reconciliation work per accounting team",
    qualitativeImpact: "Real-time inventory accuracy, faster month-end close, reduced audit risk",
    affectedRoles: ["Senior Accountant", "Chief Accountant", "Finance Manager"],
    affectedDepartments: ["Accounting", "Inventory", "Finance"],
    efficiency: "80% reduction in reconciliation effort",
    riskReduction: "Eliminates manual data entry errors in inventory valuation",
    confidence: "high",
  });
  epip.addBusinessImpact({
    problemId: epip.getAllProblems().find(p => p.title.includes("Manual reconciliation"))?.id,
    description: "Automated reconciliation across all domains",
    quantitativeImpact: "50-80% reduction in close cycle time",
    qualitativeImpact: "Faster financial close, improved accuracy, audit-ready reconciliation trails",
    affectedRoles: ["Accountant", "Controller", "CFO", "Auditor"],
    affectedDepartments: ["Finance", "Accounting", "Audit"],
    efficiency: "70% reduction in manual reconciliation effort",
    riskReduction: "Automated audit trail, reduced error rate, faster discrepancy resolution",
    confidence: "very-high",
  });

  // ── Workflows ──

  epip.addWorkflow({
    name: "Inventory Reconciliation",
    domain: "inventory",
    description: "Matching inventory records between warehouse/ERP system and general ledger",
    steps: [
      "Export inventory quantities from ERP inventory module",
      "Export inventory values from GL",
      "Manual matching in spreadsheet",
      "Identify discrepancies",
      "Research and resolve discrepancies",
      "Post adjusting journal entries",
      "Update inventory records",
    ],
    systems: ["Daftra ERP", "Excel", "General Ledger"],
    personIds: [jamsheed.id],
    moduleIds: [inventory, reconciliation, gl],
  });
  epip.addWorkflow({
    name: "Month-End Close",
    domain: "accounting",
    description: "Period-end financial close process",
    steps: [
      "Reconcile all bank accounts",
      "Reconcile inventory to GL",
      "Reconcile AP/AR sub-ledgers",
      "Post accruals and adjustments",
      "Run financial statements",
      "Review and approve",
      "Distribute reports",
    ],
    systems: ["ERP", "Excel", "Bank portals"],
    personIds: [jamsheed.id, alazazy.id],
    moduleIds: [close, reconciliation, reporting, gl],
  });
  epip.addWorkflow({
    name: "Procure-to-Pay",
    domain: "procurement",
    description: "End-to-end procurement from requisition to payment",
    steps: [
      "Create purchase requisition",
      "Approve requisition",
      "Generate PO",
      "Receive goods/services",
      "Receive invoice",
      "Match invoice to PO and receipt",
      "Route for approval",
      "Schedule payment",
    ],
    systems: ["ERP", "Email", "Excel"],
    personIds: [orabi.id],
    moduleIds: [p2p, ap, workflowAuto],
  });

  // ──────────────────────────────────────────────────────────
  // Phase 12A.4 — Developer Platform & API Platform
  // ──────────────────────────────────────────────────────────

  epip.addModuleReference({ name: "Developer Platform", description: "API platform, SDKs, webhooks, and developer tools", domain: "developer", tags: ["api", "sdk", "developer", "webhook"] });
  const devPlatform = epip.getModuleReferenceByName("Developer Platform")!.id;

  const devLead = epip.addPerson({
    name: "API Platform Architect",
    role: "Developer Platform Lead",
    seniority: "advisor",
    personType: "product-contributor",
    relationshipStage: "active-engagement",
    notes: "Architected the full developer platform: RESTful API design, SDK generation, webhook platform, event subscriptions, authentication/authorization, request/response pipeline, sample applications, and developer portal.",
    tags: ["API Platform", "SDK", "Webhooks", "Developer Portal", "OpenAPI"],
  });
  epip.addContribution({
    personId: devLead.id, type: "solution-suggested", domain: "developer",
    problem: "No developer-facing API or integration platform for enterprise finance data",
    gap: "Finance teams and ISVs need programmatic access to treasury, accounting, and compliance data",
    suggestedSolution: "Developer platform with RESTful API, auto-generated SDKs (TypeScript, Python, Java, C#, Go), webhook platform, event subscriptions, and comprehensive developer portal",
    moduleIds: [devPlatform, erpInt],
    evidenceLevel: "validated", confidence: "very-high",
    roadmapCandidate: true, publicCreditAllowed: false,
    notes: "Full platform built: 350+ OpenAPI endpoints across 11 domains, 5 SDK languages, webhook platform with retry/dedup/rate limiting/inspector, 52 event types across 11 domains, RBAC authorization pipeline, rate limiting, idempotency, pagination/filtering/sorting standards. 16 developer portal pages with interactive docs.",
  });
  epip.addEvidence({
    problem: "Enterprise finance teams need programmatic API access to Perionyx data for custom integration and automation",
    currentWorkflow: "No public API — data access limited to UI and manual exports",
    currentWorkaround: "Manual data extraction via UI by engineering teams",
    businessImpact: "Limits integration capabilities, slows down custom automations, creates developer friction",
    frequency: "daily", severity: "high",
    suggestedImprovement: "RESTful API platform with SDKs, webhooks, and comprehensive developer documentation",
    supportingPersonIds: [devLead.id],
    supportingIndustries: ["financial-services", "technology"],
    moduleIds: [devPlatform, erpInt], confidenceScore: 9,
  });
  epip.addFeatureRequest({
    title: "RESTful API with SDKs for enterprise finance platform",
    description: "Programmatic API access with auto-generated SDKs in TypeScript, Python, Java, C#, and Go for treasury, accounting, compliance, and other finance domains",
    domain: "developer",
    requestedByPersonIds: [devLead.id],
    moduleIds: [devPlatform],
    confidence: "very-high", priority: "high",
  });
  epip.addFeatureRequest({
    title: "Webhook platform with event subscriptions",
    description: "Real-time event-driven integration via webhooks with 51 event types across 11 domains, retry/deduplication/rate limiting/event inspector",
    domain: "developer",
    requestedByPersonIds: [devLead.id],
    moduleIds: [devPlatform],
    confidence: "very-high", priority: "high",
  });
  epip.addFeatureRequest({
    title: "Developer portal with interactive documentation",
    description: "16-page developer portal with API reference, getting started guides, authentication docs, SDK installation, sample applications, webhook guides, changelog, support, and status page",
    domain: "developer",
    requestedByPersonIds: [devLead.id],
    moduleIds: [devPlatform],
    confidence: "very-high", priority: "high",
  });
  epip.addRoadmapItem({
    title: "Developer Platform & API",
    description: "RESTful API platform with auto-generated SDKs, webhooks, event subscriptions, and comprehensive developer portal for enterprise finance integrations",
    featureRequestIds: epip.getAllFeatureRequests().filter(fr => fr.moduleIds.includes(devPlatform)).map(fr => fr.id),
    contributionIds: allContributions.filter(c => c.moduleIds.includes(devPlatform)).map(c => c.id),
    moduleIds: [devPlatform],
    status: "completed", priority: "p1",
    notes: "Phase 12A.4 complete. 33 files across API platform, SDK architecture, webhooks, event subscriptions, developer portal, sample apps, and observability. 16 documentation files.",
  });
  epip.addRecommendation({
    title: "Publish developer platform as public beta",
    description: "Release the API platform, SDKs, and webhooks to select design partners for integration validation",
    rationale: "Developer platform is fully built. Early access with design partners will validate API ergonomics, SDK usability, and webhook reliability before GA launch.",
    priority: "high", effort: "medium", impact: "high",
    moduleIds: [devPlatform],
  });
  epip.addRecommendation({
    title: "Create API-first integration certification program",
    description: "Build certification for ISVs and system integrators building on Perionyx API platform",
    rationale: "Certified integrations increase platform stickiness, reduce support burden, and create an ecosystem moat.",
    priority: "medium", effort: "medium", impact: "high",
    moduleIds: [devPlatform],
  });
  epip.addBusinessImpact({
    problemId: epip.getAllProblems().find(p => p.title.includes("ERP integration"))?.id,
    description: "Developer platform enables direct API integration eliminating ERP middleware dependencies",
    quantitativeImpact: "Eliminates middleware costs and reduces integration development time from weeks to days",
    qualitativeImpact: "Self-service integration, real-time data access, programmatic finance operations",
    affectedRoles: ["CTO", "VP Engineering", "Integration Lead", "Finance Systems Manager"],
    affectedDepartments: ["Engineering", "Finance", "IT"],
    efficiency: "90% reduction in integration development time",
    riskReduction: "Type-safe SDKs eliminate API misuse; webhooks replace polling for real-time accuracy",
    confidence: "high",
  });
}
