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
import { SectionHeader, Card, CardIcon } from "@/components/ui";
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

export function Benefits() {
  return (
    <Section id="benefits" variant="default" className="reveal">
      <Container>
        <SectionHeader
          label={sections.benefits.label}
          title={sections.benefits.title}
          description={sections.benefits.description}
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit) => {
            const Icon = ICONS[benefit.icon] ?? Zap;
            return (
              <Card key={benefit.title} padding="lg" className="group reveal">
                <CardIcon className="mb-5 text-brand">
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </CardIcon>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-[0.95rem] leading-relaxed">
                  {benefit.description}
                </p>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
