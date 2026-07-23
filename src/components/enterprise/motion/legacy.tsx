"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { fadeIn as fi, fadeInUp as fiu, fadeInDown as fid, fadeInLeft as fil, fadeInRight as fir, scaleIn as si, staggerContainer as sc } from "./tokens";
import type { ReactNode, HTMLAttributes } from "react";
import type { Variants } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

export const fadeIn: Variants = fi;
export const fadeInUp: Variants = fiu;
export const fadeInDown: Variants = fid;
export const fadeInLeft: Variants = fil;
export const fadeInRight: Variants = fir;
export const scaleIn: Variants = si;
export const staggerContainer: Variants = sc;

interface MotionDivProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "fadeIn" | "fadeInUp" | "fadeInDown" | "fadeInLeft" | "fadeInRight" | "scaleIn";
  delay?: number;
  as?: "div" | "section" | "article";
}

const VARIANT_MAP: Record<string, Variants> = {
  fadeIn: fi, fadeInUp: fiu, fadeInDown: fid, fadeInLeft: fil, fadeInRight: fir, scaleIn: si,
};

export function MotionDiv({
  children, variant = "fadeInUp", delay = 0, className, as: Tag = "div", ...props
}: MotionDivProps & { children: ReactNode }) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <Tag className={className} {...(props as any)}>{children}</Tag>;
  }

  const v = VARIANT_MAP[variant] ?? fiu;
  return (
    <motion.div
      variants={v}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}

export function MotionStagger({
  children, className, ...props
}: { children: ReactNode; className?: string }) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={sc}
      initial="hidden"
      animate="visible"
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}
