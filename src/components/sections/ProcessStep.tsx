import { cn } from "@/lib/utils";

export interface ProcessStepProps {
  number: string;
  title: string;
  description: string;
  /** One of globals.css's .blob-1 .. .blob-4 utility classes — each step
   *  gets its OWN distinct combination (HANDOFF-redesign-v3 §1.3: reusing
   *  one gradient across all three is a defect, not a shortcut). */
  blobClass: string;
  className?: string;
}

export function ProcessStep({
  number,
  title,
  description,
  blobClass,
  className,
}: ProcessStepProps) {
  return (
    <div
      className={cn(
        blobClass,
        "card-soft p-8 md:p-10",
        "min-h-[280px] flex flex-col justify-between",
        "transition-transform duration-400 hover:-translate-y-1",
        className
      )}
    >
      <div className="font-semibold text-2xl opacity-70">{number}</div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-[0.95rem] leading-relaxed opacity-85">
          {description}
        </p>
      </div>
    </div>
  );
}
