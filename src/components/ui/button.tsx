import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gold focus-visible:ring-offset-[#040404] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-gold text-black shadow-lg shadow-gold/20 hover:bg-[#c7a961]",
        destructive:
          "bg-[#b56b5e] text-white shadow-lg shadow-[#b56b5e]/20 hover:bg-[#9a5a4f] focus-visible:ring-[#b56b5e]",
        outline:
          "border border-gold/30 bg-gold/5 text-gold hover:bg-gold/10",
        secondary:
          "border border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]",
        ghost:
          "border border-white/[0.06] bg-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-white",
        link: "text-gold underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-lg px-3 text-sm",
        lg: "h-13 rounded-xl px-8",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
