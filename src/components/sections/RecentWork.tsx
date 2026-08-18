import { Section, Container } from "@/components/layout";
import { SectionHeader } from "@/components/ui";
import { clients, sections } from "@/config/offer";
import { cn } from "@/lib/utils";
import type { BlobClass } from "@/lib/blob";

// "Who's on the board" (D6, HANDOFF-redesign-v3 §5) — Designjoy-style
// badge cards: one blob-gradient tile per client/product, an honest
// client/ours provenance tag, a one-liner adapted from
// docs/redesign-storytelling.md §1b. The honesty discipline carries
// forward from the prior plan: eDairyCorp is tagged "client" plainly,
// Meshio and Vivi are tagged "ours" (never presented as arm's-length
// clients), and Vivi's card always shows "pre-launch" — never omitted.
const CLIENT_BLOBS: BlobClass[] = ["blob-3", "blob-4", "blob-2"];

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

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 list-none">
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
                    {entry.provenance}
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
