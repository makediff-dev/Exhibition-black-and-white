"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  HelpCircle,
  XCircle,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { usePrototypeStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast-provider";
import { ROLE_LABELS } from "@/constants/statuses";
import type { ModerationStatus, UserRole } from "@/data/types";

const STATUS_OPTIONS: {
  value: ModerationStatus;
  label: string;
  description: string;
  icon: typeof CheckCircle;
}[] = [
  {
    value: "approved",
    label: "Одобрено",
    description: "Компания прошла проверку и может пользоваться сервисом",
    icon: CheckCircle,
  },
  {
    value: "needs_clarification",
    label: "Требуются уточнения",
    description: "Модератор запросил дополнительные документы или информацию",
    icon: HelpCircle,
  },
  {
    value: "rejected",
    label: "Отклонено",
    description: "Заявка не прошла модерацию. Можно исправить и отправить повторно",
    icon: XCircle,
  },
  {
    value: "pending",
    label: "На проверке",
    description: "Заявка находится в очереди модерации",
    icon: Clock,
  },
];

function getClarificationStep(status: ModerationStatus): number {
  if (status === "needs_clarification") return 4;
  if (status === "rejected") return 1;
  return 0;
}

interface RegistrationDraft {
  role?: UserRole;
  companyName?: string;
  contactName?: string;
  email?: string;
  moderationStatus?: ModerationStatus;
  moderationComment?: string;
}

export default function ModerationPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const registrationDraft = usePrototypeStore((s) => s.registrationDraft);
  const setRegistrationDraft = usePrototypeStore((s) => s.setRegistrationDraft);

  const draft = registrationDraft as RegistrationDraft;
  const [status, setStatus] = useState<ModerationStatus>(
    draft.moderationStatus ?? "pending"
  );

  const current = STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[3];
  const StatusIcon = current.icon;

  const handleClarifyData = () => {
    setRegistrationDraft({
      ...registrationDraft,
      step: getClarificationStep(status),
    });
    router.push("/register");
  };

  const handleEditApplication = () => {
    setRegistrationDraft({
      ...registrationDraft,
      step: 0,
    });
    router.push("/register");
  };

  const handleDemoStatus = (next: ModerationStatus) => {
    setStatus(next);
    setRegistrationDraft({
      ...registrationDraft,
      moderationStatus: next,
    });
    showToast(`Статус изменён: ${STATUS_OPTIONS.find((s) => s.value === next)?.label}`, "info");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-site w-full px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Статус модерации</h1>
        <p className="text-sm text-gray-600 mb-6">
          Отслеживайте проверку данных вашей компании
        </p>

        <Card className="mb-6">
          <div className="flex items-start gap-4">
            <StatusIcon className="h-8 w-8 shrink-0 text-gray-900" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle>{current.label}</CardTitle>
                <Badge variant={status === "approved" ? "solid" : "outline"}>
                  {current.label}
                </Badge>
              </div>
              <CardDescription>{current.description}</CardDescription>
              {(draft.companyName || draft.role) && (
                <dl className="mt-4 space-y-1 text-sm">
                  {draft.companyName && (
                    <div className="flex gap-2">
                      <dt className="text-gray-500">Компания:</dt>
                      <dd>{draft.companyName}</dd>
                    </div>
                  )}
                  {draft.role && (
                    <div className="flex gap-2">
                      <dt className="text-gray-500">Роль:</dt>
                      <dd>{ROLE_LABELS[draft.role as keyof typeof ROLE_LABELS]}</dd>
                    </div>
                  )}
                  {draft.contactName && (
                    <div className="flex gap-2">
                      <dt className="text-gray-500">Контакт:</dt>
                      <dd>{draft.contactName}</dd>
                    </div>
                  )}
                  {draft.email && (
                    <div className="flex gap-2">
                      <dt className="text-gray-500">Email:</dt>
                      <dd>{draft.email}</dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
          </div>
        </Card>

        {status === "needs_clarification" && (
          <div className="border border-gray-900 bg-gray-50 p-4 mb-6 flex gap-3 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium mb-1">Запрос модератора</p>
              <p className="text-gray-600">
                Пожалуйста, загрузите выписку из ЕГРЮЛ и уточните категории услуг.
                После исправления отправьте заявку повторно.
              </p>
            </div>
          </div>
        )}

        {status === "rejected" && (
          <div className="border border-gray-900 p-4 mb-6 text-sm">
            <p className="font-medium mb-1">Причина отклонения</p>
            <p className="text-gray-600">
              Данные компании не совпадают с реестром. Проверьте ИНН и повторите регистрацию.
            </p>
          </div>
        )}

        {status === "approved" && (
          <div className="mb-6">
            <Link href={`/account/${draft.role ?? "customer"}`}>
              <Button className="w-full">Перейти в личный кабинет</Button>
            </Link>
          </div>
        )}

        {(status === "needs_clarification" || status === "rejected") && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Button onClick={handleClarifyData}>Уточнить данные</Button>
            <Button variant="outline" onClick={handleEditApplication}>
              Редактировать заявку
            </Button>
          </div>
        )}

        <div className="border-t border-gray-200 pt-6">
          <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Демо: переключить статус
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant={status === opt.value ? "primary" : "outline"}
                size="sm"
                onClick={() => handleDemoStatus(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
