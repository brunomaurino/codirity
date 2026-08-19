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
  /** Surface this header sits on.
   *  - `default`: the light/dark page ground — title is `text-gray-900
   *    the dark-variant text pair, which is correct there and ONLY there.
   *  - `ink`: the near-black band (`<Section variant="ink">`, HANDOFF §1
   *    rule 4). Required on that surface: the default title color resolves
   *    to the band's own near-black ground (#0A1712 since W0) —
   *    near-black on near-black, invisible. `ink` pins the title to true
   *    white and the description to a light neutral in BOTH themes, since
   *    the band is permanently dark regardless of site theme. */
  tone?: "default" | "ink";
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
      tone = "default",
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
          <span
            className={cn(
              "inline-block font-sans text-[13px] font-medium uppercase tracking-[0.12em] mb-4",
              // On the ink band the brand green measures under AA against
              // the ink band; brand-light is tuned for that dark ground (re-tuned to
              // #45936F in v4 W0 when the band lightened to #0A1712).
              tone === "ink" ? "text-brand-light" : "text-brand"
            )}
          >
            {label}
          </span>
        )}
        <h2
          className={cn(
            "text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight",
            tone === "ink" ? "text-white" : "text-gray-900"
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-4 text-lg leading-relaxed",
              tone === "ink"
                ? "text-gray-300"
                : "text-gray-600"
            )}
          >
            {description}
          </p>
        )}
      </div>
    );
  }
);
SectionHeader.displayName = "SectionHeader";

export { SectionHeader, sectionHeaderVariants };
