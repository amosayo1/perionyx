import { CRMService } from "./crm.service";

export async function seedCrmData(service: CRMService, companyId: string): Promise<void> {
  // ──────────────────────────────────────────────────────────────
  // EXISTING CONTACTS — Preserved with appended interactions
  // ──────────────────────────────────────────────────────────────

  // --- Contact 1: Eslam Sobhi ---
  const eslam = await service.addContact({
    name: "Eslam Sobhi",
    role: "Cost Accountant",
    company: undefined,
    source: "linkedin",
    relationshipStage: "connected",
    status: "active",
    expertise: [
      "Microsoft Dynamics 365",
      "Financial Reporting",
      "Cost Accounting",
      "Process Improvement",
    ],
    tags: ["Treasury", "ERP", "Finance", "Potential Advisor"],
    notes: "Provided detailed feedback on treasury operations and is open to exchanging ideas.",
    isStrategicAdvisor: true,
  }, companyId);

  await service.addInteraction({
    contactId: eslam.id,
    type: "professional-discussion",
    channel: "linkedin",
    direction: "outbound",
    sentiment: "positive",
    outcome: "open-to-collaboration",
    notes: "Connected on LinkedIn. Eslam shared detailed feedback on treasury operations and expressed openness to exchanging ideas. Topics discussed included cost accounting workflows, ERP integration patterns, and treasury process improvement opportunities.",
  }, companyId);

  // --- Contact 2: Mohamed Elbermawy ---
  const mohamed = await service.addContact({
    name: "Mohamed Elbermawy",
    role: "Senior Accountant",
    company: undefined,
    source: "linkedin",
    relationshipStage: "connected",
    status: "active",
    expertise: [],
    tags: ["Accounting", "Finance", "MBA", "Potential Advisor"],
    notes: "Interested in future conversations.",
    isStrategicAdvisor: false,
  }, companyId);

  await service.addInteraction({
    contactId: mohamed.id,
    type: "professional-discussion",
    channel: "linkedin",
    direction: "outbound",
    sentiment: "positive",
    outcome: "open-to-collaboration",
    notes: "Connected on LinkedIn. Mohamed expressed interest in future conversations about accounting and finance topics.",
  }, companyId);

  // --- Contact 3: Ayman Shawky ---
  const ayman = await service.addContact({
    name: "Ayman Shawky",
    role: "Chief Accountant",
    company: undefined,
    source: "linkedin",
    relationshipStage: "connected",
    status: "active",
    expertise: [
      "SAP",
      "Odoo",
      "Microsoft Dynamics",
      "Budgeting",
      "Financial Reporting",
      "Performance Analysis",
    ],
    tags: ["Treasury", "ERP", "Finance", "AI Feedback", "Potential Advisor"],
    notes: "Provided detailed product feedback including: real-time cash visibility, AI cash forecasting, automated reconciliation, treasury dashboards, exception management, unified finance platform.",
    isStrategicAdvisor: true,
  }, companyId);

  await service.addInteraction({
    contactId: ayman.id,
    type: "feedback-session",
    channel: "linkedin",
    direction: "inbound",
    sentiment: "positive",
    outcome: "feedback-provided",
    notes: "Provided detailed product feedback on Perionyx platform. Insights documented for product roadmap reference.",
    linkedInsights: {
      "Real-time Cash Visibility": [
        "Need for instant view of cash positions across all accounts",
        "Desire for drill-down from summary to transaction detail",
        "Demand for multi-currency balance aggregation",
      ],
      "AI Cash Forecasting": [
        "Interest in ML-based cash flow predictions",
        "Need for confidence scoring on forecasts",
        "Desire for what-if scenario modeling",
      ],
      "Automated Reconciliation": [
        "Manual reconciliation is a major pain point",
        "Need for rule-based matching engine",
        "Desire for exception workflow and reporting",
      ],
      "Treasury Dashboards": [
        "Executive-level KPI visualization required",
        "Real-time data refresh is critical",
        "Role-based views for CFO vs Treasurer vs Analyst",
      ],
      "Exception Management": [
        "Need for automated alerting on anomalies",
        "Desire for root cause analysis tools",
        "Escalation workflow for unresolved exceptions",
      ],
      "Unified Finance Platform": [
        "Siloed systems create reconciliation overhead",
        "Single source of truth for financial data",
        "Integration with existing ERP (SAP, Dynamics, Odoo)",
      ],
    },
  }, companyId);

  // --- Contact 4: Sergey Saraev ---
  const sergey = await service.addContact({
    name: "Sergey Saraev",
    role: "Emerging Technology & Investment Advisor",
    company: undefined,
    source: "linkedin",
    relationshipStage: "connected",
    status: "active",
    expertise: [
      "Emerging Technology",
      "Investment Advisory",
      "Venture & Innovation",
    ],
    tags: [
      "MENA",
      "Dubai",
      "Enterprise Software",
      "FinTech",
      "Treasury",
      "Banking",
      "AI",
      "Enterprise Finance",
      "Investment",
      "Innovation",
    ],
    notes: "Strategic network contact based in Dubai with expertise in emerging technology, investment advisory, and venture innovation. Strong potential for strategic advisory and MENA market expansion.",
    isStrategicAdvisor: true,
    location: "Dubai, United Arab Emirates",
    whatsapp: "+971588757363",
    priority: "high",
    region: "Middle East",
    relationshipType: "Strategic Network",
    potentialRoles: [
      "Strategic Advisor",
      "MENA Market Advisor",
      "Future Investor",
      "Ecosystem Partner",
    ],
  }, companyId);

  await service.addInteraction({
    contactId: sergey.id,
    type: "linkedin-introduction",
    channel: "linkedin",
    direction: "outbound",
    sentiment: "positive",
    outcome: "follow-up-scheduled",
    notes: "Founder of Perionyx introduced himself, explained Perionyx Financial Operating System, and expressed interest in exploring synergies between enterprise finance and emerging technology.",
  }, companyId);

  await service.addInteraction({
    contactId: sergey.id,
    type: "linkedin-reply",
    channel: "linkedin",
    direction: "inbound",
    sentiment: "positive",
    outcome: "open-to-collaboration",
    notes: "Sergey welcomed the connection, expressed interest in exploring collaboration, stated he is based in Dubai, invited Amos to schedule a Zoom meeting, and shared his WhatsApp number for easier communication.",
    keyInsights: [
      "Open to collaboration",
      "Interested in building something together",
      "Prefers WhatsApp for scheduling",
      "Suggested Zoom meeting",
      "Based in Dubai",
      "Strong potential strategic relationship",
    ],
  }, companyId);

  await service.addOpportunity({
    contactId: sergey.id,
    title: "Strategic Introduction — Sergey Saraev",
    stage: "discovery",
    probability: 40,
    category: "strategic-partnership",
    potentialOutcomes: [
      "Strategic Advisor",
      "Product Feedback",
      "MENA Market Expansion",
      "Investment Introduction",
      "Enterprise Network",
      "Future Funding Discussion",
    ],
    priority: "high",
    notes: "Initial connection established via LinkedIn. Sergey is open to collaboration and based in Dubai. Strong potential for strategic partnership across multiple dimensions.",
  }, companyId);

  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  await service.addTask({
    contactId: sergey.id,
    title: "Schedule introductory Zoom meeting",
    assignedTo: "Amos Ayodeji",
    dueDate: sevenDaysFromNow,
    status: "open",
    notes: "Reach out via WhatsApp to coordinate a mutually convenient meeting time.",
  }, companyId);

  await service.setContactIntelligence({
    contactId: sergey.id,
    strengths: [
      "Emerging technology expertise",
      "Investment advisory",
      "Innovation ecosystem",
      "Strategic partnerships",
      "MENA market exposure",
    ],
    potentialValue: [
      "Product strategy feedback",
      "Investment readiness advice",
      "Regional expansion guidance",
      "Enterprise introductions",
      "Long-term strategic advisor",
    ],
    notes: "Sergey represents a high-value strategic relationship for Perionyx. His combination of emerging technology expertise, investment advisory background, and MENA market presence aligns strongly with our growth objectives.",
  }, companyId);

  // ──────────────────────────────────────────────────────────────
  // PHASE 12X — UPDATED & NEW CONTACTS
  // ──────────────────────────────────────────────────────────────

  // --- Contact 5: Muhammed Jamsheed N.V. (Updated — was Senior Accountant) ---
  const muhammed = await service.addContact({
    name: "Muhammed Jamsheed N.V.",
    role: "Senior Accountant",
    company: "Al Reef Agricultural",
    source: "linkedin",
    relationshipStage: "active-product-discovery",
    status: "active",
    classification: "subject-matter-expert",
    designPartnerPotential: "high",
    expertise: [
      "Inventory Accounting",
      "Financial Reporting",
      "Accounts Payable",
      "Accounts Receivable",
      "General Ledger",
      "ERP Systems",
      "Inventory Management",
      "Month-End Close",
    ],
    productModules: [
      "Inventory",
      "General Ledger",
      "Accounts Payable",
      "Financial Reporting",
      "Reconciliation",
    ],
    tags: [
      "Accounting",
      "ERP",
      "Inventory",
      "Financial Reporting",
      "Month-End Close",
      "General Ledger",
      "AP",
      "AR",
      "Reconciliation",
      "Saudi Arabia",
    ],
    conversationSummary:
      "Provided detailed operational feedback. Inventory reconciliation still depends heavily on spreadsheets. Stock corrections require manual work. ERP systems lack strong integration between inventory and finance. Real-time reporting is limited. Automated reconciliation is highly desired. Intelligent discrepancy alerts would reduce manual work.",
    keyProductInsights: [
      "Inventory reconciliation still depends heavily on spreadsheets",
      "Stock corrections require manual work",
      "ERP systems lack strong integration between inventory and finance",
      "Real-time reporting is limited",
      "Automated reconciliation is highly desired",
      "Intelligent discrepancy alerts would reduce manual work",
    ],
    notes:
      "Senior Accountant at Al Reef Agricultural in Taif, Saudi Arabia. Active Product Discovery stage. Design Partner Potential: High. Subject Matter Expert in inventory accounting, financial reporting, AP/AR, and ERP systems.",
    isStrategicAdvisor: false,
    location: "Taif, Saudi Arabia",
    priority: "high",
    region: "Saudi Arabia",
    relationshipType: "Subject Matter Expert",
    potentialRoles: [
      "Design Partner",
      "Customer Interview",
      "Beta Feedback",
      "Product Feedback",
    ],
  }, companyId);

  await service.addInteraction({
    contactId: muhammed.id,
    type: "linkedin-introduction",
    channel: "linkedin",
    direction: "outbound",
    sentiment: "positive",
    outcome: "open-to-collaboration",
    notes: "Initial professional introduction and successful connection.",
  }, companyId);

  await service.addInteraction({
    contactId: muhammed.id,
    type: "professional-discussion",
    channel: "linkedin",
    direction: "outbound",
    sentiment: "positive",
    outcome: "follow-up-scheduled",
    notes:
      "Muhammed described his experience with accounting operations, inventory management, financial reporting, and ERP systems. He expressed interest in following Perionyx's progress and exchanging insights on finance technology.",
  }, companyId);

  // New interaction — detailed operational feedback
  await service.addInteraction({
    contactId: muhammed.id,
    type: "feedback-session",
    channel: "linkedin",
    direction: "inbound",
    sentiment: "positive",
    outcome: "feedback-provided",
    notes:
      "Provided detailed operational feedback on inventory reconciliation, stock corrections, ERP integration limitations, and real-time reporting gaps. Strong desire for automated reconciliation and intelligent discrepancy alerts.",
    linkedInsights: {
      "Inventory Reconciliation": [
        "Still depends heavily on spreadsheets",
        "Manual matching creates delay and errors",
        "Automated reconciliation is highly desired",
      ],
      "Stock Corrections": [
        "Require manual work in current ERP",
        "No automated adjustment workflow",
        "Needs approval chain for corrections",
      ],
      "ERP Integration": [
        "Weak integration between inventory and finance modules",
        "Data must be exported and re-imported manually",
        "Single source of truth is missing",
      ],
      "Real-time Reporting": [
        "Current reporting is batch/delayed",
        "Need live inventory valuations",
        "Need real-time financial impact of stock movements",
      ],
      "Discrepancy Alerts": [
        "Intelligent alerts would reduce manual work significantly",
        "Need rule-based threshold alerts",
        "Root cause identification desired",
      ],
    },
  }, companyId);

  await service.setContactIntelligence({
    contactId: muhammed.id,
    strengths: [
      "Full-cycle accounting operations",
      "Inventory management & control",
      "ERP systems expertise",
      "Month-end close & reporting",
      "AP/AR operations",
      "Operational feedback quality",
    ],
    potentialValue: [
      "Design partner — inventory modules",
      "Beta feedback — reconciliation features",
      "Customer interview — ERP integration pain points",
      "Product feedback — reporting & discrepancy alerts",
    ],
    notes:
      "Expertise Score: 9/10 — Strong hands-on accounting practitioner with deep inventory expertise. Design Partner Potential: High. Provided the most detailed operational feedback on inventory and reconciliation pain points. Strong candidate for inventory module design partnership.",
  }, companyId);

  // --- Contact 6: Ahmed Esmail (Updated) ---
  const ahmedEsmail = await service.addContact({
    name: "Ahmed Esmail",
    role: "Finance Professional — Tax & Regulatory Compliance",
    company: undefined,
    source: "linkedin",
    relationshipStage: "discovery",
    status: "active",
    classification: "subject-matter-expert-pending",
    expertise: [
      "VAT",
      "ZATCA",
      "Financial Reporting",
      "Tax Compliance",
      "ERP Systems",
      "Financial Operations",
    ],
    productModules: ["Tax", "Compliance", "Reporting"],
    tags: [
      "Tax",
      "VAT",
      "ZATCA",
      "Saudi Arabia",
      "Compliance",
      "ERP",
      "Financial Reporting",
      "Regulatory",
    ],
    notes:
      "Finance professional with expertise in VAT, ZATCA compliance, financial reporting, and ERP systems. Classification: Subject Matter Expert (Pending). Needs deeper discussion to confirm depth of regulatory knowledge.",
    isStrategicAdvisor: false,
    priority: "medium",
    region: "Saudi Arabia",
    relationshipType: "Industry Contact",
    potentialRoles: [
      "Subject Matter Expert — Tax & Compliance",
      "Customer Interview — VAT/ZATCA",
      "Beta Feedback — Compliance Features",
      "Product Feedback — ERP Integration",
    ],
  }, companyId);

  await service.addInteraction({
    contactId: ahmedEsmail.id,
    type: "linkedin-introduction",
    channel: "linkedin",
    direction: "outbound",
    sentiment: "positive",
    outcome: "open-to-collaboration",
    notes:
      "Initial professional introduction on LinkedIn. Ahmed's profile indicates strong expertise in VAT, ZATCA compliance, and financial operations in the Saudi Arabian market.",
  }, companyId);

  await service.setContactIntelligence({
    contactId: ahmedEsmail.id,
    strengths: [
      "VAT & ZATCA compliance expertise",
      "Financial reporting and operations",
      "ERP systems knowledge",
      "Saudi Arabian regulatory context",
    ],
    potentialValue: [
      "Subject matter expert — KSA tax & compliance",
      "Product feedback — VAT/ZATCA feature requirements",
      "Beta feedback — compliance module usability",
      "Customer interview — regulatory pain points in KSA",
    ],
    notes:
      "Expertise Score: 7/10 — Tax & compliance specialization is highly relevant for KSA market expansion. Subject Matter Expert: Pending — needs deeper discussion to assess depth of regulatory knowledge.",
  }, companyId);

  // ──────────────────────────────────────────────────────────────
  // NEW CONTACTS (Phase 12X)
  // ──────────────────────────────────────────────────────────────

  // --- Contact 7: Ammar Mahmoud ---
  const ammar = await service.addContact({
    name: "Ammar Mahmoud",
    role: "Senior Accountant",
    company: undefined,
    source: "linkedin",
    relationshipStage: "discovery",
    status: "active",
    classification: "subject-matter-expert-pending",
    expertise: ["AP", "AR", "ERP", "Financial Accounting"],
    tags: ["Accounting", "AP", "AR", "ERP", "Financial Accounting", "Pending Discovery"],
    notes: "Senior Accountant. Awaiting detailed discovery responses. Classification: Subject Matter Expert (Pending).",
    isStrategicAdvisor: false,
    priority: "medium",
    relationshipType: "Industry Contact",
    potentialRoles: [
      "Subject Matter Expert — AP/AR",
      "Customer Interview — Accounting Workflows",
    ],
  }, companyId);

  await service.addInteraction({
    contactId: ammar.id,
    type: "linkedin-introduction",
    channel: "linkedin",
    direction: "outbound",
    sentiment: "neutral",
    outcome: "follow-up-scheduled",
    notes: "Connected on LinkedIn. Awaiting detailed discovery responses to assess subject matter expertise and potential for deeper engagement.",
  }, companyId);

  // --- Contact 8: Mahmoud Shaker FMVA ---
  const mahmoudShaker = await service.addContact({
    name: "Mahmoud Shaker FMVA",
    role: "Financial Analyst",
    company: undefined,
    source: "linkedin",
    relationshipStage: "connected",
    status: "active",
    classification: "subject-matter-expert",
    designPartnerPotential: "medium",
    expertise: [
      "FP&A",
      "Budgeting",
      "Forecasting",
      "Financial Modelling",
      "Data Analytics",
    ],
    productModules: ["FP&A", "Executive AI", "Forecasting", "Reporting"],
    tags: [
      "FP&A",
      "Budgeting",
      "Forecasting",
      "Financial Modelling",
      "Data Analytics",
      "Executive AI",
    ],
    notes: "Financial Analyst with FMVA certification. Expertise in FP&A, budgeting, forecasting, financial modelling, and data analytics. Design Partner Potential: Medium.",
    isStrategicAdvisor: false,
    priority: "medium",
    relationshipType: "Subject Matter Expert",
    potentialRoles: [
      "Subject Matter Expert — FP&A",
      "Product Feedback — Forecasting",
      "Customer Interview — Budgeting Workflows",
    ],
  }, companyId);

  await service.addInteraction({
    contactId: mahmoudShaker.id,
    type: "linkedin-introduction",
    channel: "linkedin",
    direction: "outbound",
    sentiment: "positive",
    outcome: "open-to-collaboration",
    notes: "Connected on LinkedIn. Mahmoud's FMVA certification and FP&A expertise align with Perionyx Executive AI and Forecasting modules.",
  }, companyId);

  // --- Contact 9: Ahmed Abdelrahman Alazazy ---
  const ahmedAlazazy = await service.addContact({
    name: "Ahmed Abdelrahman Alazazy",
    role: "Senior GL & Tax Accountant",
    company: undefined,
    source: "linkedin",
    relationshipStage: "connected",
    status: "active",
    classification: "subject-matter-expert",
    expertise: [
      "General Ledger",
      "Tax",
      "Financial Reporting",
      "Month-End Close",
    ],
    productModules: ["General Ledger", "Tax", "Financial Close"],
    tags: [
      "General Ledger",
      "Tax",
      "Financial Reporting",
      "Month-End Close",
      "Financial Close",
    ],
    notes: "Senior GL & Tax Accountant with expertise in general ledger operations, tax compliance, financial reporting, and month-end close processes.",
    isStrategicAdvisor: false,
    priority: "medium",
    relationshipType: "Subject Matter Expert",
    potentialRoles: [
      "Subject Matter Expert — GL & Tax",
      "Product Feedback — Financial Close",
      "Beta Feedback — Tax Module",
    ],
  }, companyId);

  await service.addInteraction({
    contactId: ahmedAlazazy.id,
    type: "linkedin-introduction",
    channel: "linkedin",
    direction: "outbound",
    sentiment: "positive",
    outcome: "open-to-collaboration",
    notes: "Connected on LinkedIn. Expertise in GL, tax, financial reporting, and month-end close aligns directly with Perionyx Financial Close module.",
  }, companyId);

  // --- Contact 10: Ahmed Orabi ---
  const ahmedOrabi = await service.addContact({
    name: "Ahmed Orabi",
    role: "Accounts Payable / Procure-to-Pay",
    company: "Hikma Pharmaceuticals",
    source: "linkedin",
    relationshipStage: "in-discussion",
    status: "active",
    classification: "potential-design-partner",
    designPartnerPotential: "very-high",
    expertise: [
      "Accounts Payable",
      "Procure-to-Pay",
      "Workflow Automation",
    ],
    productModules: [
      "Procure-to-Pay",
      "Accounts Payable",
      "Workflow Automation",
    ],
    tags: [
      "AP",
      "Procure-to-Pay",
      "Workflow Automation",
      "Hikma Pharmaceuticals",
      "Design Partner",
      "Very High Priority",
    ],
    conversationSummary:
      "Requested additional information about Perionyx. High-value prospect at Hikma Pharmaceuticals with Procure-to-Pay expertise.",
    conversationStatus: "Requested additional information about Perionyx.",
    nextFollowUp: "Provide Perionyx overview. Conduct discovery interview.",
    notes:
      "Accounts Payable / Procure-to-Pay professional at Hikma Pharmaceuticals. Classification: Potential Design Partner. Very High priority. Next steps: provide Perionyx overview, conduct discovery interview.",
    isStrategicAdvisor: false,
    priority: "high",
    relationshipType: "Potential Design Partner",
    potentialRoles: [
      "Design Partner — P2P & AP",
      "Product Feedback — Workflow Automation",
      "Customer Interview — Procurement Processes",
    ],
  }, companyId);

  await service.addInteraction({
    contactId: ahmedOrabi.id,
    type: "linkedin-introduction",
    channel: "linkedin",
    direction: "outbound",
    sentiment: "positive",
    outcome: "follow-up-scheduled",
    notes: "Connected on LinkedIn. Ahmed requested additional information about Perionyx. High-value prospect at Hikma Pharmaceuticals.",
  }, companyId);

  await service.addTask({
    contactId: ahmedOrabi.id,
    title: "Provide Perionyx overview and schedule discovery interview",
    assignedTo: "Amos Ayodeji",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    status: "open",
    notes: "Send Perionyx platform overview. Follow up to schedule discovery interview focusing on Procure-to-Pay and AP workflows.",
  }, companyId);

  // --- Contact 11: Islam Moubark ---
  const islam = await service.addContact({
    name: "Islam Moubark",
    role: "Senior Accountant",
    company: undefined,
    source: "linkedin",
    relationshipStage: "warm-introduction",
    status: "active",
    classification: "industry-contact",
    expertise: ["Accounting", "Financial Operations"],
    tags: ["Senior Accountant", "Industry Contact", "WhatsApp", "Warm Introduction"],
    conversationSummary: "Shared WhatsApp number. Relationship moving to WhatsApp for deeper discussion.",
    conversationStatus: "Shared WhatsApp number.",
    notes: "Senior Accountant. Classification: Industry Contact. Shared WhatsApp number. Next step: move discussion to WhatsApp for warmer engagement.",
    isStrategicAdvisor: false,
    whatsapp: "Shared upon connection",
    priority: "medium",
    relationshipType: "Industry Contact",
  }, companyId);

  await service.addInteraction({
    contactId: islam.id,
    type: "linkedin-introduction",
    channel: "linkedin",
    direction: "outbound",
    sentiment: "positive",
    outcome: "open-to-collaboration",
    notes: "Connected on LinkedIn. Islam shared his WhatsApp number, indicating openness to move the conversation to a warmer channel.",
  }, companyId);

  // --- Contact 12: Mohamed Ezzat ---
  const mohamedEzzat = await service.addContact({
    name: "Mohamed Ezzat",
    role: "General Accountant",
    company: undefined,
    source: "linkedin",
    relationshipStage: "connected",
    status: "active",
    classification: "industry-contact",
    expertise: ["Accounting", "Financial Operations"],
    tags: [
      "General Accountant",
      "Industry Contact",
      "Arabic",
      "Contracting",
      "Real Estate",
      "Logistics",
    ],
    notes: "General Accountant. Prefers communication in Arabic. Industry experience: Contracting, Real Estate, Logistics.",
    isStrategicAdvisor: false,
    preferredLanguage: "Arabic",
    industryExperience: ["Contracting", "Real Estate", "Logistics"],
    priority: "low",
    relationshipType: "Industry Contact",
  }, companyId);

  await service.addInteraction({
    contactId: mohamedEzzat.id,
    type: "linkedin-introduction",
    channel: "linkedin",
    direction: "outbound",
    sentiment: "neutral",
    outcome: "open-to-collaboration",
    notes: "Connected on LinkedIn. Mohamed prefers communication in Arabic. Industry background in contracting, real estate, and logistics.",
  }, companyId);

  // --- Contact 13: Mohamed Abdelkarim ---
  const mohamedAbdelkarim = await service.addContact({
    name: "Mohamed Abdelkarim",
    role: "Accounting & Financial Management",
    company: undefined,
    source: "linkedin",
    relationshipStage: "discovery",
    status: "active",
    classification: "subject-matter-expert-pending",
    expertise: ["Financial Reporting", "ERP", "Cost Management"],
    productModules: ["Financial Reporting", "ERP", "Cost Management"],
    tags: [
      "Financial Reporting",
      "ERP",
      "Cost Management",
      "Subject Matter Expert Pending",
    ],
    notes: "Accounting & Financial Management professional. Classification: Subject Matter Expert (Pending). Expertise in financial reporting, ERP, and cost management.",
    isStrategicAdvisor: false,
    priority: "medium",
    relationshipType: "Subject Matter Expert (Pending)",
    potentialRoles: [
      "Subject Matter Expert — Financial Reporting & ERP",
      "Customer Interview — Cost Management",
    ],
  }, companyId);

  await service.addInteraction({
    contactId: mohamedAbdelkarim.id,
    type: "linkedin-introduction",
    channel: "linkedin",
    direction: "outbound",
    sentiment: "neutral",
    outcome: "follow-up-scheduled",
    notes: "Connected on LinkedIn. Needs discovery discussion to assess depth of ERP and cost management expertise.",
  }, companyId);

  // --- Contact 14: Karim Ahmed ---
  const karim = await service.addContact({
    name: "Karim Ahmed",
    role: "Finance & Accounting",
    company: undefined,
    source: "linkedin",
    relationshipStage: "discovery",
    status: "active",
    classification: "subject-matter-expert-pending",
    expertise: ["Financial Reporting", "Accounting", "Technology Adoption"],
    productModules: ["Financial Reporting", "Accounting", "Technology Adoption"],
    tags: [
      "Financial Reporting",
      "Accounting",
      "Technology Adoption",
      "Subject Matter Expert Pending",
    ],
    notes: "Finance & Accounting professional with interest in technology adoption. Classification: Subject Matter Expert (Pending).",
    isStrategicAdvisor: false,
    priority: "medium",
    relationshipType: "Subject Matter Expert (Pending)",
    potentialRoles: [
      "Subject Matter Expert — Technology Adoption",
      "Customer Interview — Accounting Technology",
    ],
  }, companyId);

  await service.addInteraction({
    contactId: karim.id,
    type: "linkedin-introduction",
    channel: "linkedin",
    direction: "outbound",
    sentiment: "neutral",
    outcome: "follow-up-scheduled",
    notes: "Connected on LinkedIn. Karim's interest in technology adoption aligns with Perionyx's value proposition. Needs deeper discovery.",
  }, companyId);

  // --- Contact 15: Ahmed Abdelmoneim ---
  const ahmedAbdelmoneim = await service.addContact({
    name: "Ahmed Abdelmoneim",
    role: "Financial Management & Treasury",
    company: undefined,
    source: "linkedin",
    relationshipStage: "connected",
    status: "active",
    classification: "subject-matter-expert",
    expertise: [
      "Treasury",
      "Odoo ERP",
      "Power BI",
      "Financial Management",
    ],
    productModules: ["Treasury", "Reporting", "Analytics", "ERP"],
    tags: [
      "Treasury",
      "Odoo ERP",
      "Power BI",
      "Financial Management",
      "Reporting",
      "Analytics",
    ],
    notes: "Financial Management & Treasury professional with expertise in treasury operations, Odoo ERP, and Power BI reporting. Classification: Subject Matter Expert.",
    isStrategicAdvisor: false,
    priority: "medium",
    relationshipType: "Subject Matter Expert",
    potentialRoles: [
      "Subject Matter Expert — Treasury & ERP",
      "Product Feedback — Treasury Modules",
      "Beta Feedback — Odoo Integration",
      "Customer Interview — Reporting & Analytics",
    ],
  }, companyId);

  await service.addInteraction({
    contactId: ahmedAbdelmoneim.id,
    type: "linkedin-introduction",
    channel: "linkedin",
    direction: "outbound",
    sentiment: "positive",
    outcome: "open-to-collaboration",
    notes: "Connected on LinkedIn. Expertise in treasury, Odoo ERP, and Power BI reporting aligns with Perionyx Treasury and Analytics modules.",
  }, companyId);

  // --- Contact 16: Khaleel Ur Rehman ADPA, CA ---
  const khaleel = await service.addContact({
    name: "Khaleel Ur Rehman ADPA, CA",
    role: "Finance Manager",
    company: undefined,
    source: "linkedin",
    relationshipStage: "active-engagement",
    status: "active",
    classification: "potential-design-partner",
    designPartnerPotential: "highest",
    expertise: [
      "Financial Operations",
      "Executive Reporting",
      "Treasury",
      "Accounting",
      "ERP",
    ],
    productModules: [
      "Financial Operations",
      "Executive Reporting",
      "Treasury",
      "Accounting",
      "ERP",
    ],
    tags: [
      "Finance Manager",
      "Design Partner",
      "Highest Priority",
      "ADPA",
      "CA",
      "Financial Operations",
      "Executive Reporting",
      "Treasury",
      "ERP",
      "Active Engagement",
    ],
    conversationSummary:
      "Explicitly asked: 'What can I do to support you in building that operating system?' This is the strongest engagement received so far.",
    keyProductInsights: [
      "Explicitly offered to support building Perionyx",
      "Strongest engagement signal received to date",
      "Finance leadership perspective available",
    ],
    conversationStatus: "Active Engagement — offered support",
    nextFollowUp: "Schedule a 30–45 minute discovery call.",
    potentialContributions: [
      "Workflow validation",
      "Product feedback",
      "Design partner",
      "Finance leadership perspective",
    ],
    recommendedNextSteps: [
      "Schedule a 30–45 minute discovery call",
      "Present current product roadmap for feedback",
      "Explore design partner agreement",
      "Establish regular feedback cadence",
    ],
    notes:
      "Finance Manager with ADPA and CA credentials. Classification: Potential Design Partner. Priority: Highest. This is the strongest engagement received so far — Khaleel explicitly asked how he can support building Perionyx. Recommended next step: schedule a 30–45 minute discovery call.",
    isStrategicAdvisor: false,
    priority: "high",
    relationshipType: "Potential Design Partner",
    potentialRoles: [
      "Design Partner",
      "Product Advisor",
      "Beta Tester",
      "Finance Leadership Council",
    ],
  }, companyId);

  await service.addInteraction({
    contactId: khaleel.id,
    type: "professional-discussion",
    channel: "linkedin",
    direction: "inbound",
    sentiment: "positive",
    outcome: "open-to-collaboration",
    notes:
      "Khaleel explicitly asked: 'What can I do to support you in building that operating system?' This is the strongest engagement received so far. He offered workflow validation, product feedback, design partnership, and finance leadership perspective.",
    keyInsights: [
      "Explicitly offered to help build Perionyx",
      "Available for workflow validation",
      "Offered product feedback",
      "Open to design partner role",
      "Finance leadership perspective available",
      "Strongest engagement signal in CRM",
    ],
  }, companyId);

  await service.addOpportunity({
    contactId: khaleel.id,
    title: "Design Partner — Khaleel Ur Rehman",
    stage: "qualification",
    probability: 70,
    category: "strategic-partnership",
    potentialOutcomes: [
      "Design Partner",
      "Product Feedback Loop",
      "Beta Testing",
      "Finance Leadership Council",
      "Customer Reference",
    ],
    priority: "high",
    notes: "Khaleel explicitly offered to support building Perionyx. Highest engagement signal in the CRM. Recommended next step: schedule 30–45 minute discovery call, present roadmap, explore formal design partner agreement.",
  }, companyId);

  await service.addTask({
    contactId: khaleel.id,
    title: "Schedule 30–45 minute discovery call",
    assignedTo: "Amos Ayodeji",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: "open",
    notes: "Highest priority task. Khaleel explicitly offered to support building Perionyx. Schedule discovery call to present roadmap, explore design partner agreement, and establish feedback cadence.",
  }, companyId);

  await service.setContactIntelligence({
    contactId: khaleel.id,
    strengths: [
      "Finance leadership experience",
      "ADPA and CA credentials",
      "Strategic thinking",
      "Proactive engagement",
      "Executive reporting expertise",
    ],
    potentialValue: [
      "Design partner — product validation",
      "Product feedback — executive reporting",
      "Beta testing — treasury & accounting modules",
      "Finance leadership perspective",
      "Customer reference after product launch",
    ],
    notes:
      "Engagement Score: 10/10 — Highest in CRM. Khaleel's proactive offer to support building Perionyx represents the strongest product validation signal to date. Design Partner Potential: Highest. Recommended immediate next step: schedule discovery call within 48 hours.",
  }, companyId);

  // ──────────────────────────────────────────────────────────────
  // PHASE 12A.4 — Product Intelligence Update (Developer Platform)
  // ──────────────────────────────────────────────────────────────

  // Khaleel Ur Rehman — Developer Platform relevance
  await service.addInteraction({
    contactId: khaleel.id,
    type: "professional-discussion",
    channel: "linkedin",
    direction: "outbound",
    sentiment: "positive",
    outcome: "follow-up-scheduled",
    notes:
      "Phase 12A.4 — Enterprise Developer Platform & Public APIs completed. Platform includes REST API, OpenAPI 3.1 spec, OAuth2, API keys, webhooks, SDK architecture (TS/JS/Python/Go/Java/.NET). Khaleel's role as Finance Manager makes him a prime candidate for API-enabled workflow automation and executive reporting integration. His offer to support building Perionyx now extends to API platform feedback.",
    keyInsights: [
      "Developer Platform provides API access to all Perionyx modules",
      "Webhook platform enables real-time integration with existing systems",
      "API keys and OAuth2 available for secure integration",
      "SDK architecture supports 6 languages",
      "OpenAPI 3.1 spec available for auto-generation of clients",
      "Khaleel can leverage APIs for custom executive reporting workflows",
    ],
  }, companyId);

  // Ahmed Orabi — Developer Platform relevance (API integration at Hikma)
  await service.addInteraction({
    contactId: ahmedOrabi.id,
    type: "professional-discussion",
    channel: "linkedin",
    direction: "outbound",
    sentiment: "positive",
    outcome: "follow-up-scheduled",
    notes:
      "Phase 12A.4 — Developer Platform completed. Webhook platform enables P2P event-driven integration. Ahmed's P2P focus at Hikma Pharmaceuticals can leverage webhooks for real-time invoice and payment notifications.",
    keyInsights: [
      "Webhook platform supports P2P event types",
      "API access for automated AP workflow integration",
      "OpenAPI spec enables rapid integration development",
      "Rate limits support enterprise-scale integrations",
    ],
  }, companyId);

  // ──────────────────────────────────────────────────────────────
  // PHASE 15.6 — NEW CONTACTS
  // ──────────────────────────────────────────────────────────────

  // --- Contact 17: Mohamed Gamal ---
  const mohamedGamal = await service.addContact({
    name: "Mohamed Gamal",
    role: "Junior General Ledger Accountant",
    company: undefined,
    source: "linkedin",
    relationshipStage: "connected",
    status: "active",
    expertise: [
      "General Ledger",
      "Bank Reconciliation",
      "Account Reconciliation",
      "Journal Entries",
      "Month-End Close",
    ],
    tags: [
      "Construction",
      "General Ledger",
      "Reconciliation",
      "CMA Candidate",
      "Potential Beta Reviewer",
    ],
    conversationSummary:
      "Positive response to Perionyx vision. Interested in following product progress.",
    conversationStatus: "Positive response — interested in tracking progress",
    notes:
      "Junior General Ledger Accountant in Construction industry. CMA Candidate. Positive response to Perionyx vision. Interested in following product progress and potential beta reviewer role.",
    isStrategicAdvisor: false,
    priority: "medium",
    relationshipType: "Warm Contact",
    potentialRoles: ["Future Beta Reviewer", "Product Feedback"],
    relationshipStrength: 4,
    trustScore: 5,
    engagementLevel: "low",
    championPotential: false,
    advisorPotential: false,
    investorPotential: false,
    pilotCustomerPotential: false,
    referralPotential: true,
    hiringPotential: false,
    strategicImportance: "medium",
    relationshipHealth: "healthy",
    nextRecommendedAction: "Share product updates and nurture toward beta participation.",
  }, companyId);

  await service.addInteraction({
    contactId: mohamedGamal.id,
    type: "professional-discussion",
    channel: "linkedin",
    direction: "outbound",
    sentiment: "positive",
    outcome: "open-to-collaboration",
    notes:
      "Connected on LinkedIn. Mohamed showed positive response to Perionyx vision and expressed interest in following product progress. Discussed pain points including delayed information collection, approval bottlenecks, manual bank reconciliation, manual account reconciliation, and manual balance reviews. Desired outcomes include automated reconciliations, automated approvals, better cross-department collaboration, faster month-end close, and recurring journal automation.",
  }, companyId);

  // --- Contact 18: Abdelhamed Saied ---
  const abdelhamed = await service.addContact({
    name: "Abdelhamed Saied",
    role: "Accountant / ERP Functional Consultant",
    company: undefined,
    source: "linkedin",
    relationshipStage: "discovery",
    status: "active",
    expertise: [
      "ERP Systems",
      "ERP Functional Consulting",
      "Accounting",
      "Workflow Automation",
    ],
    tags: [
      "ERP",
      "Functional Consultant",
      "Accounting",
      "ERP Integration",
      "Pending Discovery",
    ],
    conversationSummary: "Connected. Pending discovery discussion to assess potential.",
    notes:
      "Accountant and ERP Functional Consultant. Discovery pending — needs deeper discussion to assess potential as ERP integration advisor, workflow validation partner, and implementation feedback provider.",
    isStrategicAdvisor: false,
    priority: "medium",
    relationshipType: "Warm Contact",
    potentialRoles: [
      "ERP Integration Advisor",
      "Workflow Validation",
      "Implementation Feedback",
    ],
    relationshipStrength: 3,
    trustScore: 4,
    engagementLevel: "low",
    championPotential: false,
    advisorPotential: true,
    investorPotential: false,
    pilotCustomerPotential: false,
    referralPotential: false,
    hiringPotential: false,
    strategicImportance: "medium",
    relationshipHealth: "healthy",
    nextRecommendedAction: "Schedule discovery discussion to explore ERP integration advisory potential.",
  }, companyId);

  await service.addInteraction({
    contactId: abdelhamed.id,
    type: "linkedin-introduction",
    channel: "linkedin",
    direction: "outbound",
    sentiment: "neutral",
    outcome: "follow-up-scheduled",
    notes:
      "Connected on LinkedIn. Abdelhamed's profile indicates ERP functional consulting expertise. Needs a discovery discussion to assess potential fit as ERP integration advisor, workflow validation partner, and implementation feedback provider.",
  }, companyId);

  // --- Contact 19: Muhammad Abdul Rehman ---
  const muhammadRehman = await service.addContact({
    name: "Muhammad Abdul Rehman",
    role: "Head of Finance",
    company: undefined,
    source: "linkedin",
    relationshipStage: "connected",
    status: "active",
    expertise: [
      "Financial Management",
      "Executive Finance",
      "Strategic Planning",
      "Financial Operations",
    ],
    tags: [
      "Head of Finance",
      "Executive",
      "High Priority",
      "On Leave",
      "Pilot Advisor",
      "Strategic Feedback",
    ],
    conversationSummary: "On annual leave. High priority contact for executive workflow validation.",
    conversationStatus: "On annual leave — pending reconnection",
    nextFollowUp: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    notes:
      "Head of Finance. Currently on annual leave. Priority: High. Next action: Reconnect after leave. Potential roles: Executive workflow validation, Pilot advisor, Strategic feedback.",
    isStrategicAdvisor: false,
    priority: "high",
    relationshipType: "Warm Contact",
    potentialRoles: [
      "Executive Workflow Validation",
      "Pilot Advisor",
      "Strategic Feedback",
    ],
    relationshipStrength: 3,
    trustScore: 5,
    engagementLevel: "low",
    championPotential: true,
    advisorPotential: true,
    investorPotential: false,
    pilotCustomerPotential: true,
    referralPotential: true,
    hiringPotential: false,
    strategicImportance: "high",
    relationshipHealth: "needs-attention",
    nextRecommendedAction: "Reconnect after annual leave. Schedule executive workflow validation discussion.",
  }, companyId);

  await service.addInteraction({
    contactId: muhammadRehman.id,
    type: "professional-discussion",
    channel: "linkedin",
    direction: "outbound",
    sentiment: "positive",
    outcome: "follow-up-scheduled",
    notes:
      "Connected on LinkedIn. Muhammad is currently on annual leave. He is a high-priority contact with potential for executive workflow validation, pilot advisor role, and strategic feedback. Recommended next action: reconnect after leave to schedule a discussion.",
  }, companyId);
}
