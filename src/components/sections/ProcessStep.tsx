import { cn } from "@/lib/utils";

export interface ProcessStepProps {
  number: string;
  title: string;
  description: string;
  className?: string;
}

export function ProcessStep({
  number,
  title,
  description,
  className,
}: ProcessStepProps) {
  return (
    <div className={cn("text-center relative z-[1]", className)}>
      <div
        className={cn(
          "w-[100px] h-[100px] mx-auto mb-6",
          "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-full",
          "flex items-center justify-center",
          "font-mono text-2xl font-bold text-gray-400",
          "shadow-sm transition-all duration-400",
          "group-hover:bg-brand group-hover:border-brand group-hover:text-white",
          "group-hover:scale-110 group-hover:shadow-brand"
        )}
      >
        {number}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-[0.95rem] leading-relaxed">
        {description}
      </p>
    </div>
  );
}
