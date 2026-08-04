"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/states";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";

interface CheckReport {
  status: "ok" | "warning" | "risk";
  summary: string;
  checks: { label: string; result: string; ok: boolean }[];
  updatedAt: string;
}

function buildMockReport(name: string, verified: boolean): CheckReport {
  return {
    status: verified ? "ok" : "warning",
    summary: verified
      ? `${name} — контрагент прошёл базовую проверку без критических замечаний.`
      : `${name} — обнаружены факторы, требующие дополнительной проверки.`,
    checks: [
      { label: "Регистрация в ЕГРЮЛ", result: "Действующая", ok: true },
      { label: "Блокировка счетов", result: "Не обнаружено", ok: true },
      { label: "Арбитражные дела", result: verified ? "0 дел за 12 мес." : "2 дела за 12 мес.", ok: verified },
      { label: "Задолженность по налогам", result: "Не выявлена", ok: true },
      { label: "Массовый адрес", result: verified ? "Нет" : "Возможен", ok: verified },
      { label: "Верификация на платформе", result: verified ? "Подтверждена" : "Не подтверждена", ok: verified },
    ],
    updatedAt: new Date().toLocaleString("ru-RU"),
  };
}

export default function ContractorCheckPage() {
  const params = useParams();
  const id = params.id as string;
  const contractor = SEED_CONTRACTORS.find((c) => c.id === id);

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<CheckReport | null>(null);

  useEffect(() => {
    if (!contractor) return;
    const timer = setTimeout(() => {
      setReport(buildMockReport(contractor.name, contractor.verified));
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [contractor]);

  if (!contractor) notFound();

  const statusLabel = {
    ok: "Надёжный",
    warning: "Требует внимания",
    risk: "Повышенный риск",
  };

  const statusVariant = {
    ok: "solid" as const,
    warning: "dashed" as const,
    risk: "outline" as const,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-8">
        <BackButton
          fallbackHref={`/contractors/${contractor.id}`}
          className="mb-4"
        />

        <h1 className="text-2xl font-bold mb-2">Проверка контрагента</h1>
        <p className="text-sm text-gray-600 mb-8">
          Демо-отчёт на основе открытых данных и статуса на платформе
        </p>

        {loading ? (
          <LoadingState message="Формируем отчёт о контрагенте..." />
        ) : report ? (
          <div className="space-y-6">
            <div className="border border-gray-900 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={statusVariant[report.status]}>{statusLabel[report.status]}</Badge>
                <span className="text-xs text-gray-600">Обновлено: {report.updatedAt}</span>
              </div>
              <p className="text-sm text-gray-800">{report.summary}</p>
            </div>

            <section>
              <h2 className="text-base font-semibold mb-3">Результаты проверки</h2>
              <div className="border border-gray-300 divide-y divide-gray-200">
                {report.checks.map((check) => (
                  <div key={check.label} className="flex justify-between items-center px-4 py-3 text-sm">
                    <span className="text-gray-700">{check.label}</span>
                    <span className={check.ok ? "text-gray-900 font-medium" : "text-gray-600"}>
                      {check.ok ? "✓" : "!"} {check.result}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <p className="text-xs text-gray-500 border border-dashed border-gray-300 p-3">
              Отчёт носит демонстрационный характер и не является юридическим заключением.
            </p>

            <div className="flex gap-2">
              <Link href={`/requests/new?contractorId=${contractor.id}`}>
                <Button>Пригласить в заявку</Button>
              </Link>
              <Link href={`/contractors/${contractor.id}`}>
                <Button variant="outline">К профилю</Button>
              </Link>
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
