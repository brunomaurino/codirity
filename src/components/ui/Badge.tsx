import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center gap-2",
    "rounded-full",
    "font-medium text-sm",
  ],
  {
    variants: {
      variant: {
        // dark:text-brand (found in Phase 4/5 review, redesign-v3 Bundle
        // V3): text-brand-dark alone resolves to the dark-mode --green-dark
        // (#1caf6b), which measures only 4.27:1 on the composited
        // brand-pale surface in dark mode — under WCAG AA. --green-main
        // (#4fd98c, dark:text-brand) clears 6.70:1 on the same surface and
        // is the value Badge's own light-mode text-brand-dark pairing
        // already establishes as this component's "readable accent on
        // pale" register.
        brand: [
          "bg-brand-pale",
          "text-brand-dark dark:text-brand",
          "border border-brand/20",
        ],
        neutral: [
          "bg-gray-100",
          "text-gray-600",
        ],
        success: [
          "bg-green-50",
          "text-green-700",
          "border border-green-200",
        ],
      },
      size: {
        sm: "px-3 py-1 text-xs",
        md: "px-4 py-1.5 text-sm",
        lg: "px-5 py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "brand",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Show animated pulsing dot */
  withDot?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, withDot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {withDot && (
          <span className="w-2 h-2 bg-brand rounded-full animate-pulse-dot" />
        )}
        {children}
      </span>
    );
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
