import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[120px] w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-3 text-sm text-white shadow-sm placeholder:text-zinc-500 transition-all duration-200 ease-out focus:outline-none focus:border-gold/40 focus:ring-2 focus:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
