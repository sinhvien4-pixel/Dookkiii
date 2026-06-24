import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-dookki-red text-white",
        secondary: "bg-white/10 text-white",
        outline: "border border-white/30 text-white",
        available: "bg-green-500/20 text-green-400 border border-green-500/30",
        occupied: "bg-red-500/20 text-red-400 border border-red-500/30",
        cleaning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
        success: "bg-green-600 text-white",
        warning: "bg-yellow-500 text-black",
        danger: "bg-red-600 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
