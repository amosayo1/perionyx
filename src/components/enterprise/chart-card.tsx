"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { fadeInUp } from "@/components/enterprise/motion/tokens";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  toolbar?: ReactNode;
  className?: string;
}

export function ChartCard({ title, description, children, toolbar, className }: ChartCardProps) {
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ duration: 0.35 }}>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
          </div>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}
