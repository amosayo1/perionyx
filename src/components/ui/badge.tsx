import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-white/[0.08] bg-white/[0.03] text-zinc-400",
        secondary: "border-gold/20 bg-gold/8 text-gold",
        outline: "border-gold/20 bg-transparent text-zinc-400",
        success: "border-gold/20 bg-gold/10 text-gold",
        warning: "border-gold/20 bg-gold/10 text-gold",
        danger: "border-red-500/20 bg-red-500/10 text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
