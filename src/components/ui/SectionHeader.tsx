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
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof sectionHeaderVariants> {
  /** Small label above the title (mono font, uppercase) */
  label?: string;
  /** Main title text — usually a plain string, but accepts ReactNode so a
   *  caller can wrap one word in the `.accent` treatment (see AccentWord)
   *  without SectionHeader needing to know about that convention itself. */
  title: React.ReactNode;
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
          <span className="inline-block font-sans text-[13px] font-semibold text-brand uppercase tracking-[0.12em] mb-4">
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
