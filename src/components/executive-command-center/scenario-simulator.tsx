"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, ArrowLeft, ChevronRight, CheckCircle, Clock, Lightbulb,
  Target, Zap, Shield, TrendingUp, AlertTriangle,
} from "lucide-react";

interface ScenarioStep {
  title: string;
  specialist: string;
  action: string;
  expectedResult: string;
  tips: string[];
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  specialistTags: string[];
  steps: ScenarioStep[];
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  advanced: "bg-red-500/20 text-red-400 border-red-500/30",
};

const specialistColors: Record<string, string> = {
  Treasury: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Controller: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Audit: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Compliance: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  Tax: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  FPandA: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Risk: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Governance: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

const scenarioIcons: Record<string, typeof Target> = {
  treasury: TrendingUp,
  controller: Target,
  audit: Shield,
  compliance: AlertTriangle,
  tax: Target,
  fpa: TrendingUp,
  risk: AlertTriangle,
  governance: Shield,
};

export function ScenarioSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  function startScenario(scenario: Scenario) {
    setSelectedScenario(scenario);
    setCurrentStep(0);
    setCompletedSteps(new Set());
  }

  function nextStep() {
    if (!selectedScenario) return;
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(currentStep);
      return next;
    });
    if (currentStep < selectedScenario.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  function prevStep() {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }

  function resetScenario() {
    setSelectedScenario(null);
    setCurrentStep(0);
    setCompletedSteps(new Set());
  }

  const scenarios = getDefaultScenarios();

  if (selectedScenario) {
    const step = selectedScenario.steps[currentStep];
    const isLast = currentStep === selectedScenario.steps.length - 1;
    const allCompleted = completedSteps.size === selectedScenario.steps.length;
    const progress = (completedSteps.size / selectedScenario.steps.length) * 100;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={resetScenario} className="p-2 rounded-lg border border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">{selectedScenario.name}</h1>
            <p className="text-sm text-white/60">{selectedScenario.description}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/50">Step {currentStep + 1} of {selectedScenario.steps.length}</span>
            <span className="text-xs text-gold-500">{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gold-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex gap-1 mt-3">
            {selectedScenario.steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  completedSteps.has(i) ? "bg-emerald-400" : i === currentStep ? "bg-gold-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Current Step */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${specialistColors[step.specialist] ?? "bg-white/10 text-white/50 border-white/20"}`}>
                {step.specialist}
              </span>
              {completedSteps.has(currentStep) && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  COMPLETED
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-white mb-4">{step.title}</h2>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <span className="text-[10px] text-white/40 uppercase tracking-wider">Action</span>
                <p className="text-sm text-white/80 mt-1">{step.action}</p>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
                <span className="text-[10px] text-emerald-400/60 uppercase tracking-wider">Expected Result</span>
                <p className="text-sm text-emerald-400/80 mt-1">{step.expectedResult}</p>
              </div>

              {step.tips.length > 0 && (
                <div className="bg-gold-500/5 border border-gold-500/20 rounded-lg p-4">
                  <span className="text-[10px] text-gold-500/60 uppercase tracking-wider flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" /> Tips
                  </span>
                  <ul className="mt-2 space-y-1">
                    {step.tips.map((tip, j) => (
                      <li key={j} className="text-xs text-white/60 flex items-start gap-2">
                        <span className="text-gold-500 mt-0.5">&#x2022;</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-lg border border-white/10 text-sm text-white/50 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {allCompleted ? (
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Scenario Complete!</span>
            </div>
          ) : (
            <button
              onClick={nextStep}
              className="px-4 py-2 rounded-lg bg-gold-500/20 border border-gold-500/30 text-sm text-gold-500 hover:bg-gold-500/30 transition-colors flex items-center gap-2"
            >
              {isLast ? "Complete" : "Next Step"}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
            <Play className="w-7 h-7 text-gold-500" />
            Demo Scenarios
          </h1>
          <p className="text-sm text-white/60 mt-1">Step-by-step walkthroughs of enterprise financial workflows</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scenario, i) => {
          const Icon = scenarioIcons[scenario.specialistTags[0]?.toLowerCase()] ?? Target;
          return (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => startScenario(scenario)}
              className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gold-500" />
                </div>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-gold-500 transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{scenario.name}</h3>
              <p className="text-xs text-white/50 mb-3 line-clamp-2">{scenario.description}</p>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${difficultyColors[scenario.difficulty]}`}>
                  {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
                </span>
                <span className="text-[10px] text-white/40 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {scenario.estimatedMinutes} min
                </span>
                <span className="text-[10px] text-white/40">{scenario.steps.length} steps</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {scenario.specialistTags.map((tag) => (
                  <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full border ${specialistColors[tag] ?? "bg-white/10 text-white/50 border-white/20"}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function getDefaultScenarios(): Scenario[] {
  return [
    {
      id: "s1", name: "Month-End Close", description: "Complete the monthly financial close process from task assignment to board reporting.",
      difficulty: "beginner", estimatedMinutes: 15, specialistTags: ["Controller", "Audit"],
      steps: [
        { title: "Close Task Board Review", specialist: "Controller", action: "Navigate to the Close Command Center and review all open close tasks. Identify any blockers or overdue items.", expectedResult: "Clear visibility into 47 close tasks with 6 flagged as at-risk.", tips: ["Check the close calendar for task dependencies.", "Prioritize intercompany reconciliations first."] },
        { title: "Journal Entry Review", specialist: "Controller", action: "Review pending journal entries in the Journal Review queue. Approve or reject each based on supporting documentation.", expectedResult: "12 journal entries reviewed, 10 approved, 2 sent back for revision.", tips: ["Look for entries without supporting attachments.", "Check for round-number entries which may indicate estimates."] },
        { title: "Reconciliation Completion", specialist: "Controller", action: "Run bank reconciliations for all material accounts. Investigate and clear any outstanding items.", expectedResult: "All 23 material accounts reconciled with zero exceptions.", tips: ["Focus on accounts with balances >$1M first.", "Auto-matching handles 85% of items automatically."] },
        { title: "Close Certification", specialist: "Audit", action: "Generate the close certification package. Verify all required sign-offs are captured.", expectedResult: "Close certification document generated with all 8 required signatures.", tips: ["Export the certification as PDF for audit trail.", "Verify SOX compliance checklist is complete."] },
      ],
    },
    {
      id: "s2", name: "Treasury Cash Management", description: "Manage daily cash positions, execute transfers, and maintain liquidity buffers.",
      difficulty: "beginner", estimatedMinutes: 12, specialistTags: ["Treasury"],
      steps: [
        { title: "Morning Cash Position", specialist: "Treasury", action: "Review consolidated cash position across all bank accounts. Verify balances match expected amounts from yesterday's forecast.", expectedResult: "Cash position at $47.2M across 12 accounts, variance of +$0.3M from forecast.", tips: ["Check for overnight wires that may not yet be reflected.", "Compare against the 13-week forecast."] },
        { title: "Liquidity Assessment", specialist: "Treasury", action: "Calculate current liquidity ratio. Ensure it meets the minimum 1.5x policy requirement.", expectedResult: "Liquidity ratio at 2.4x, well above the 1.5x minimum.", tips: ["Include committed credit facilities in the calculation.", "Exclude restricted cash from available liquidity."] },
        { title: "Transfer Execution", specialist: "Treasury", action: "Execute necessary intercompany transfers to optimize cash utilization. Confirm each transfer with dual authorization.", expectedResult: "3 transfers executed totaling $4.2M, all with dual authorization confirmed.", tips: ["Always verify beneficiary details before execution.", "Check cut-off times for same-day settlement."] },
      ],
    },
    {
      id: "s3", name: "SOX Compliance Audit", description: "Conduct internal controls review, identify exceptions, and implement remediation.",
      difficulty: "intermediate", estimatedMinutes: 18, specialistTags: ["Audit", "Compliance"],
      steps: [
        { title: "Control Testing", specialist: "Audit", action: "Run automated control tests across all key financial processes. Review any test failures.", expectedResult: "94% of 247 controls passed. 15 exceptions identified requiring investigation.", tips: ["Focus on controls with high risk ratings first.", "Compare results against previous period for trends."] },
        { title: "Exception Investigation", specialist: "Audit", action: "For each exception, gather evidence, interview process owners, and determine root cause.", expectedResult: "All 15 exceptions investigated. 3 are confirmed findings, 12 are documentation gaps.", tips: ["Document everything — auditors need evidence.", "Distinguish between design gaps and operating failures."] },
        { title: "Remediation Planning", specialist: "Compliance", action: "Create remediation plans for each confirmed finding. Assign owners and set deadlines.", expectedResult: "3 remediation plans created with owners assigned and 30-day deadlines set.", tips: ["Prioritize findings by materiality and risk.", "Include both short-term fixes and long-term improvements."] },
      ],
    },
    {
      id: "s4", name: "FX Risk Hedging", description: "Identify foreign exchange exposures, evaluate hedging strategies, and execute forward contracts.",
      difficulty: "advanced", estimatedMinutes: 20, specialistTags: ["Treasury", "Risk"],
      steps: [
        { title: "Exposure Identification", specialist: "Treasury", action: "Review all open FX positions across currencies. Calculate net exposure by currency pair.", expectedResult: "Net EUR exposure: $12.4M (exceeds $10M threshold). GBP: $3.2M. JPY: -$1.8M.", tips: ["Include both transaction and translation exposures.", "Check for unhedged intercompany receivables."] },
        { title: "Hedge Strategy Evaluation", specialist: "Risk", action: "Evaluate hedging options: forwards, options, or natural hedging. Model cost-benefit for each.", expectedResult: "Forward contracts recommended for $8M of EUR exposure at 4.2% premium.", tips: ["Compare forward rates against market consensus.", "Consider rolling hedges for ongoing exposures."] },
        { title: "Execute Hedges", specialist: "Treasury", action: "Execute approved hedge transactions with counterparty banks. Confirm trade details and settlement dates.", expectedResult: "4 forward contracts executed: $5M EUR/USD, $3M EUR/USD, $2M GBP/USD, $1M USD/JPY.", tips: ["Verify counterparty credit limits before execution.", "Log all trades in the hedge accounting system."] },
      ],
    },
    {
      id: "s5", name: "Transfer Pricing Review", description: "Review intercompany pricing, document arm's length compliance, and file documentation.",
      difficulty: "advanced", estimatedMinutes: 22, specialistTags: ["Tax", "Compliance"],
      steps: [
        { title: "Transaction Mapping", specialist: "Tax", action: "Map all intercompany transactions across entities. Identify which fall within transfer pricing policy scope.", expectedResult: "47 intercompany transactions identified across 8 legal entities in 4 jurisdictions.", tips: ["Include management fees and cost-sharing arrangements.", "Check for new intercompany transactions not yet in policy."] },
        { title: "Benchmarking Analysis", specialist: "Tax", action: "Compare intercompany margins against arm's length ranges using comparable data.", expectedResult: "3 transactions flagged outside arm's length range: DE-SG (15% vs 8-12%), US-UK (22% vs 18-20%).", tips: ["Use multiple benchmarking databases for comparability.", "Consider industry-specific adjustments."] },
        { title: "Documentation Preparation", specialist: "Compliance", action: "Prepare master file and local file documentation. Ensure all jurisdictions have required documentation.", expectedResult: "Documentation packages prepared for all 4 jurisdictions. Master file consolidated.", tips: ["Follow OECD guidelines for documentation structure.", "Include economic analysis supporting pricing decisions."] },
      ],
    },
    {
      id: "s6", name: "Budget Variance Analysis", description: "Analyze budget-to-actual variances, identify drivers, and recommend corrective actions.",
      difficulty: "intermediate", estimatedMinutes: 15, specialistTags: ["FPandA", "Controller"],
      steps: [
        { title: "Variance Report Generation", specialist: "FPandA", action: "Generate budget vs actual variance report for the current period. Segment by department and cost center.", expectedResult: "Overall variance: +$2.4M (3.2%). Marketing: +$800K (12%). Engineering: -$200K (-1.5%).", tips: ["Focus on variances >5% or >$100K.", "Separate volume variances from rate variances."] },
        { title: "Root Cause Analysis", specialist: "FPandA", action: "For each material variance, identify the root cause: volume, price, mix, or timing.", expectedResult: "Marketing overspend driven by Q2 campaign launch ($600K) and new hires ($200K).", tips: ["Interview department heads for context.", "Check if variances are one-time or recurring."] },
        { title: "Corrective Action Planning", specialist: "Controller", action: "Develop corrective actions for material variances. Update forecast to reflect revised expectations.", expectedResult: "Marketing budget revised: $400K reallocated from Q3 events. Forecast updated.", tips: ["Get department sign-off on revised budgets.", "Document variance explanations for audit trail."] },
      ],
    },
    {
      id: "s7", name: "Incident Response", description: "Respond to a financial system incident, assess impact, and implement containment measures.",
      difficulty: "advanced", estimatedMinutes: 25, specialistTags: ["Risk", "Audit", "Compliance"],
      steps: [
        { title: "Incident Detection", specialist: "Risk", action: "Review incident alert. Assess severity, affected systems, and potential financial impact.", expectedResult: "Severity: HIGH. Payment processing system degraded. 23 transactions queued. Potential impact: $1.2M delayed.", tips: ["Check if the incident is isolated or systemic.", "Verify backup systems are operational."] },
        { title: "Containment Actions", specialist: "Risk", action: "Implement containment: switch to backup processing, notify affected parties, activate manual workarounds.", expectedResult: "Backup processing activated. 23 transactions re-routed. Manual processing for urgent payments.", tips: ["Document all containment actions with timestamps.", "Verify backup processing is functioning correctly."] },
        { title: "Root Cause Investigation", specialist: "Audit", action: "Investigate root cause. Review system logs, configuration changes, and recent deployments.", expectedResult: "Root cause: database connection pool exhaustion due to misconfigured query in latest deploy.", tips: ["Preserve all logs and evidence before remediation.", "Check for similar vulnerabilities in other systems."] },
        { title: "Remediation & Reporting", specialist: "Compliance", action: "Implement permanent fix. Prepare incident report for management and regulators if required.", expectedResult: "Fix deployed and verified. Incident report prepared. No regulatory notification required.", tips: ["Include timeline, impact, root cause, and prevention in the report.", "Update incident response procedures based on lessons learned."] },
      ],
    },
    {
      id: "s8", name: "Board Pack Preparation", description: "Compile executive board pack with financial summaries, risk reports, and governance updates.",
      difficulty: "intermediate", estimatedMinutes: 16, specialistTags: ["Governance", "Controller"],
      steps: [
        { title: "Data Collection", specialist: "Controller", action: "Gather financial statements, KPI dashboards, and close certification from all specialists.", expectedResult: "All required data packages received from 6 specialists. 2 items pending final review.", tips: ["Set a data submission deadline 48 hours before board meeting.", "Use automated data collection where possible."] },
        { title: "Narrative Preparation", specialist: "Governance", action: "Write executive narrative summarizing financial performance, risks, and strategic initiatives.", expectedResult: "8-page executive narrative completed with charts and talking points.", tips: ["Lead with the most important information.", "Include both positive and negative developments."] },
        { title: "Review & Approval", specialist: "Governance", action: "Route board pack for CFO and CEO review. Capture sign-offs and incorporate feedback.", expectedResult: "CFO signed off. CEO requested 2 minor revisions. Final pack approved.", tips: ["Allow 24 hours for executive review.", "Version control is critical — use only the latest approved version."] },
      ],
    },
    {
      id: "s9", name: "Policy Compliance Check", description: "Verify enterprise policy compliance, identify gaps, and initiate remediation workflows.",
      difficulty: "beginner", estimatedMinutes: 10, specialistTags: ["Compliance", "Governance"],
      steps: [
        { title: "Compliance Dashboard Review", specialist: "Compliance", action: "Review the compliance dashboard. Check policy coverage, obligation status, and violation count.", expectedResult: "Policy coverage: 89%. 3 open violations. 12 obligations due this month.", tips: ["Focus on critical policies first (SOX, AML, data privacy).", "Check for recently updated regulations."] },
        { title: "Violation Investigation", specialist: "Compliance", action: "For each open violation, review details, assign investigator, and set resolution deadline.", expectedResult: "3 violations assigned: 1 data access, 1 approval chain, 1 reporting deadline.", tips: ["Assign to the process owner, not just the department head.", "Set realistic but urgent deadlines."] },
        { title: "Remediation Tracking", specialist: "Governance", action: "Update remediation tracker. Verify completed actions and close resolved items.", expectedResult: "2 of 3 violations remediated. 1 requires system configuration change (ETA 5 days).", tips: ["Verify remediation with evidence, not just verbal confirmation.", "Update the compliance register for audit trail."] },
      ],
    },
    {
      id: "s10", name: "Cash Flow Forecast", description: "Build and validate 13-week cash flow forecast with scenario analysis.",
      difficulty: "intermediate", estimatedMinutes: 14, specialistTags: ["Treasury", "FPandA"],
      steps: [
        { title: "Data Aggregation", specialist: "Treasury", action: "Pull actuals through current week. Update known receivables, payables, and committed flows.", expectedResult: "Actuals updated through Week 28. $4.2M in confirmed receivables, $3.8M in committed payables.", tips: ["Verify bank feeds are current.", "Include all committed capital expenditures."] },
        { title: "Forecast Build", specialist: "FPandA", action: "Build base case forecast using historical patterns, known events, and business driver assumptions.", expectedResult: "Base case shows minimum cash of $38.5M in Week 34, above $35M threshold.", tips: ["Use conservative assumptions for receivables collection.", "Include seasonal patterns in the model."] },
        { title: "Scenario Analysis", specialist: "Treasury", action: "Run stress scenarios: delayed collections (-20%), accelerated payables (+15%), and combined stress.", expectedResult: "Stress scenario minimum: $31.2M (Week 36). Below comfort zone — contingency plan needed.", tips: ["Always run the combined worst-case scenario.", "Identify the exact week where the shortfall occurs."] },
      ],
    },
    {
      id: "s11", name: "New Vendor Onboarding", description: "Onboard a new vendor with due diligence, compliance checks, and payment setup.",
      difficulty: "beginner", estimatedMinutes: 11, specialistTags: ["Compliance", "Controller"],
      steps: [
        { title: "Vendor Due Diligence", specialist: "Compliance", action: "Run AML/sanctions screening. Verify business registration and beneficial ownership.", expectedResult: "Vendor cleared: no AML flags, business registration verified, UBO identified.", tips: ["Screen against all relevant sanctions lists.", "Verify the vendor's banking details match registration."] },
        { title: "Compliance Documentation", specialist: "Compliance", action: "Collect required compliance documents: W-9/W-8BEN, insurance certificates, terms & conditions.", expectedResult: "All 4 required documents collected and verified. Insurance coverage adequate.", tips: ["Set document expiry reminders.", "Store originals in the document management system."] },
        { title: "Payment Setup", specialist: "Controller", action: "Create vendor in ERP system. Configure payment terms, bank details, and approval workflow.", expectedResult: "Vendor created with NET30 terms, ACH payment method, and standard approval workflow.", tips: ["Verify bank details with a micro-deposit test.", "Match payment terms to contract negotiations."] },
      ],
    },
  ];
}
