"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ExecutiveHeader } from "./executive-header";
import { TreasuryHealthOverview } from "./treasury-health-overview";
import { TreasuryScorecards } from "./treasury-scorecards";
import { NavigationCards } from "./navigation-cards";
import { ModuleSummaries } from "./module-summaries";
import { RegionalOverview } from "./regional-overview";
import { EntityOverview } from "./entity-overview";
import { CurrencyOverview } from "./currency-overview";
import { InstitutionOverview } from "./institution-overview";
import { PerformanceMetrics } from "./performance-metrics";
import { ActivityTimeline } from "./activity-timeline";
import { ActiveAlerts } from "./active-alerts";
import { ExecutiveInsights } from "./executive-insights";
import { RecommendationsPanel } from "./recommendations-panel";
import { ComingSoonRoadmap } from "./coming-soon-roadmap";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function GlobalTreasuryCommandCenter({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-5", className)}>
      <motion.div {...fadeInUp} transition={{ duration: 0.5 }}>
        <ExecutiveHeader />
      </motion.div>

      <motion.div {...fadeInUp} transition={{ duration: 0.5, delay: 0.1 }}>
        <TreasuryHealthOverview />
      </motion.div>

      <motion.div {...fadeInUp} transition={{ duration: 0.5, delay: 0.15 }}>
        <TreasuryScorecards />
      </motion.div>

      <motion.div {...fadeInUp} transition={{ duration: 0.5, delay: 0.2 }}>
        <NavigationCards />
      </motion.div>

      <motion.div {...fadeInUp} transition={{ duration: 0.5, delay: 0.25 }}>
        <ModuleSummaries />
      </motion.div>

      <motion.div {...fadeInUp} transition={{ duration: 0.5, delay: 0.3 }}>
        <RegionalOverview />
      </motion.div>

      <motion.div {...fadeInUp} transition={{ duration: 0.5, delay: 0.35 }}>
        <EntityOverview />
      </motion.div>

      <motion.div {...fadeInUp} transition={{ duration: 0.5, delay: 0.4 }}>
        <CurrencyOverview />
      </motion.div>

      <motion.div {...fadeInUp} transition={{ duration: 0.5, delay: 0.45 }}>
        <InstitutionOverview />
      </motion.div>

      <motion.div {...fadeInUp} transition={{ duration: 0.5, delay: 0.5 }}>
        <PerformanceMetrics />
      </motion.div>

      <motion.div {...fadeInUp} transition={{ duration: 0.5, delay: 0.55 }}>
        <ActivityTimeline />
      </motion.div>

      <motion.div {...fadeInUp} transition={{ duration: 0.5, delay: 0.6 }}>
        <ActiveAlerts />
      </motion.div>

      <motion.div {...fadeInUp} transition={{ duration: 0.5, delay: 0.65 }}>
        <ExecutiveInsights />
      </motion.div>

      <motion.div {...fadeInUp} transition={{ duration: 0.5, delay: 0.7 }}>
        <RecommendationsPanel />
      </motion.div>

      <motion.div {...fadeInUp} transition={{ duration: 0.5, delay: 0.75 }}>
        <ComingSoonRoadmap />
      </motion.div>
    </div>
  );
}
