"use client";

import { cn } from "@/lib/utils";
import { Sun, CheckCircle, BarChart3 } from "lucide-react";

interface HeroCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  metric: string;
  metricLabel: string;
  showProgress?: boolean;
  className?: string;
  animationDelay?: string;
}

function HeroCard({
  icon,
  title,
  subtitle,
  metric,
  metricLabel,
  showProgress,
  className,
  animationDelay,
}: HeroCardProps) {
  return (
    <div
      className={cn(
        "absolute bg-white dark:bg-gray-800 border border-[var(--border)] rounded-[20px] p-6",
        "shadow-lg transition-all duration-400",
        "hover:-translate-y-2 hover:shadow-xl hover:border-brand/30",
        className
      )}
      style={{ animationDelay }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className={cn(
            "w-11 h-11 rounded-xl",
            "bg-gradient-to-br from-brand-pale to-brand-glow",
            "flex items-center justify-center"
          )}
        >
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">{title}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</div>
        </div>
      </div>
      <div className="font-mono text-4xl font-bold text-brand mb-1">
        {metric}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{metricLabel}</div>
      {showProgress && (
        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-4 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full",
              "bg-gradient-to-r from-brand to-brand-light",
              "animate-progress-fill"
            )}
          />
        </div>
      )}
    </div>
  );
}

export function HeroCards() {
  return (
    <div className="relative h-[480px] opacity-0 animate-fade-in animation-delay-600">
      <HeroCard
        icon={<Sun className="w-[22px] h-[22px] stroke-brand" />}
        title="Cost Reduction"
        subtitle="Smart automation"
        metric="Save"
        metricLabel="Automate repetitive tasks"
        showProgress
        className="top-[5%] left-0 w-[280px] animate-float-card"
      />
      <HeroCard
        icon={<CheckCircle className="w-[22px] h-[22px] stroke-brand" />}
        title="24/7 Automation"
        subtitle="Always running"
        metric="Non-Stop"
        metricLabel="Systems that work while you sleep"
        className="top-[40%] right-0 w-[240px] animate-float-card"
        animationDelay="1s"
      />
      <HeroCard
        icon={<BarChart3 className="w-[22px] h-[22px] stroke-brand" />}
        title="Faster Delivery"
        subtitle="Efficient process"
        metric="Quick"
        metricLabel="From idea to production"
        className="bottom-[5%] left-[10%] w-[260px] animate-float-card"
        animationDelay="0.5s"
      />
    </div>
  );
}
