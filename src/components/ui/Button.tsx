import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium",
    "rounded-full",
    // transform-only transition, and the press is INSTANT (duration-0) —
    // pointer-down must respond on the same frame; only the release eases.
    "transition-transform duration-300",
    "active:translate-y-0 active:scale-[0.97] active:duration-0",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        // The only variant. v4 has one action colour on the dark ground, and
        // it reads the same `--mint`/`--ground` tokens as `.close-cta` rather
        // than hardcoding them. The v3 primary/secondary/ghost/dark variants
        // were deleted with their last call site (Phase 4/5 review).
        mint: [
          "bg-mint text-ground",
          "hover:-translate-y-0.5",
        ],
      },
      size: {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-base",
        icon: "p-3",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "mint",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
