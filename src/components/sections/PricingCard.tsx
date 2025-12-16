import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PricingCardProps {
  name: string;
  price: string;
  priceSubtext?: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  featured?: boolean;
  className?: string;
}

export function PricingCard({
  name,
  price,
  priceSubtext,
  description,
  features,
  ctaText,
  ctaHref,
  featured,
  className,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl p-8 md:p-10",
        "transition-all duration-400",
        featured
          ? [
              "bg-gradient-to-br from-brand-dark to-[#1a5a1d]",
              "text-white border-0",
              "shadow-brand",
            ]
          : [
              "bg-white dark:bg-gray-800 border border-[var(--border)]",
              "hover:-translate-y-2 hover:shadow-xl hover:border-brand/30",
            ],
        className
      )}
    >
      {/* Plan Name */}
      <div
        className={cn(
          "inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6",
          featured
            ? "bg-white/15 text-white"
            : "bg-brand-pale text-brand-dark"
        )}
      >
        {name}
      </div>

      {/* Price */}
      <div className="mb-4">
        <span
          className={cn(
            "font-mono text-5xl md:text-6xl font-bold tracking-tight",
            featured ? "text-white" : "text-gray-900 dark:text-white"
          )}
        >
          {price}
        </span>
        {priceSubtext && (
          <span
            className={cn(
              "text-lg ml-2",
              featured ? "text-white/70" : "text-gray-500 dark:text-gray-400"
            )}
          >
            {priceSubtext}
          </span>
        )}
      </div>

      {/* Description */}
      <p
        className={cn(
          "mb-8 leading-relaxed",
          featured ? "text-white/85" : "text-gray-600 dark:text-gray-400"
        )}
      >
        {description}
      </p>

      {/* Features */}
      <ul className="flex flex-col gap-4 mb-10">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div
              className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5",
                featured ? "bg-white/20" : "bg-brand-pale"
              )}
            >
              <Check
                className={cn(
                  "w-4 h-4",
                  featured ? "text-white" : "text-brand"
                )}
              />
            </div>
            <span
              className={cn(
                "text-[0.95rem]",
                featured ? "text-white/90" : "text-gray-700 dark:text-gray-300"
              )}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <a
        href={ctaHref}
        className={cn(
          "inline-flex items-center justify-center gap-2 w-full",
          "px-8 py-4 text-base font-semibold rounded-full",
          "transition-all duration-300",
          featured
            ? [
                "bg-white text-brand-dark",
                "hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-lg",
              ]
            : [
                "bg-brand text-white",
                "hover:bg-brand-dark hover:-translate-y-0.5 hover:shadow-brand",
              ]
        )}
      >
        {ctaText}
        <ArrowRight className="w-5 h-5" />
      </a>
    </div>
  );
}
