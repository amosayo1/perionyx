import { complianceService } from "./services/compliance-service";
import type {
  RegulatoryFramework, Obligation, CompliancePolicy, Control, ControlTest,
  ComplianceAudit, Remediation, ComplianceReport, Training, ComplianceKPI,
  ComplianceAlert, ComplianceRecommendation,
} from "./types";

const CID = "acme-corp";

export function seedComplianceData(): void {
  const now = new Date();
  const lastYear = new Date(now.getFullYear() - 1, 0, 1);
  const nextYear = new Date(now.getFullYear() + 1, 11, 31);

  const frameworks: RegulatoryFramework[] = [
    { id: "fw-1", code: "sox", name: "Sarbanes-Oxley Act", description: "US federal law mandating corporate governance and financial disclosure", jurisdiction: "United States", effectiveFrom: new Date("2002-07-30"), version: "2024.1", isActive: true, companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "fw-2", code: "gdpr", name: "General Data Protection Regulation", description: "EU regulation on data protection and privacy", jurisdiction: "European Union", effectiveFrom: new Date("2018-05-25"), version: "2024.1", isActive: true, companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "fw-3", code: "pci-dss", name: "Payment Card Industry Data Security Standard", description: "Security standards for organizations handling cardholder data", jurisdiction: "Global", effectiveFrom: new Date("2004-12-15"), version: "4.0", isActive: true, companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "fw-4", code: "iso-27001", name: "ISO/IEC 27001", description: "International standard for information security management", jurisdiction: "Global", effectiveFrom: new Date("2022-10-25"), version: "2022", isActive: true, companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "fw-5", code: "basel-iii", name: "Basel III", description: "Global regulatory framework for banks and financial institutions", jurisdiction: "Global", effectiveFrom: new Date("2010-12-16"), version: "2024.1", isActive: true, companyId: CID, createdAt: lastYear, updatedAt: now },
  ];
  frameworks.forEach(f => complianceService.frameworks.add(f));

  const obligations: Obligation[] = [
    { id: "obl-1", frameworkId: "fw-1", code: "SOX-302", name: "Financial Report Certification", description: "CEO/CFO certification of financial statements", type: "statutory", frequency: "quarterly", owner: "cfo@acme.com", department: "Finance", dueDate: new Date(now.getFullYear(), 3, 15), status: "compliant", evidence: "cert-302-q1.pdf", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "obl-2", frameworkId: "fw-1", code: "SOX-404", name: "Internal Controls Assessment", description: "Annual assessment of internal controls over financial reporting", type: "statutory", frequency: "annual", owner: "audit@acme.com", department: "Audit", dueDate: new Date(now.getFullYear(), 11, 31), status: "compliant", evidence: "icfr-2024.pdf", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "obl-3", frameworkId: "fw-2", code: "GDPR-17", name: "Data Subject Access Requests", description: "Process DSARs within 30 days", type: "statutory", frequency: "ad-hoc", owner: "dpo@acme.com", department: "Legal", status: "compliant", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "obl-4", frameworkId: "fw-2", code: "GDPR-32", name: "Security of Processing", description: "Implement appropriate technical and organizational measures", type: "regulatory", frequency: "annual", owner: "ciso@acme.com", department: "Security", status: "partially-compliant", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "obl-5", frameworkId: "fw-3", code: "PCI-1", name: "Firewall Configuration", description: "Install and maintain firewall configuration", type: "regulatory", frequency: "monthly", owner: "netops@acme.com", department: "IT", status: "compliant", evidence: "fw-review-04.pdf", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "obl-6", frameworkId: "fw-3", code: "PCI-3", name: "Protect Stored Cardholder Data", description: "Encrypt cardholder data at rest", type: "regulatory", frequency: "quarterly", owner: "seceng@acme.com", department: "Security", status: "compliant", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "obl-7", frameworkId: "fw-4", code: "ISO-A.5", name: "Information Security Policies", description: "Maintain information security policy framework", type: "regulatory", frequency: "annual", owner: "ciso@acme.com", department: "Security", status: "compliant", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "obl-8", frameworkId: "fw-4", code: "ISO-A.9", name: "Access Control", description: "Control access to information and assets", type: "regulatory", frequency: "quarterly", owner: "iam@acme.com", department: "IT", status: "compliant", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "obl-9", frameworkId: "fw-5", code: "BASEL-LCR", name: "Liquidity Coverage Ratio", description: "Maintain LCR above 100%", type: "statutory", frequency: "monthly", owner: "treasury@acme.com", department: "Treasury", status: "compliant", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "obl-10", frameworkId: "fw-5", code: "BASEL-CET1", name: "Common Equity Tier 1 Capital", description: "Maintain CET1 ratio above regulatory minimum", type: "statutory", frequency: "quarterly", owner: "risk@acme.com", department: "Risk", status: "non-compliant", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "obl-11", frameworkId: "fw-1", code: "SOX-408", name: "Periodic Review of Internal Controls", description: "Ongoing evaluation of internal control effectiveness", type: "internal", frequency: "quarterly", owner: "audit@acme.com", department: "Audit", status: "under-review", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "obl-12", frameworkId: "fw-2", code: "GDPR-33", name: "Breach Notification", description: "Notify supervisory authority within 72 hours", type: "statutory", frequency: "ad-hoc", owner: "dpo@acme.com", department: "Legal", status: "compliant", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "obl-13", frameworkId: "fw-3", code: "PCI-10", name: "Logging and Monitoring", description: "Track and monitor all access to cardholder data", type: "regulatory", frequency: "daily", owner: "soc@acme.com", department: "Security", status: "compliant", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "obl-14", frameworkId: "fw-4", code: "ISO-A.12", name: "Operations Security", description: "Ensure correct and secure operations", type: "regulatory", frequency: "monthly", owner: "ops@acme.com", department: "IT", status: "partially-compliant", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "obl-15", frameworkId: "fw-5", code: "BASEL-NSFR", name: "Net Stable Funding Ratio", description: "Maintain NSFR above 100%", type: "statutory", frequency: "monthly", owner: "treasury@acme.com", department: "Treasury", status: "compliant", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "obl-16", frameworkId: "fw-1", code: "SOX-409", name: "Real-Time Disclosure", description: "Disclose material changes promptly", type: "statutory", frequency: "ad-hoc", owner: "cfo@acme.com", department: "Finance", status: "compliant", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "obl-17", frameworkId: "fw-2", code: "GDPR-5", name: "Data Minimization", description: "Limit collection to necessary data", type: "regulatory", frequency: "annual", owner: "dpo@acme.com", department: "Legal", status: "compliant", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "obl-18", frameworkId: "fw-3", code: "PCI-6", name: "Vulnerability Management", description: "Maintain vulnerability management program", type: "regulatory", frequency: "quarterly", owner: "seceng@acme.com", department: "Security", status: "not-assessed", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "obl-19", frameworkId: "fw-4", code: "ISO-A.16", name: "Incident Management", description: "Manage information security incidents", type: "regulatory", frequency: "monthly", owner: "soc@acme.com", department: "Security", status: "compliant", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "obl-20", frameworkId: "fw-5", code: "BASEL-LEV", name: "Leverage Ratio", description: "Maintain Tier 1 leverage ratio above 3%", type: "statutory", frequency: "quarterly", owner: "risk@acme.com", department: "Risk", status: "compliant", companyId: CID, createdAt: lastYear, updatedAt: now },
  ];
  obligations.forEach(o => complianceService.obligations.add(o));

  const policies: CompliancePolicy[] = [
    { id: "pol-1", code: "INFO-SEC-001", name: "Information Security Policy", description: "Enterprise-wide information security framework", category: "Security", status: "active", version: "4.2", owner: "ciso@acme.com", approvedBy: "cfo@acme.com", approvedDate: new Date(now.getFullYear(), 0, 15), effectiveDate: new Date(now.getFullYear(), 1, 1), reviewDate: new Date(now.getFullYear(), 6, 1), content: "Full security policy document", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "pol-2", code: "DATA-PRIV-001", name: "Data Privacy Policy", description: "Personal data handling and privacy procedures", category: "Privacy", status: "active", version: "3.1", owner: "dpo@acme.com", approvedBy: "cfo@acme.com", approvedDate: new Date(now.getFullYear(), 0, 20), effectiveDate: new Date(now.getFullYear(), 2, 1), content: "Full privacy policy document", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "pol-3", code: "FIN-CTRL-001", name: "Financial Controls Policy", description: "Internal controls over financial reporting", category: "Finance", status: "active", version: "5.0", owner: "cfo@acme.com", effectiveDate: new Date(now.getFullYear(), 0, 1), content: "SOX compliance procedures", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "pol-4", code: "RISK-MGMT-001", name: "Enterprise Risk Management Policy", description: "Framework for identifying and managing enterprise risks", category: "Risk", status: "draft", version: "2.0", owner: "cfo@acme.com", effectiveDate: new Date(now.getFullYear(), 5, 1), companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "pol-5", code: "ACC-CONT-001", name: "Access Control Policy", description: "User access management and authentication standards", category: "Security", status: "active", version: "3.2", owner: "iam@acme.com", approvedBy: "ciso@acme.com", approvedDate: new Date(now.getFullYear(), 2, 10), effectiveDate: new Date(now.getFullYear(), 3, 1), content: "IAM policies and procedures", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "pol-6", code: "BCP-001", name: "Business Continuity Policy", description: "Business continuity and disaster recovery framework", category: "Operations", status: "active", version: "2.1", owner: "ops@acme.com", effectiveDate: new Date(now.getFullYear(), 0, 15), companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "pol-7", code: "COMP-001", name: "Code of Conduct", description: "Enterprise code of ethics and conduct", category: "Governance", status: "active", version: "6.0", owner: "legal@acme.com", approvedBy: "cfo@acme.com", approvedDate: new Date(now.getFullYear(), 0, 5), effectiveDate: new Date(now.getFullYear(), 1, 1), companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "pol-8", code: "TRAVEL-001", name: "Travel and Expense Policy", description: "Employee travel and expense reimbursement policy", category: "Finance", status: "active", version: "4.3", owner: "ap@acme.com", effectiveDate: new Date(now.getFullYear(), 0, 1), companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "pol-9", code: "WHISTLE-001", name: "Whistleblower Policy", description: "Anonymous reporting of violations", category: "Governance", status: "active", version: "2.0", owner: "legal@acme.com", effectiveDate: new Date(now.getFullYear(), 0, 1), companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "pol-10", code: "THIRD-PARTY-001", name: "Third Party Risk Policy", description: "Vendor and third-party risk assessment requirements", category: "Risk", status: "archived", version: "1.0", owner: "procurement@acme.com", effectiveDate: new Date(now.getFullYear() - 1, 6, 1), companyId: CID, createdAt: lastYear, updatedAt: now },
  ];
  policies.forEach(p => complianceService.policies.add(p));

  const controls: Control[] = [
    { id: "ctrl-1", policyId: "pol-1", name: "Access Review", description: "Quarterly review of all privileged access accounts", type: "detective", owner: "iam@acme.com", frequency: "quarterly", automation: "Automated", lastResult: "pass", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "ctrl-2", policyId: "pol-1", name: "MFA Enforcement", description: "Multi-factor authentication for all system access", type: "preventive", owner: "seceng@acme.com", frequency: "continuous", automation: "Automated", lastResult: "pass", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "ctrl-3", policyId: "pol-2", name: "Data Classification", description: "Automated data classification and labeling", type: "preventive", owner: "dpo@acme.com", frequency: "continuous", automation: "Automated", lastResult: "pass", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "ctrl-4", policyId: "pol-3", name: "Segregation of Duties", description: "System-enforced SoD for financial transactions", type: "preventive", owner: "cfo@acme.com", frequency: "continuous", automation: "Automated", lastResult: "pass", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "ctrl-5", policyId: "pol-3", name: "Journal Entry Approval", description: "Dual approval for all journal entries above $10K", type: "preventive", owner: "controll@acme.com", frequency: "daily", automation: "Automated", lastResult: "pass", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "ctrl-6", policyId: "pol-5", name: "User Provisioning", description: "Automated user provisioning and de-provisioning", type: "preventive", owner: "iam@acme.com", frequency: "continuous", automation: "Automated", lastResult: "pass", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "ctrl-7", policyId: "pol-5", name: "Password Policy", description: "Complex password enforcement and rotation", type: "preventive", owner: "seceng@acme.com", frequency: "continuous", automation: "Automated", lastResult: "pass", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "ctrl-8", policyId: "pol-6", name: "Backup Verification", description: "Weekly backup integrity testing", type: "detective", owner: "ops@acme.com", frequency: "weekly", automation: "Semi-automated", lastResult: "pass", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "ctrl-9", policyId: "pol-6", name: "DRP Testing", description: "Annual disaster recovery plan testing", type: "corrective", owner: "ops@acme.com", frequency: "annual", lastResult: "fail", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "ctrl-10", policyId: "pol-1", name: "Vulnerability Scanning", description: "Weekly infrastructure vulnerability scanning", type: "detective", owner: "seceng@acme.com", frequency: "weekly", automation: "Automated", lastResult: "warning", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "ctrl-11", policyId: "pol-4", name: "Risk Assessment", description: "Annual enterprise risk assessment", type: "detective", owner: "risk@acme.com", frequency: "annual", lastResult: "not-tested", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "ctrl-12", policyId: "pol-7", name: "Conflict of Interest Disclosure", description: "Annual CoI disclosure filing", type: "detective", owner: "legal@acme.com", frequency: "annual", lastResult: "pass", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "ctrl-13", policyId: "pol-3", name: "Bank Reconciliation", description: "Daily bank reconciliation", type: "detective", owner: "treasury@acme.com", frequency: "daily", automation: "Semi-automated", lastResult: "pass", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "ctrl-14", policyId: "pol-1", name: "Endpoint Protection", description: "Antivirus and EDR on all endpoints", type: "preventive", owner: "seceng@acme.com", frequency: "continuous", automation: "Automated", lastResult: "pass", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "ctrl-15", policyId: "pol-2", name: "Data Retention", description: "Automated data retention and deletion", type: "corrective", owner: "dpo@acme.com", frequency: "monthly", automation: "Automated", lastResult: "pass", companyId: CID, createdAt: lastYear, updatedAt: now },
  ];
  controls.forEach(c => complianceService.controls.add(c));

  const tests: ControlTest[] = [
    { id: "test-1", controlId: "ctrl-1", tester: "audit@acme.com", testDate: new Date(now.getFullYear(), 3, 15), result: "pass", evidence: "access-review-q2.pdf", findings: "All accounts reviewed and verified", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "test-2", controlId: "ctrl-9", tester: "ops@acme.com", testDate: new Date(now.getFullYear(), 2, 10), result: "fail", evidence: "dr-test-feb.pdf", findings: "RTO not met for critical systems", remediation: "Update DR plan and schedule retest", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "test-3", controlId: "ctrl-10", tester: "seceng@acme.com", testDate: new Date(now.getFullYear(), 3, 1), result: "warning", findings: "3 high-severity vulnerabilities unpatched >30 days", remediation: "Prioritize patching schedule", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "test-4", controlId: "ctrl-5", tester: "controll@acme.com", testDate: new Date(now.getFullYear(), 3, 5), result: "pass", evidence: "je-approval-mar.pdf", findings: "All JEs properly approved", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "test-5", controlId: "ctrl-8", tester: "ops@acme.com", testDate: new Date(now.getFullYear(), 3, 12), result: "pass", evidence: "backup-verify-mar.pdf", findings: "All backups verified successfully", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "test-6", controlId: "ctrl-4", tester: "audit@acme.com", testDate: new Date(now.getFullYear(), 2, 28), result: "pass", findings: "No SoD conflicts detected", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "test-7", controlId: "ctrl-13", tester: "treasury@acme.com", testDate: new Date(now.getFullYear(), 3, 14), result: "pass", findings: "All accounts reconciled", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "test-8", controlId: "ctrl-2", tester: "seceng@acme.com", testDate: new Date(now.getFullYear(), 3, 10), result: "pass", evidence: "mfa-audit-q2.pdf", findings: "MFA enabled on all privileged accounts", companyId: CID, createdAt: lastYear, updatedAt: now },
  ];
  tests.forEach(t => complianceService.controlTests.add(t));

  const audits: ComplianceAudit[] = [
    { id: "aud-1", title: "SOX 404 Internal Controls Audit", type: "internal", frameworkId: "fw-1", scope: "All financial reporting controls for FY2024", auditor: "Internal Audit Team", auditDate: new Date(now.getFullYear(), 5, 1), status: "planned", findings: "", rating: "", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "aud-2", title: "PCI DSS Recertification", type: "third-party", frameworkId: "fw-3", scope: "All cardholder data environments", auditor: "QSA Corp", auditDate: new Date(now.getFullYear(), 2, 15), status: "completed", findings: "2 medium findings, 1 low finding", rating: "Compliant", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "aud-3", title: "GDPR Data Protection Audit", type: "regulatory", frameworkId: "fw-2", scope: "Data processing activities across all business units", auditor: "DPA", auditDate: new Date(now.getFullYear(), 7, 1), status: "in-progress", findings: "3 observations regarding consent management", rating: "", companyId: CID, createdAt: lastYear, updatedAt: now },
  ];
  audits.forEach(a => complianceService.audits.add(a));

  const remediations: Remediation[] = [
    { id: "rem-1", auditId: "aud-2", issue: "Update firewall rule documentation", priority: "medium", owner: "netops@acme.com", targetDate: new Date(now.getFullYear(), 5, 1), status: "resolved", resolution: "Documentation updated and reviewed", resolvedDate: new Date(now.getFullYear(), 4, 15), verifiedBy: "qsa@corp.com", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "rem-2", auditId: "aud-2", issue: "Remediate high-severity vulnerabilities on CDE", priority: "high", owner: "seceng@acme.com", targetDate: new Date(now.getFullYear(), 4, 1), status: "in-progress", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "rem-3", testId: "test-2", issue: "DRP RTO not met for critical financial systems", priority: "critical", owner: "ops@acme.com", targetDate: new Date(now.getFullYear(), 5, 15), status: "open", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "rem-4", testId: "test-3", issue: "Patch high-severity vulnerabilities exceeding SLA", priority: "high", owner: "seceng@acme.com", targetDate: new Date(now.getFullYear(), 4, 15), status: "in-progress", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "rem-5", issue: "CET1 ratio below regulatory minimum — capital plan required", priority: "critical", owner: "cfo@acme.com", targetDate: new Date(now.getFullYear(), 8, 1), status: "open", companyId: CID, createdAt: lastYear, updatedAt: now },
  ];
  remediations.forEach(r => complianceService.remediations.add(r));

  const reports: ComplianceReport[] = [
    { id: "rep-1", title: "Q1 Compliance Summary", period: "2024-Q1", generatedAt: new Date(now.getFullYear(), 3, 5), type: "summary", sections: { overview: { status: "compliant", score: 87 }, frameworks: ["SOX", "GDPR", "PCI-DSS"], obligations: { total: 20, compliant: 15, nonCompliant: 2 } }, companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "rep-2", title: "Annual SOX Compliance Report", period: "2024-FY", generatedAt: new Date(now.getFullYear(), 0, 15), type: "regulatory", sections: { certification: "CEO/CFO certified", controls: { tested: 15, passed: 12, failed: 1 }, remediations: { open: 2, resolved: 3 } }, companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "rep-3", title: "March Detailed Compliance Report", period: "2024-03", generatedAt: new Date(now.getFullYear(), 3, 1), type: "detailed", sections: { byFramework: { sox: { status: "compliant" }, gdpr: { status: "partially-compliant" } }, metrics: { frameworkScore: 82, controlPassRate: 80 } }, companyId: CID, createdAt: lastYear, updatedAt: now },
  ];
  reports.forEach(r => complianceService.reports.add(r));

  const trainings: Training[] = [
    { id: "trn-1", title: "SOX Compliance Training", description: "Annual SOX training for finance and audit teams", frameworkId: "fw-1", requiredFor: "Finance, Audit", dueDate: new Date(now.getFullYear(), 5, 30), status: "required", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "trn-2", title: "GDPR Data Protection Training", description: "GDPR awareness training for all staff", frameworkId: "fw-2", requiredFor: "All Employees", dueDate: new Date(now.getFullYear(), 8, 30), status: "required", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "trn-3", title: "PCI DSS Security Awareness", description: "Cardholder data handling procedures", frameworkId: "fw-3", requiredFor: "IT, Customer Service", dueDate: new Date(now.getFullYear(), 3, 15), status: "completed", completedAt: new Date(now.getFullYear(), 3, 10), companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "trn-4", title: "ISO 27001 ISMS Awareness", description: "Information security management system training", frameworkId: "fw-4", requiredFor: "Security, IT", dueDate: new Date(now.getFullYear(), 6, 15), status: "overdue", companyId: CID, createdAt: lastYear, updatedAt: now },
    { id: "trn-5", title: "Anti-Money Laundering Training", description: "AML compliance and reporting obligations", requiredFor: "Finance, Legal", dueDate: new Date(now.getFullYear(), 4, 1), status: "completed", completedAt: new Date(now.getFullYear(), 3, 28), companyId: CID, createdAt: lastYear, updatedAt: now },
  ];
  trainings.forEach(t => complianceService.trainings.add(t));

  const kpis: ComplianceKPI[] = [
    { name: "Overall Compliance Score", value: 82, previousValue: 78, target: 90, unit: "%", category: "overall", trend: "up", status: "warning" },
    { name: "Control Pass Rate", value: 80, previousValue: 75, target: 95, unit: "%", category: "controls", trend: "up", status: "warning" },
    { name: "Open Remediations", value: 5, previousValue: 7, target: 0, unit: "count", category: "remediation", trend: "down", status: "warning" },
    { name: "Training Completion", value: 60, previousValue: 55, target: 100, unit: "%", category: "training", trend: "up", status: "critical" },
    { name: "Audit Resolution Rate", value: 75, previousValue: 70, target: 100, unit: "%", category: "audit", trend: "stable", status: "warning" },
  ];
  kpis.forEach(k => complianceService.analytics.addKPI(k.name, k));

  const alerts: ComplianceAlert[] = [
    { id: "alert-1", severity: "critical", type: "non-compliance", title: "CET1 Capital Ratio Below Minimum", message: "Current CET1 ratio is 4.2%, below regulatory minimum of 4.5%. Remediation plan required immediately.", actionRequired: true, dismissed: false, companyId: CID, createdAt: new Date(now.getFullYear(), 3, 10) },
    { id: "alert-2", severity: "warning", type: "overdue-training", title: "ISO 27001 Training Overdue", message: "4 team members have overdue ISO 27001 training requirements.", actionRequired: true, dismissed: false, companyId: CID, createdAt: new Date(now.getFullYear(), 3, 8) },
    { id: "alert-3", severity: "warning", type: "control-failure", title: "DRP Testing Failed", message: "Annual disaster recovery test failed RTO requirements. Remediation in progress.", actionRequired: true, dismissed: false, companyId: CID, createdAt: new Date(now.getFullYear(), 2, 15) },
    { id: "alert-4", severity: "info", type: "upcoming-audit", title: "SOX 404 Audit Scheduled", message: "Annual SOX internal controls audit scheduled for June 1. Preparation should begin.", actionRequired: false, dismissed: false, companyId: CID, createdAt: new Date(now.getFullYear(), 3, 1) },
    { id: "alert-5", severity: "info", type: "policy-review", title: "Information Security Policy Due for Review", message: "Policy review date is July 1. 90 days remaining.", actionRequired: false, dismissed: false, companyId: CID, createdAt: new Date(now.getFullYear(), 3, 1) },
  ];
  alerts.forEach(a => complianceService.analytics.addAlert(a));

  const recommendations: ComplianceRecommendation[] = [
    { id: "rec-1", type: "remediation", title: "Implement Capital Restoration Plan", description: "Develop and implement a capital restoration plan to address CET1 ratio deficiency.", impact: "Regulatory compliance", confidence: 85, companyId: CID, implemented: false, createdAt: lastYear },
    { id: "rec-2", type: "automation", title: "Automate Control Testing", description: "Implement automated control testing for periodic controls to reduce manual effort.", impact: "Efficiency gain", confidence: 75, companyId: CID, implemented: false, createdAt: lastYear },
    { id: "rec-3", type: "policy", title: "Update Third-Party Risk Policy", description: "Revise and activate the archived third-party risk policy with updated requirements.", impact: "Reduced vendor risk", confidence: 90, companyId: CID, implemented: false, createdAt: lastYear },
    { id: "rec-4", type: "training", title: "Deploy Mandatory Compliance Training", description: "Create targeted training campaigns for SOX and ISO 27001 compliance.", impact: "Improved awareness", confidence: 80, companyId: CID, implemented: false, createdAt: lastYear },
    { id: "rec-5", type: "monitoring", title: "Enhance Compliance Dashboard", description: "Add real-time compliance monitoring dashboards for executive visibility.", impact: "Better oversight", confidence: 70, companyId: CID, implemented: false, createdAt: lastYear },
  ];
  recommendations.forEach(r => complianceService.analytics.addRecommendation(r));
}
