import { cn } from "@/lib/utils";

/**
 * The green-means-live status dot — the single source of truth for the dot
 * grammar shared by every workbench artifact (hero vignette, clients ledger,
 * and whatever board the later bundles add):
 *
 * - `live`      filled green — the thing is shipped / in production
 * - `active`    outlined green — work in motion (in progress, pre-launch)
 * - `inert`     outlined gray — queued / not started
 *
 * Purely presentational (aria-hidden); always pair it with an adjacent text
 * label. Editing these classes changes every artifact at once — by design.
 */
export type StatusDotVariant = "live" | "active" | "inert";

export function StatusDot({ variant }: { variant: StatusDotVariant }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block w-[7px] h-[7px] rounded-full mr-2 align-middle",
        variant === "live" && "bg-brand",
        variant === "active" && "border-[1.5px] border-brand bg-transparent",
        variant === "inert" &&
          "border-[1.5px] border-gray-300 dark:border-gray-600 bg-transparent"
      )}
    />
  );
}
