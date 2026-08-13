"use client";

import Link from "next/link";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ContractorCheckSubscribeSection } from "@/components/contractors/contractor-check-subscribe-section";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";
import { useAuthStore } from "@/lib/store";
import {
  getContractorProfileHref,
} from "@/lib/utils/contractor-profile-links";

function ExtendedCheckSubscribeContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const requestId = searchParams.get("requestId");
  const responseId = searchParams.get("responseId");
  const fromResponses = searchParams.get("from") === "responses";

  const contractor = SEED_CONTRACTORS.find((entry) => entry.id === id);
  if (!contractor) notFound();

  const backFallbackHref =
    fromResponses && requestId
      ? getContractorProfileHref(id, {
          from: "responses",
          requestId,
          responseId: responseId ?? undefined,
        })
      : getContractorProfileHref(id);

  return (
    <ContractorCheckSubscribeSection
      contractorId={id}
      backFallbackHref={backFallbackHref}
    />
  );
}

function ExtendedCheckSubscribePageInner() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-site w-full px-4 py-8">
        {!isAuthenticated || !user ? (
          <>
            <p className="text-sm text-gray-600">Войдите в систему для заказа проверки.</p>
            <Link href="/login" className="text-sm underline mt-2 inline-block">
              Войти
            </Link>
          </>
        ) : (
          <ExtendedCheckSubscribeContent />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function ExtendedCheckSubscribePage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-gray-500">Загрузка...</p>}>
      <ExtendedCheckSubscribePageInner />
    </Suspense>
  );
}
