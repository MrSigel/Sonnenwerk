import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroContact } from "@/components/sections/HeroContact";
import { Positionierung } from "@/components/sections/Positionierung";
import { Comparison } from "@/components/sections/Comparison";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { WhyGrid } from "@/components/sections/WhyGrid";
import { StatsBand } from "@/components/sections/StatsBand";
import { Faq } from "@/components/sections/Faq";
import { ScrollToForm } from "@/components/ui/ScrollToForm";

/**
 * Single-Page Landingpage — reiche, erzählerische Struktur im Referenz-Prinzip:
 * Hero → Positionierung → Vergleich → CTA-Banner → So funktioniert es →
 * Warum Sonnenwerk → Zahlen-Band → FAQ → Abschluss-CTA → Footer.
 * Alternierende Hintergründe (paper / paper-sunk / accent), ruhige Scroll-Reveals.
 */
export default function HomePage() {
  return (
    <>
      <ScrollToForm />
      <Header />
      <main>
        <HeroContact />
        <Positionierung />
        <Comparison />
        <HowItWorks />
        <WhyGrid />
        <StatsBand />
        <Faq />
        <CtaBanner
          eyebrow="Jetzt starten"
          title="Bereit für Ihre Solar-Angebote?"
          text="Stellen Sie in 60 Sekunden Ihre Anfrage – kostenlos, unverbindlich und mit geprüften Angeboten aus Ihrer Region."
          buttonLabel="Jetzt kostenlos Angebote erhalten"
          tone="sunk"
        />
      </main>
      <Footer />
    </>
  );
}
