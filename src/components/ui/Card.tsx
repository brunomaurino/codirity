import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  [
    "rounded-2xl",
    "transition-all duration-400",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-white",
          "border border-[var(--border)]",
          "hover:shadow-xl hover:border-brand/30 hover:-translate-y-2",
        ],
        featured: [
          // v4 W0: --blob-forest was deleted with the blob system; the gradient's
          // to-stop would silently resolve to TRANSPARENT under white text
          // (Tailwind v4 @property initial-value — Phase 4/5 review). Flat v4
          // deep surface until this component's own bundle reworks it.
          "bg-ground-2",
          "text-white",
          "border-0",
        ],
        accent: [
          "bg-white",
          "border border-[var(--border)]",
          "overflow-hidden",
        ],
        flat: [
          "bg-white",
          "border border-[var(--border)]",
        ],
      },
      padding: {
        none: "",
        sm: "p-4 md:p-6",
        md: "p-6 md:p-8",
        lg: "p-8 md:p-10",
      },
      shadow: {
        none: "",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      shadow: "none",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, shadow, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, shadow, className }))}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardAccentBar = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "h-1 bg-gradient-to-r from-brand-dark via-brand to-brand-light",
      className
    )}
    {...props}
  />
));
CardAccentBar.displayName = "CardAccentBar";

const CardIcon = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-14 h-14",
      "bg-gradient-to-br from-brand-pale to-brand-glow",
      "rounded-2xl",
      "flex items-center justify-center",
      "transition-transform duration-400",
      "group-hover:scale-110 group-hover:-rotate-5",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
CardIcon.displayName = "CardIcon";

const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mb-4", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-medium tracking-tight text-gray-900",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-gray-600 leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mt-6", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardAccentBar,
  CardIcon,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
};
