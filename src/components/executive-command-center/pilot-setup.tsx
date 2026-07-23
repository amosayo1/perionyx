"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket, ArrowLeft, ChevronRight, Factory, ShoppingCart, UtensilsCrossed,
  Heart, Laptop, Building2, HardHat, HandHeart, CheckCircle, Copy,
} from "lucide-react";

interface PilotIndustry {
  id: string;
  name: string;
  icon: string;
  description: string;
  typicalRevenue: string;
  typicalEmployees: string;
  keyMetrics: string[];
  seedInstructions: string[];
}

const iconMap: Record<string, typeof Factory> = {
  Factory, ShoppingCart, UtensilsCrossed, Heart, Laptop, Building2, HardHat, HandHeart,
};

const industryColors: Record<string, string> = {
  manufacturing: "from-blue-500/20 to-blue-600/5",
  retail: "from-emerald-500/20 to-emerald-600/5",
  hospitality: "from-amber-500/20 to-amber-600/5",
  healthcare: "from-rose-500/20 to-rose-600/5",
  technology: "from-purple-500/20 to-purple-600/5",
  financial: "from-gold-500/20 to-gold-600/5",
  construction: "from-orange-500/20 to-orange-600/5",
  nonprofit: "from-cyan-500/20 to-cyan-600/5",
};

const industryIconColors: Record<string, string> = {
  manufacturing: "text-blue-400",
  retail: "text-emerald-400",
  hospitality: "text-amber-400",
  healthcare: "text-rose-400",
  technology: "text-purple-400",
  financial: "text-gold-500",
  construction: "text-orange-400",
  nonprofit: "text-cyan-400",
};

