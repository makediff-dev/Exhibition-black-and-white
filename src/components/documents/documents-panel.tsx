"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Archive,
  Download,
  Eye,
  FileText,
  PenLine,
  RefreshCw,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast-provider";
import type { Document } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { formatDate } from "@/lib/utils/formatters";

const DOC_TABS = [
  { id: "all", label: "Все" },
  { id: "incoming", label: "Входящие" },
  { id: "outgoing", label: "Исходящие" },
  { id: "archive", label: "Архив" },
];

const DOC_STATUS_LABELS: Record<Document["status"], string> = {
  draft: "Черновик",
  sent: "Ожидает подписи",
  signed: "Подписан",
  archived: "Архив",
};

function getDocCategory(type: string): string {
  if (type === "Договор") return "contract";
  if (type === "Счёт") return "invoice";
  if (type === "Акт" || type === "УПД") return "act";
  return "other";
}

function getCategoryLabel(type: string): string {
  const cat = getDocCategory(type);
  if (cat === "contract") return "Договор";
  if (cat === "invoice") return "Счёт";
  if (cat === "act") return "Акт / УПД";
  return type;
}

function getDirection(doc: Document): "incoming" | "outgoing" {
  if (doc.direction) return doc.direction;
  return doc.type === "Договор" ? "incoming" : "outgoing";
}

