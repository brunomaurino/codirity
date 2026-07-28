import type { CSSProperties } from "react";
import { StatusDot } from "@/components/ui";
import type { StatusDotVariant } from "@/components/ui";
import { workbenchQueue, workbenchPrompt } from "@/config/offer";
import { cn } from "@/lib/utils";

/**
 * The hero's workbench vignette — a terminal/job-board hybrid rendering the
 * queue as the hero image (HANDOFF-redesign §6.R1). Server component, pure
 * CSS/SSR: the typing prompt and blinking caret are keyframe animations defined
 * in globals.css with a prefers-reduced-motion static fallback.
 *
 * Artifact grammar: mono type, hairline border, square corners. Green appears
 * only where §1 rule 2 blesses it — the status dots (filled = shipped,
 * outlined = in progress) and the active prompt line (the ▸ marker and the
 * caret). Nothing decorative is green.
 */

const STATUS: Record<
  "shipped" | "in_progress" | "queued",
  { text: string; dot: StatusDotVariant }
> = {
  shipped: { text: "shipped", dot: "live" },
  in_progress: { text: "in progress", dot: "active" },
  queued: { text: "queued", dot: "inert" },
};

export function HeroWorkbench() {
  // The label narrates whatever the config actually contains, so refreshing
  // workbenchQueue can never leave a screen reader describing stale counts.
  const count = (s: "shipped" | "in_progress" | "queued") =>
    workbenchQueue.filter((item) => item.status === s).length;
  const parts = [
    `${count("shipped")} requests shipped`,
    count("in_progress") > 0 ? `${count("in_progress")} in progress` : null,
    count("queued") > 0 ? `${count("queued")} queued` : null,
  ].filter(Boolean);
  const ariaLabel = `A typical delivery board: ${parts.join(", ")}, and an open slot for your request.`;

  // Width and step count are derived from the prompt string so a copy edit in
  // offer.ts can never desynchronize the typing animation.
  const promptStyle = {
    "--wb-w": `${workbenchPrompt.length}ch`,
    animationTimingFunction: `steps(${workbenchPrompt.length}, end)`,
  } as CSSProperties;

  return (
    <div
      className={cn(
        "hairline bg-white dark:bg-gray-900",
        "font-mono text-[13px]",
        "opacity-0 animate-slide-up animation-delay-500"
      )}
      role="img"
      aria-label={ariaLabel}
    >
      {workbenchQueue.map((item, i) => (
        <div
          key={item.id}
          className={cn(
            "flex items-baseline gap-3 px-4 py-3",
            "border-b border-[var(--border)]",
            // Reduced height on mobile: the vignette stacks under the copy, so
            // only the first three rows show below md (spec: §6.R1).
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
            <StatusDot variant={STATUS[item.status].dot} />
            {STATUS[item.status].text}
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
        {/* The caret is a SIBLING of the clipped typing span, not inside it —
            inside, it would sit past the clip box and never be visible. Both
            share one wrapper so the row's flex gap can't separate them: as the
            span's width animates, the caret rides tight on the typing edge. */}
        <span className="min-w-0 whitespace-nowrap">
          <span
            className="wb-typing text-gray-800 dark:text-gray-200"
            style={promptStyle}
          >
            {workbenchPrompt}
          </span>
          <span aria-hidden="true" className="wb-caret" />
        </span>
      </div>
    </div>
  );
}
