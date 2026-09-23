"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { RequestWizard } from "@/components/forms/request-wizard";
import { AppShell } from "@/components/layout/app-shell";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { Request, RequestFormat } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast-provider";
import { canCreateRequest } from "@/lib/auth/authorization";
import { ForbiddenState } from "@/components/ui/states";
import { ROLE_LABELS } from "@/constants/statuses";

const VALID_FORMATS: RequestFormat[] = ["open_request", "closed_request", "urgent", "safe_deal"];

function NewRequestContent() {
  const searchParams = useSearchParams();
  const { addRequest } = usePrototypeStore();
  const { showToast } = useToast();
  const [published, setPublished] = useState<Request | null>(null);
  const [phoneNotifications, setPhoneNotifications] = useState(false);

  const formatParam = searchParams.get("format") as RequestFormat | null;
  const initialFormat =
    formatParam && VALID_FORMATS.includes(formatParam) ? formatParam : undefined;
  const initialEventId = searchParams.get("eventId") ?? undefined;
  const initialContractorId = searchParams.get("contractorId") ?? undefined;
  const serviceId = searchParams.get("serviceId");
  const services = usePrototypeStore((state) => state.services);
  const linkedService = serviceId ? services.find((item) => item.id === serviceId) : undefined;
  const initialCategory =
    linkedService?.category ?? searchParams.get("category") ?? undefined;
  const initialTitle = linkedService ? `Запрос предложения: ${linkedService.title}` : undefined;
  const initialDescription = linkedService?.description;

  const handlePublished = (request: Request) => {
    const permission = canCreateRequest(useAuthStore.getState().user);
    if (!permission.allowed) {
      showToast(permission.reason, "error");
      return;
    }
    addRequest(request);
    setPublished(request);
    showToast("Заявка успешно опубликована", "success");
  };

  if (published) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center py-8">
          <CheckCircle className="h-12 w-12 mx-auto mb-4" />
          <CardTitle>Заявка опубликована</CardTitle>
          <CardDescription className="mt-2">
            Заявка «{published.title}» доступна исполнителям
          </CardDescription>
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            <Link href={`/requests/${published.id}`}>
              <Button>Открыть заявку</Button>
            </Link>
            <Link href="/requests">
              <Button variant="outline">К списку заявок</Button>
            </Link>
          </div>
        </Card>

        <label className="inline-flex items-center gap-2 border border-gray-300 px-3 py-2 text-sm w-fit cursor-pointer rounded-button">
          <input
            type="checkbox"
            checked={phoneNotifications}
            onChange={(e) => {
              setPhoneNotifications(e.target.checked);
              if (e.target.checked) {
                showToast("Уведомления на телефон включены", "success");
              }
            }}
            className="border-gray-300"
          />
          Настроить уведомления на телефон
        </label>

        <p className="text-sm text-gray-700">
          Вы получите информацию об откликах исполнителей в личный кабинет и на почту.
          Вы также можете настроить уведомление об откликах на телефон, указанный при регистрации.
        </p>

        <p className="text-sm text-gray-700">
          После этого вы сможете заказать расширенную проверку исполнителей, выбрать конкретного
          и договориться с ним о цене.
        </p>
      </div>
    );
  }

  return (
    <RequestWizard
      initialFormat={initialFormat}
      initialEventId={initialEventId}
      initialContractorId={initialContractorId}
      initialCategory={initialCategory}
      initialTitle={initialTitle}
      initialDescription={initialDescription}
      onPublished={handlePublished}
    />
  );
}

function NewRequestPageInner() {
  const { isAuthenticated, user } = useAuthStore();
  const createAccess = canCreateRequest(user);

  if (isAuthenticated && user && !createAccess.allowed) {
    return (
      <AppShell title="Новая заявка" showBack backFallbackHref={`/account/${user.role}`}>
        <ForbiddenState
          title="Заявку размещает заказчик"
          description={createAccess.reason}
          actionLabel={`В кабинет: ${ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}`}
          actionHref={`/account/${user.role}`}
        />
      </AppShell>
    );
  }

  const content = (
    <Suspense fallback={<p className="text-sm text-gray-600">Загрузка...</p>}>
      <NewRequestContent />
    </Suspense>
  );

  if (isAuthenticated && user) {
    return (
      <AppShell
        title="Новая заявка"
        showBack
        backFallbackHref="/requests"
      >
        {content}
      </AppShell>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-site w-full px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Создание заявки</h1>
        {content}
      </main>
      <Footer />
    </div>
  );
}

export default function NewRequestPage() {
  return <NewRequestPageInner />;
}