"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedPageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: [0, 0, 0.2, 1] as [number, number, number, number] },
};

export function AnimatedPageContainer({ children, className }: AnimatedPageContainerProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={cn("space-y-6", className)}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, delay, ease: [0, 0, 0.2, 1] as [number, number, number, number] },
  }),
};

export function AnimatedSection({ children, className, delay = 0 }: AnimatedSectionProps) {
  return (
    <motion.div
      custom={delay}
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedList({ children, className }: AnimatedListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedListItemProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedListItem({ children, className }: AnimatedListItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 6 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
