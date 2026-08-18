import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCardStat {
  value: string;
  label: string;
}

export interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
  featured?: boolean;
  stats?: ServiceCardStat[];
  className?: string;
}

export function ServiceCard({
  icon,
  title,
  description,
  linkText,
  linkHref,
  featured,
  stats,
  className,
}: ServiceCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl p-8 md:p-10",
        "transition-all duration-400",
        featured
          ? [
              "col-span-1 md:col-span-2 row-span-1 md:row-span-2",
              "flex flex-col justify-between",
              "bg-gradient-to-br from-brand-fill-dark to-[var(--blob-forest)]",
              "text-white border-0",
            ]
          : [
              "bg-white dark:bg-gray-800 border border-[var(--border)]",
              "hover:-translate-y-2 hover:shadow-xl hover:border-brand/30",
              "before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px]",
              "before:bg-gradient-to-r before:from-brand before:to-brand-light",
              "before:scale-x-0 before:transition-transform before:duration-400",
              "hover:before:scale-x-100",
            ],
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-[60px] h-[60px] rounded-2xl",
          "flex items-center justify-center mb-6",
          "transition-transform duration-400",
          "group-hover:scale-110 group-hover:-rotate-5",
          featured
            ? "bg-white/15"
            : "bg-gradient-to-br from-brand-pale to-brand-glow"
        )}
      >
        <div className={cn(featured ? "text-white" : "text-brand")}>{icon}</div>
      </div>

      {/* Content */}
      <div>
        <h3
          className={cn(
            "font-medium mb-3 tracking-tight",
            featured
              ? "text-2xl md:text-3xl text-white"
              : "text-xl text-gray-900 dark:text-white"
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "leading-relaxed",
            featured
              ? "text-lg text-white/85 max-w-[420px]"
              : "text-gray-600 dark:text-gray-400"
          )}
        >
          {description}
        </p>
      </div>

      {/* Link */}
      <a
        href={linkHref}
        className={cn(
          "inline-flex items-center gap-2 mt-6",
          "font-medium text-[0.95rem]",
          "transition-[gap] duration-300",
          "hover:gap-3",
          featured ? "text-brand-light" : "text-brand"
        )}
      >
        {linkText}
        <ArrowRight className="w-4 h-4" />
      </a>

      {/* Stats (featured only) */}
      {featured && stats && (
        <div className="mt-auto pt-8">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={cn(
                  "text-center p-5 rounded-2xl",
                  "bg-white/10 border border-white/15"
                )}
              >
                <div className="font-serif text-2xl md:text-3xl font-medium text-brand-light mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