export function PilotSetup() {
  const [selectedIndustry, setSelectedIndustry] = useState<PilotIndustry | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 2000);
  }

  function handleCopyInstructions() {
    if (!selectedIndustry) return;
    const text = selectedIndustry.seedInstructions.join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function reset() {
    setSelectedIndustry(null);
    setGenerated(false);
    setGenerating(false);
    setCopied(false);
  }

  const industries = getDefaultIndustries();

  if (selectedIndustry) {
    const Icon = iconMap[selectedIndustry.icon] ?? Factory;
    const colorClass = industryIconColors[selectedIndustry.id] ?? "text-gold-500";

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={reset} className="p-2 rounded-lg border border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              <Icon className={`w-6 h-6 ${colorClass}`} />
              {selectedIndustry.name} Pilot
            </h1>
            <p className="text-sm text-white/60">{selectedIndustry.description}</p>
          </div>
        </div>

        {/* Industry Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Typical Profile</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/50">Annual Revenue</span>
                  <span className="text-sm text-white">{selectedIndustry.typicalRevenue}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/50">Employees</span>
                  <span className="text-sm text-white">{selectedIndustry.typicalEmployees}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Key Metrics</h3>
              <div className="flex flex-wrap gap-2">
                {selectedIndustry.keyMetrics.map((metric) => (
                  <span key={metric} className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                    {metric}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pilot Setup Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Pilot Setup Plan</h3>

          {!generated ? (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-white/60">
                  Generate a customized pilot environment for the {selectedIndustry.name} industry. This will create seed data,
                  configure industry-specific workflows, and set up sample dashboards.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">What will be configured:</h4>
                <ul className="space-y-1.5">
                  {["Industry-specific chart of accounts", "Sample transactions and balances", "Relevant compliance policies", "Custom KPI dashboards", "Role-based user profiles", "Sample workflows and approvals"].map((item) => (
                    <li key={item} className="text-xs text-white/50 flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-3 rounded-lg bg-gold-500/20 border border-gold-500/30 text-gold-500 hover:bg-gold-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
                    Generating Pilot...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    Generate Pilot
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-emerald-400 font-medium">Pilot environment generated</p>
                  <p className="text-xs text-emerald-400/60">Seed data ready for {selectedIndustry.name} industry</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-white">Seed Instructions</h4>
                  <button
                    onClick={handleCopyInstructions}
                    className="text-[10px] px-2 py-1 rounded border border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="bg-white/5 rounded-lg p-4 font-mono text-xs text-white/60 space-y-1">
                  {selectedIndustry.seedInstructions.map((instruction, i) => (
                    <div key={i}>{instruction}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
            <Rocket className="w-7 h-7 text-gold-500" />
            Pilot Setup
          </h1>
          <p className="text-sm text-white/60 mt-1">Configure industry-specific pilot environments for demonstrations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {industries.map((industry, i) => {
          const Icon = iconMap[industry.icon] ?? Factory;
          const gradientClass = industryColors[industry.id] ?? "from-gold-500/20 to-gold-600/5";
          const colorClass = industryIconColors[industry.id] ?? "text-gold-500";

          return (
            <motion.div
              key={industry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedIndustry(industry)}
              className={`bg-gradient-to-br ${gradientClass} border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all cursor-pointer group`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${colorClass}`} />
                </div>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-gold-500 transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{industry.name}</h3>
              <p className="text-xs text-white/50 mb-3 line-clamp-2">{industry.description}</p>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-white/40">Revenue</span>
                  <span className="text-[11px] text-white/70">{industry.typicalRevenue}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-white/40">Employees</span>
                  <span className="text-[11px] text-white/70">{industry.typicalEmployees}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {industry.keyMetrics.slice(0, 3).map((metric) => (
                  <span key={metric} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/40">
                    {metric}
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

function getDefaultIndustries(): PilotIndustry[] {
  return [
    {
      id: "manufacturing", name: "Manufacturing", icon: "Factory",
      description: "Multi-site manufacturer with complex supply chain, inventory management, and production cost accounting.",
      typicalRevenue: "$50M - $500M", typicalEmployees: "200 - 2,000",
      keyMetrics: ["COGS %", "Inventory Turns", "Production Yield", "SCM Cost", "Capacity Utilization"],
      seedInstructions: ["pnpm seed:manufacturing", "pnpm db:push -- --force", "echo 'Manufacturing pilot ready'"],
    },
    {
      id: "retail", name: "Retail", icon: "ShoppingCart",
      description: "Omnichannel retail with POS integration, inventory management, and seasonal demand patterns.",
      typicalRevenue: "$20M - $200M", typicalEmployees: "100 - 1,500",
      keyMetrics: ["Same-Store Sales", "Inventory Turns", "GMROI", "Shrink Rate", "Customer LTV"],
      seedInstructions: ["pnpm seed:retail", "pnpm db:push -- --force", "echo 'Retail pilot ready'"],
    },
    {
      id: "hospitality", name: "Hospitality", icon: "UtensilsCrossed",
      description: "Hotels and restaurants with RevPAR, F&B cost management, and seasonal revenue patterns.",
      typicalRevenue: "$10M - $100M", typicalEmployees: "150 - 1,000",
      keyMetrics: ["RevPAR", "Occupancy Rate", "F&B Cost %", "Labor Cost %", "Guest Satisfaction"],
      seedInstructions: ["pnpm seed:hospitality", "pnpm db:push -- --force", "echo 'Hospitality pilot ready'"],
    },
    {
      id: "healthcare", name: "Healthcare", icon: "Heart",
      description: "Healthcare provider with reimbursement cycles, compliance requirements, and patient billing.",
      typicalRevenue: "$30M - $300M", typicalEmployees: "300 - 3,000",
      keyMetrics: ["Days in AR", "Collection Rate", "Cost per Encounter", "Denial Rate", "Compliance Score"],
      seedInstructions: ["pnpm seed:healthcare", "pnpm db:push -- --force", "echo 'Healthcare pilot ready'"],
    },
    {
      id: "technology", name: "Technology SaaS", icon: "Laptop",
      description: "SaaS company with recurring revenue, subscription metrics, and R&D capitalization.",
      typicalRevenue: "$10M - $150M", typicalEmployees: "100 - 1,000",
      keyMetrics: ["ARR", "MRR", "Churn Rate", "CAC:LTV", "Rule of 40"],
      seedInstructions: ["pnpm seed:technology", "pnpm db:push -- --force", "echo 'Technology pilot ready'"],
    },
    {
      id: "financial", name: "Financial Services", icon: "Building2",
      description: "Financial institution with regulatory requirements, risk management, and complex instrument accounting.",
      typicalRevenue: "$100M - $1B", typicalEmployees: "500 - 5,000",
      keyMetrics: ["NIM", "ROA", "ROE", "Cost of Risk", "Capital Adequacy"],
      seedInstructions: ["pnpm seed:financial", "pnpm db:push -- --force", "echo 'Financial Services pilot ready'"],
    },
    {
      id: "construction", name: "Construction", icon: "HardHat",
      description: "Construction firm with project-based accounting, WIP tracking, and progress billing.",
      typicalRevenue: "$20M - $300M", typicalEmployees: "150 - 2,000",
      keyMetrics: ["Project Margin", "WIP % Complete", "Change Order %", "Labor Efficiency", "Backlog Value"],
      seedInstructions: ["pnpm seed:construction", "pnpm db:push -- --force", "echo 'Construction pilot ready'"],
    },
    {
      id: "nonprofit", name: "Non-Profit", icon: "HandHeart",
      description: "Non-profit organization with fund accounting, grant management, and donor reporting.",
      typicalRevenue: "$5M - $50M", typicalEmployees: "50 - 500",
      keyMetrics: ["Program Expense %", "Fund Balance", "Grant Utilization", "Donor Retention", "Admin Cost %"],
      seedInstructions: ["pnpm seed:nonprofit", "pnpm db:push -- --force", "echo 'Non-Profit pilot ready'"],
    },
  ];
}
