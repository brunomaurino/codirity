import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium",
    "rounded-full",
    "transition-all duration-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-brand-fill text-white",
          "hover:bg-brand-fill-dark hover:-translate-y-0.5",
          "hover:shadow-brand",
        ],
        secondary: [
          "bg-white text-gray-700",
          "border border-gray-200",
          "hover:border-brand hover:text-brand hover:bg-brand-pale",
        ],
        ghost: [
          "text-brand",
          "hover:bg-brand-pale",
        ],
        dark: [
          "bg-white text-brand-dark",
          "hover:-translate-y-0.5 hover:shadow-lg",
        ],
        // v4: mint on the ground, matching `.close-cta`. §1.2 reserves mint for
        // live/interactive elements, which is exactly what a submit is. The
        // `primary` variant above is the v3 action green and is now unused by
        // the site — kept only until its own consumers are gone.
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
      variant: "primary",
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
