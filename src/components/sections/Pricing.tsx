import { Section, Container } from "@/components/layout";
import { SectionHeader } from "@/components/ui";
import { PricingCard } from "./PricingCard";

const plans = [
  {
    name: "Monthly Club",
    price: "$2,999",
    priceSubtext: "/month",
    description:
      "Perfect for companies that need ongoing development support with predictable costs and flexible scope.",
    features: [
      "One request at a time",
      "Avg. 2 working days delivery",
      "Unlimited tasks",
      "Pause or cancel anytime",
    ],
    ctaText: "Get Started",
    ctaHref: "#contact",
    featured: true,
  },
  {
    name: "Custom",
    price: "Custom",
    description:
      "For larger projects or specific requirements. Let's discuss your needs and build a tailored solution.",
    features: [
      "Dedicated project scope",
      "Custom timeline & milestones",
      "Full project ownership",
      "Ongoing support options",
    ],
    ctaText: "Contact Us",
    ctaHref: "#contact",
  },
];

export function Pricing() {
  return (
    <Section id="pricing" variant="default" className="reveal">
      <Container size="narrow">
        <SectionHeader
          label="Pricing"
          title="Simple, Transparent Pricing"
          description="Choose the plan that works best for your business. No hidden fees, no surprises."
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              name={plan.name}
              price={plan.price}
              priceSubtext={plan.priceSubtext}
              description={plan.description}
              features={plan.features}
              ctaText={plan.ctaText}
              ctaHref={plan.ctaHref}
              featured={plan.featured}
              className="reveal"
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
