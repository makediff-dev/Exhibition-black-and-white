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

const VALID_FORMATS: RequestFormat[] = ["open_request", "closed_request", "urgent", "safe_deal"];

function NewRequestContent() {
  const searchParams = useSearchParams();
  const { addRequest } = usePrototypeStore();
  const { showToast } = useToast();
  const [published, setPublished] = useState<Request | null>(null);

  const formatParam = searchParams.get("format") as RequestFormat | null;
  const initialFormat =
    formatParam && VALID_FORMATS.includes(formatParam) ? formatParam : undefined;

  const handlePublished = (request: Request) => {
    addRequest(request);
    setPublished(request);
    showToast("Заявка успешно опубликована", "success");
  };

  if (published) {
    return (
      <Card className="max-w-lg mx-auto text-center py-8">
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
    );
  }

  return (
    <RequestWizard
      initialFormat={initialFormat}
      onPublished={handlePublished}
    />
  );
}

function NewRequestPageInner() {
  const { isAuthenticated, user } = useAuthStore();

  const content = (
    <Suspense fallback={<p className="text-sm text-gray-600">Загрузка...</p>}>
      <NewRequestContent />
    </Suspense>
  );

  if (isAuthenticated && user) {
    return (
      <AppShell
        title="Новая заявка"
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Заявки", href: "/requests" },
          { label: "Создание" },
        ]}
      >
        {content}
      </AppShell>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-8">
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
