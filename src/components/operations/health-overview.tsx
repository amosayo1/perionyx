"use client";

import { healthMetrics } from "./data";
import { HealthCard } from "./health-card";
import { motion } from "framer-motion";

export function HealthOverview() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {healthMetrics.map((metric, i) => (
        <motion.div
          key={metric.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <HealthCard metric={metric} />
        </motion.div>
      ))}
    </div>
  );
}
