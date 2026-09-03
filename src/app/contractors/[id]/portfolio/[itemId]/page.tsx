"use client";

import { notFound, useParams } from "next/navigation";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { PortfolioDetail } from "@/components/contractors/portfolio-detail";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";

export default function ContractorPortfolioItemPage() {
  const params = useParams();
  const contractorId = params.id as string;
  const itemId = params.itemId as string;

  const contractor = SEED_CONTRACTORS.find((entry) => entry.id === contractorId);
  const item = contractor?.portfolio.find((entry) => entry.id === itemId);

  if (!contractor || !item) notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-site w-full px-4 py-6">
        <PortfolioDetail
          item={item}
          backHref={`/contractors/${contractorId}`}
          editable={false}
        />
      </main>
      <Footer />
    </div>
  );
}