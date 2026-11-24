import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { PublicHeader } from "@/components/layout/public-header";
import { HowItWorksFigmaPage } from "@/components/how-it-works/how-it-works-figma-page";

export const metadata: Metadata = {
  title: "Как работает сервис",
  description:
    "Как устроен маркетплейс выставочной индустрии для заказчиков, исполнителей, организаторов и площадок: правила сделки, документы и связь с менеджером.",
};

export default function HowItWorksRoute() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main>
        <HowItWorksFigmaPage />
      </main>
      <Footer />
    </div>
  );
}
