export type PersonaRole = "CEO" | "CFO" | "Treasurer" | "Risk Officer" | "Compliance Officer" | "Auditor" | "Developer" | "Finance Manager";

export interface CommandCenterProfile {
  persona: PersonaRole;
  priorities: string[];
  focusModules: string[];
  systemPromptExtra: string;
  suggestedQuestions: string[];
}

const PROFILES: Record<PersonaRole, Omit<CommandCenterProfile, "persona">> = {
  CEO: {
    priorities: ["Strategic KPIs", "Revenue", "Treasury Health", "Board Reports"],
    focusModules: ["Dashboard", "Reports", "Risk Intelligence", "Executive Insights"],
    systemPromptExtra: "The user is a CEO. Focus on strategic overview, KPIs, treasury health, revenue, board-level reporting. Avoid operational details unless asked. Provide executive summaries with high-level recommendations.",
    suggestedQuestions: [
      "Summarize current treasury health",
      "What are this quarter's strategic KPIs?",
      "Generate an executive briefing",
      "Show revenue trends and projections",
      "What risks require board attention?",
    ],
  },
  CFO: {
    priorities: ["Cash Position", "Liquidity", "Approvals", "Financial Reports"],
    focusModules: ["Treasury", "Transactions", "Approvals", "Reports", "Ledger"],
    systemPromptExtra: "The user is a CFO. Focus on cash position, liquidity, approval workflows, financial reporting, and treasury operations. Provide detailed financial analysis when asked.",
    suggestedQuestions: [
      "What is our current cash position?",
      "Show pending approvals requiring CFO action",
      "Analyze liquidity across currencies",
      "Generate a daily financial summary",
      "What changed in our treasury position since yesterday?",
    ],
  },
  Treasurer: {
    priorities: ["Payments", "Bank Balances", "FX", "Forecasts"],
    focusModules: ["Transactions", "Wallets", "Treasury", "Exchange Rates", "Reconciliation"],
    systemPromptExtra: "The user is a Treasurer. Focus on payments, bank balances, FX exposure, liquidity forecasts, reconciliations. Provide specific transaction-level detail and operational recommendations.",
    suggestedQuestions: [
      "Show today's payment activity",
      "What is our FX exposure by currency?",
      "Are there any failed or pending payments?",
      "Show bank balances across all accounts",
      "Run a liquidity forecast",
    ],
  },
  "Risk Officer": {
    priorities: ["Incidents", "Alerts", "Policy Violations", "Compliance"],
    focusModules: ["Risk", "Policies", "Audit", "Notifications"],
    systemPromptExtra: "The user is a Risk Officer. Focus on risk alerts, incidents, policy violations, compliance monitoring. Highlight critical and high-severity items. Provide risk mitigation recommendations.",
    suggestedQuestions: [
      "Show open risk alerts by severity",
      "Which policies are being violated most?",
      "Summarize recent security incidents",
      "What are the top risk exposures?",
      "Show compliance status and exceptions",
    ],
  },
  "Compliance Officer": {
    priorities: ["Regulatory Events", "Exceptions", "Audit"],
    focusModules: ["Audit", "Policies", "Risk", "Notifications", "Approvals"],
    systemPromptExtra: "The user is a Compliance Officer. Focus on regulatory compliance, audit trail, policy exceptions, approval compliance, and risk mitigation. Provide audit-ready summaries.",
    suggestedQuestions: [
      "Summarize recent compliance events",
      "Show policy exceptions this month",
      "Generate an audit trail summary",
      "Are there any regulatory concerns?",
      "Show approval compliance rates",
    ],
  },
  Auditor: {
    priorities: ["Audit Trail", "Ledger", "Transaction History", "Policy Compliance"],
    focusModules: ["Audit", "Ledger", "Transactions", "Policies", "Approvals"],
    systemPromptExtra: "The user is an Auditor. Focus on audit trail, ledger entries, transaction history, policy compliance, and approval tracking. Provide detailed traceability and evidence.",
    suggestedQuestions: [
      "Show recent audit log activity",
      "Trace a specific transaction's lifecycle",
      "Show ledger entries for the past week",
      "Verify approval compliance for large payments",
      "Generate an audit findings report",
    ],
  },
  Developer: {
    priorities: ["API Usage", "Webhook Failures", "Platform Health"],
    focusModules: ["API Keys", "Webhooks", "Connectors", "Platform"],
    systemPromptExtra: "The user is a Developer. Focus on API keys, webhook deliveries, connector status, platform health, integration status. Provide technical detail and debug information.",
    suggestedQuestions: [
      "Show webhook delivery status",
      "Are there any connector failures?",
      "Show API key usage stats",
      "What is the current platform health?",
      "Show recent integration activity",
    ],
  },
  "Finance Manager": {
    priorities: ["Budget", "Reports", "Vendor Management", "Payments"],
    focusModules: ["Transactions", "Reports", "Approvals", "Reconciliation"],
    systemPromptExtra: "The user is a Finance Manager. Focus on operational finance, payment workflows, vendor management, reports, and reconciliations. Provide actionable operational data.",
    suggestedQuestions: [
      "Show vendor payment history",
      "What payments are pending approval?",
      "Generate a vendor spend report",
      "Reconciliation status and exceptions",
      "Show this month's transaction volume",
    ],
  },
};

export function getCommandCenterProfile(persona: PersonaRole): CommandCenterProfile {
  const profile = PROFILES[persona];
  if (!profile) return getCommandCenterProfile("CFO");
  return { persona, ...profile };
}

export function getAllPersonas(): PersonaRole[] {
  return Object.keys(PROFILES) as PersonaRole[];
}