export function DocumentsPanel({ defaultTab = "all" }: { defaultTab?: string }) {
  const { user } = useAuthStore();
  const { documents, deals } = usePrototypeStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [viewDoc, setViewDoc] = useState<Document | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Document["status"]>>({});

  const role = user?.role || "customer";
  const edoConnected = user?.edoStatus === "connected";

  const getStatus = (doc: Document) => statusOverrides[doc.id] ?? doc.status;

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const status = statusOverrides[doc.id] ?? doc.status;
      if (activeTab === "incoming") return getDirection(doc) === "incoming" && status !== "archived";
      if (activeTab === "outgoing") return getDirection(doc) === "outgoing" && status !== "archived";
      if (activeTab === "archive") return status === "archived";
      return true;
    });
  }, [documents, activeTab, statusOverrides]);

  const dealMap = useMemo(
    () => Object.fromEntries(deals.map((d) => [d.id, d])),
    [deals]
  );

  const handleDownload = (doc: Document) => {
    showToast(`Скачивание ${doc.number}.pdf (демо)`, "info");
  };

  const handleSendEdo = (doc: Document) => {
    if (!edoConnected) {
      showToast("Подключите ЭДО для отправки документов", "error");
      return;
    }
    setStatusOverrides((prev) => ({ ...prev, [doc.id]: "sent" }));
    showToast(`Документ ${doc.number} отправлен через ЭДО`, "success");
  };

  const handleSign = (doc: Document) => {
    if (!edoConnected) {
      showToast("Подключите ЭДО для подписания", "error");
      return;
    }
    setStatusOverrides((prev) => ({ ...prev, [doc.id]: "signed" }));
    showToast(`Документ ${doc.number} подписан`, "success");
  };

  const handleRequestAgain = (doc: Document) => {
    setStatusOverrides((prev) => ({ ...prev, [doc.id]: "draft" }));
    showToast(`Запрос на повторную выдачу ${doc.number} отправлен`, "success");
  };

  return (
    <>
      {!edoConnected && user && (
        <div className="border border-gray-900 bg-gray-50 p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">ЭДО не подключён</p>
            <p className="text-sm text-gray-600 mt-1">
              Для подписания и обмена документами подключите электронный документооборот.
            </p>
          </div>
          <Link href={`/account/${role}/edo`}>
            <Button size="sm">Подключить ЭДО</Button>
          </Link>
        </div>
      )}

      <Tabs tabs={DOC_TABS} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      <div className="flex flex-wrap gap-2 mb-4 text-xs text-gray-600">
        <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> Договоры</span>
        <span>·</span>
        <span>Счета</span>
        <span>·</span>
        <span>Акты / УПД</span>
        <span>·</span>
        <span className="flex items-center gap-1"><Archive className="h-3 w-3" /> Архив</span>
      </div>

      {filteredDocs.length === 0 ? (
        <EmptyState
          title="Документы не найдены"
          description={
            activeTab === "incoming"
              ? "Нет входящих документов, ожидающих ваших действий"
              : activeTab === "outgoing"
                ? "Нет исходящих документов"
                : activeTab === "archive"
                  ? "Архив пуст"
                  : "Документы появятся после заключения сделок"
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredDocs.map((doc) => {
            const status = getStatus(doc);
            const deal = dealMap[doc.dealId];

            return (
              <Card key={doc.id}>
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="outline">{getCategoryLabel(doc.type)}</Badge>
                      <Badge variant="dashed">
                        {getDirection(doc) === "incoming" ? "Входящий" : "Исходящий"}
                      </Badge>
                      <Badge
                        variant={status === "sent" ? "solid" : "outline"}
                        className={status === "archived" ? "opacity-70" : undefined}
                      >
                        {DOC_STATUS_LABELS[status]}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold">{doc.number}</p>
                    <div className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                      <p>
                        <span className="text-gray-900 font-medium">Дата:</span>{" "}
                        {formatDate(doc.date)}
                      </p>
                      <p>
                        <span className="text-gray-900 font-medium">Стороны:</span>{" "}
                        {doc.parties}
                      </p>
                      {deal && (
                        <p className="sm:col-span-2">
                          <span className="text-gray-900 font-medium">Сделка:</span>{" "}
                          <Link
                            href={`/deals/${deal.id}`}
                            className="underline hover:text-gray-900"
                          >
                            {deal.number} — {deal.title}
                          </Link>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => setViewDoc(doc)}>
                      <Eye className="h-3.5 w-3.5" />
                      Просмотр
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)}>
                      <Download className="h-3.5 w-3.5" />
                      Скачать
                    </Button>
                    {(status === "draft" || status === "signed") && (
                      <Button variant="ghost" size="sm" onClick={() => handleSendEdo(doc)}>
                        <Send className="h-3.5 w-3.5" />
                        Отправить ЭДО
                      </Button>
                    )}
                    {status === "sent" && (
                      <Button size="sm" onClick={() => handleSign(doc)}>
                        <PenLine className="h-3.5 w-3.5" />
                        Подписать
                      </Button>
                    )}
                    {(status === "archived" || status === "signed") && (
                      <Button variant="ghost" size="sm" onClick={() => handleRequestAgain(doc)}>
                        <RefreshCw className="h-3.5 w-3.5" />
                        Запросить повторно
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={!!viewDoc}
        onClose={() => setViewDoc(null)}
        title={viewDoc ? `${viewDoc.type} ${viewDoc.number}` : ""}
        footer={
          viewDoc && (
            <>
              <Button variant="outline" onClick={() => setViewDoc(null)}>Закрыть</Button>
              <Button onClick={() => viewDoc && handleDownload(viewDoc)}>Скачать PDF</Button>
            </>
          )
        }
      >
        {viewDoc && (
          <div className="space-y-3 text-sm">
            <p><strong>Тип:</strong> {getCategoryLabel(viewDoc.type)}</p>
            <p><strong>Номер:</strong> {viewDoc.number}</p>
            <p><strong>Направление:</strong> {getDirection(viewDoc) === "incoming" ? "Входящий" : "Исходящий"}</p>
            <p><strong>Дата:</strong> {formatDate(viewDoc.date)}</p>
            <p><strong>Стороны:</strong> {viewDoc.parties}</p>
            <p><strong>Статус:</strong> {DOC_STATUS_LABELS[getStatus(viewDoc)]}</p>
            {dealMap[viewDoc.dealId] && (
              <p>
                <strong>Сделка:</strong> {dealMap[viewDoc.dealId].number} —{" "}
                {dealMap[viewDoc.dealId].title}
              </p>
            )}
            <div className="border border-dashed border-gray-300 p-6 mt-4 text-center text-gray-500">
              Предпросмотр документа (демо)
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
