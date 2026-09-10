"use client";

import Link from "next/link";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ContractorCheckSubscribeSection } from "@/components/contractors/contractor-check-subscribe-section";
import { CabinetAwareLayout } from "@/components/layout/cabinet-aware-layout";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";
import { useAuthStore } from "@/lib/store";
import { getContractorCheckHref, getContractorProfileHref } from "@/lib/utils/contractor-profile-links";

function ExtendedCheckSubscribeContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const role = useAuthStore((state) => state.user?.role);

  const requestId = searchParams.get("requestId");
  const responseId = searchParams.get("responseId");
  const from = searchParams.get("from");
  const fromResponses = from === "responses";

  const contractor = SEED_CONTRACTORS.find((entry) => entry.id === id);
  if (!contractor) notFound();

  const backFallbackHref =
    fromResponses && requestId
      ? getContractorProfileHref(id, {
          role,
          from: "responses",
          requestId,
          responseId: responseId ?? undefined,
        })
      : getContractorCheckHref(id, { role, from: from ?? "checks" });

  return (
    <ContractorCheckSubscribeSection
      contractorId={id}
      backFallbackHref={backFallbackHref}
      accountRole={role}
    />
  );
}

function ExtendedCheckSubscribePageInner() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return (
      <CabinetAwareLayout>
        <p className="text-sm text-gray-600">Войдите в систему для заказа проверки.</p>
        <Link href="/login" className="text-sm underline mt-2 inline-block">
          Войти
        </Link>
      </CabinetAwareLayout>
    );
  }

  return (
    <CabinetAwareLayout>
      <ExtendedCheckSubscribeContent />
    </CabinetAwareLayout>
  );
}

export default function ExtendedCheckSubscribePage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-gray-500">Загрузка...</p>}>
      <ExtendedCheckSubscribePageInner />
    </Suspense>
  );
}
