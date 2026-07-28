import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sectionHeaderVariants = cva("", {
  variants: {
    align: {
      left: "text-left",
      center: "text-center mx-auto",
    },
    maxWidth: {
      sm: "max-w-xl",
      md: "max-w-2xl",
      lg: "max-w-3xl",
      full: "",
    },
  },
  defaultVariants: {
    align: "center",
    maxWidth: "md",
  },
});

export interface SectionHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sectionHeaderVariants> {
  /** Small label above the title (mono font, uppercase) */
  label?: string;
  /** Main title text */
  title: string;
  /** Description text below the title */
  description?: string;
  /** Use gradient text for the title */
  gradientTitle?: boolean;
}

const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  (
    {
      className,
      align,
      maxWidth,
      label,
      title,
      description,
      gradientTitle,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(sectionHeaderVariants({ align, maxWidth }), className)}
        {...props}
      >
        {label && (
          <span className="inline-block font-mono text-sm font-medium text-brand uppercase tracking-wider mb-4">
            {label}
          </span>
        )}
        <h2
          className={cn(
            "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white",
            gradientTitle && "gradient-text"
          )}
        >
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    );
  }
);
SectionHeader.displayName = "SectionHeader";

export { SectionHeader, sectionHeaderVariants };
