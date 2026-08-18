import { cn } from "@/lib/utils";
import type { BlobClass } from "@/lib/blob";

export interface ProcessStepProps {
  number: string;
  title: string;
  description: string;
  /** One of globals.css's .blob-1 .. .blob-4 utility classes — each step
   *  gets its OWN distinct combination (HANDOFF-redesign-v3 §1.3: reusing
   *  one gradient across all three is a defect, not a shortcut). */
  blobClass: BlobClass;
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
        // h-full (found in Phase 4/5 review): the grid child wrapper
        // stretches to row height, but this card only had min-h-[280px],
        // so cards could render at unequal heights once real copy pushed
        // one taller than the others — a visibly ragged row.
        "h-full min-h-[280px] flex flex-col justify-between",
        "transition-transform duration-400 hover:-translate-y-1",
        className
      )}
    >
      {/* Full-opacity (not opacity-70/opacity-85, found in Phase 4/5
          review): the blob utilities' scrim is tuned for full-opacity
          white text against every hotspot; reduced-alpha text dropped
          below WCAG AA at the blob's brightest points. */}
      <div className="font-semibold text-2xl">{number}</div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-[0.95rem] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
