import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DankeContent } from "./DankeContent";

export const metadata: Metadata = {
  title: "Vielen Dank für Ihre Anfrage",
  // /danke ist noindex (§8.1)
  robots: { index: false, follow: false },
};

export default function DankePage() {
  return (
    <>
      <Header />
      <main className="container-page py-16">
        <DankeContent />
      </main>
      <Footer />
    </>
  );
}
