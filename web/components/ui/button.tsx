import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-dookki-red text-white hover:bg-dookki-red-dark shadow-lg shadow-red-500/20",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-white/20 bg-transparent text-white hover:bg-white/10",
        secondary: "bg-white/10 text-white hover:bg-white/20",
        ghost: "text-white hover:bg-white/10",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/20",
        warning: "bg-yellow-500 text-black hover:bg-yellow-400",
        dark: "bg-black/60 text-white border border-white/10 hover:bg-black/80",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
