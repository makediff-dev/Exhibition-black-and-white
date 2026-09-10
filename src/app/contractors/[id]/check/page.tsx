"use client";

import { notFound, useParams } from "next/navigation";
import { ContractorCheckSection } from "@/components/contractors/contractor-check-section";
import { CabinetAwareLayout } from "@/components/layout/cabinet-aware-layout";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";
import { useAuthStore } from "@/lib/store";
import { getContractorProfileHref } from "@/lib/utils/contractor-profile-links";

export default function ContractorCheckPage() {
  const params = useParams();
  const id = params.id as string;
  const role = useAuthStore((state) => state.user?.role);
  const contractor = SEED_CONTRACTORS.find((entry) => entry.id === id);

  if (!contractor) notFound();

  return (
    <CabinetAwareLayout>
      <ContractorCheckSection
        contractorId={contractor.id}
        backFallbackHref={getContractorProfileHref(contractor.id, { role, from: "checks" })}
        accountRole={role}
      />
    </CabinetAwareLayout>
  );
}
