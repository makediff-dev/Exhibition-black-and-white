"use client";

import { notFound, useParams } from "next/navigation";
import { ContractorCheckSection } from "@/components/contractors/contractor-check-section";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";
import { getContractorProfileHref } from "@/lib/utils/contractor-profile-links";

export default function ContractorCheckPage() {
  const params = useParams();
  const id = params.id as string;
  const contractor = SEED_CONTRACTORS.find((entry) => entry.id === id);

  if (!contractor) notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <main className="flex-1 mx-auto max-w-site w-full px-4 py-8">
        <ContractorCheckSection
          contractorId={contractor.id}
          backFallbackHref={getContractorProfileHref(contractor.id)}
        />
      </main>

      <Footer />
    </div>
  );
}