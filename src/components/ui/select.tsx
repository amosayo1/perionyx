import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-white shadow-sm transition-all duration-200 ease-out focus:outline-none focus:border-gold/40 focus:ring-2 focus:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export { Select };
