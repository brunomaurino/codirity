import { RevealProvider } from "@/components/layout";
import { Hero, Services, Process, Pricing, Contact } from "@/components/sections";

export default function Home() {
  return (
    <RevealProvider>
      <Hero />
      <Services />
      <Process />
      <Pricing />
      <Contact />
    </RevealProvider>
  );
}
