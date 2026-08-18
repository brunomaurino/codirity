import { Section, Container } from "@/components/layout";
import { SectionHeader } from "@/components/ui";
import { clients, sections } from "@/config/offer";
import { cn } from "@/lib/utils";
import type { BlobClass } from "@/lib/blob";

// "Who's on the board" — Designjoy-style badge cards: one blob-gradient
// tile per entry, a one-liner adapted from docs/redesign-storytelling.md
// §1b. All three entries render a "Client" tag (updated 2026-08-18 per
// Bruno's direction — see the NOTE on `ClientEntry` in offer.ts for the
// superseded client/ours distinction this replaces). `preLaunch` still
// renders when true (Vivi) — that's an independent operational fact, not
// part of the (now-removed) provenance framing.
//
// Starts at blob-3 (found in Phase 4/5 review): Benefits.tsx (the section
// immediately before this one) cycles 6 tiles through all 4 blobs and its
// last row lands on blob-4/blob-1/blob-2 across its 3 columns — an
// earlier version of this array put blob-2 in the matching 3rd column
// here too, stacking the same gradient vertically across the section
// boundary. blob-3/blob-4/blob-1 differs in every column. Uses all 4
// blobs (not just 3), matching Benefits' own "more blobs than visible
// slots" cycling discipline, so a future 4th client entry doesn't land
// directly under the 1st with an identical gradient.
const CLIENT_BLOBS: BlobClass[] = ["blob-3", "blob-4", "blob-1", "blob-2"];

export function RecentWork() {
  return (
    <Section id="work" variant="gray" className="reveal">
      <Container>
        <SectionHeader
          label={sections.recentWork.label}
          title={sections.recentWork.title}
          description={sections.recentWork.description}
          className="mb-16"
        />

        {/* md:grid-cols-2 lg:grid-cols-3 (not md:grid-cols-3 directly,
            found in Phase 4/5 review): these stories run much longer than
            Benefits' tile copy, and 3 equal columns starting at 768px
            squeezed text to an unreadable width in the 768-1023px band —
            matching Benefits.tsx's own established responsive pattern
            instead of Process.tsx's (which has much shorter card copy). */}
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none">
          {clients.map((entry, index) => (
            <li key={entry.name} className="reveal">
              <div
                className={cn(
                  CLIENT_BLOBS[index % CLIENT_BLOBS.length],
                  "card-soft h-full p-8",
                  "flex flex-col justify-between gap-6",
                  "transition-transform duration-400 hover:-translate-y-1"
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold">{entry.name}</h3>
                  <span
                    className={cn(
                      "btn-pill inline-flex items-center",
                      "px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]",
                      "bg-black/20"
                    )}
                  >
                    Client
                  </span>
                  {entry.preLaunch && (
                    <span
                      className={cn(
                        "btn-pill inline-flex items-center",
                        "px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]",
                        "bg-black/20"
                      )}
                    >
                      pre-launch
                    </span>
                  )}
                </div>
                <p className="text-[0.95rem] leading-relaxed">
                  {entry.story}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
