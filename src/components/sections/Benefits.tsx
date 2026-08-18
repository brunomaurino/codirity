import {
  CreditCard,
  Infinity as InfinityIcon,
  Zap,
  Rocket,
  PauseCircle,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Section, Container } from "@/components/layout";
import { SectionHeader, AccentWord } from "@/components/ui";
import { cn } from "@/lib/utils";
import { benefits, sections } from "@/config/offer";

// Maps the lucide icon-name strings in offer.benefits to components, so offer.ts
// can stay pure data (no JSX). Any name not listed falls back to Zap.
const ICONS: Record<string, LucideIcon> = {
  CreditCard,
  Infinity: InfinityIcon,
  Zap,
  Rocket,
  PauseCircle,
  TrendingUp,
};

// Only 4 .blob-* utilities exist (HANDOFF-redesign-v3 §1.3, added in V0); 6
// tiles necessarily cycle through them. Cycling by index % 4 (not a fixed
// per-tile assignment) keeps no two vertically-adjacent tiles in the 3-column
// desktop grid sharing a blob: row 1 is blob-1/2/3, row 2 is blob-4/1/2 — every
// column's top/bottom pair differs.
const BLOB_CLASSES = ["blob-1", "blob-2", "blob-3", "blob-4"];

export function Benefits() {
  return (
    <Section id="benefits" variant="default" className="reveal">
      <Container>
        <SectionHeader
          label={sections.benefits.label}
          title={<AccentWord text={sections.benefits.title} word="subscribe" />}
          description={sections.benefits.description}
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = ICONS[benefit.icon] ?? Zap;
            const blobClass = BLOB_CLASSES[index % BLOB_CLASSES.length];
            return (
              <div
                key={benefit.title}
                className={cn(
                  blobClass,
                  "card-soft group reveal",
                  "p-6 md:p-8",
                  "transition-transform duration-400 hover:-translate-y-1"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl mb-5",
                    "bg-black/20 backdrop-blur-sm",
                    "flex items-center justify-center",
                    "transition-transform duration-400",
                    "group-hover:scale-110 group-hover:-rotate-5"
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                <p className="text-[0.95rem] leading-relaxed opacity-85">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
