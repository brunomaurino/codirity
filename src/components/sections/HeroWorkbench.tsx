import { workbenchQueue } from "@/config/offer";
import { cn } from "@/lib/utils";

/**
 * The hero's workbench vignette — a terminal/job-board hybrid rendering the
 * queue as the hero image (HANDOFF-redesign §6.R1). Server component, pure
 * CSS/SSR: the typing prompt and blinking caret are keyframe animations defined
 * in globals.css with a prefers-reduced-motion static fallback.
 *
 * Artifact grammar: mono type, hairline border, square corners. The only green
 * in the panel is the status dot on shipped rows — green means live.
 */

function StatusDot({ status }: { status: "shipped" | "in_progress" | "queued" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block w-[7px] h-[7px] rounded-full mr-2 align-middle",
        status === "shipped" && "bg-brand",
        status === "in_progress" &&
          "border-[1.5px] border-brand bg-transparent",
        status === "queued" &&
          "border-[1.5px] border-gray-300 dark:border-gray-600 bg-transparent"
      )}
    />
  );
}

const STATUS_TEXT: Record<"shipped" | "in_progress" | "queued", string> = {
  shipped: "shipped",
  in_progress: "in progress",
  queued: "queued",
};

export function HeroWorkbench() {
  return (
    <div
      className={cn(
        "hairline bg-white dark:bg-gray-900",
        "font-mono text-[13px]",
        "opacity-0 animate-slide-up animation-delay-500"
      )}
      role="img"
      aria-label="A typical delivery board: four requests shipped in one to four days, one in progress, and an open slot for your request."
    >
      {workbenchQueue.map((item, i) => (
        <div
          key={item.id}
          className={cn(
            "flex items-baseline gap-3 px-4 py-3",
            "border-b border-[var(--border)]",
            // Reduced height on mobile: the vignette stacks under the copy, so
            // rows 4-5 only appear from md up (spec: §6.R1 mobile behavior).
            i >= 3 && "hidden md:flex"
          )}
        >
          <span className="text-gray-400 dark:text-gray-500 min-w-[42px]">
            {item.id}
          </span>
          <span className="flex-1 min-w-0 truncate text-gray-800 dark:text-gray-200">
            {item.label}
          </span>
          <span className="whitespace-nowrap text-gray-500 dark:text-gray-400">
            <StatusDot status={item.status} />
            {STATUS_TEXT[item.status]}
            {item.status === "shipped" && item.days !== undefined && (
              <span> · {item.days}d</span>
            )}
          </span>
        </div>
      ))}
      <div className="flex items-baseline gap-3 px-4 py-3">
        <span aria-hidden="true" className="text-brand">
          ▸
        </span>
        <span className="wb-typing wb-caret text-gray-800 dark:text-gray-200">
          your request here
        </span>
      </div>
    </div>
  );
}
