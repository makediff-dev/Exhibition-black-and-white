"use client";

import Link from "next/link";
import { useMemo } from "react";
import { MessageSquare } from "lucide-react";
import { SharedPageShell } from "@/components/layout/shared-page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { usePrototypeStore } from "@/lib/store";
import { formatShortDate } from "@/lib/utils/formatters";

const RELATED_TYPE_LABELS: Record<string, string> = {
  deal: "Сделка",
  request: "Заявка",
  support: "Поддержка",
};

export default function MessagesPage() {
  const { messages } = usePrototypeStore();

  const sortedThreads = useMemo(
    () => [...messages].sort((a, b) => b.lastDate.localeCompare(a.lastDate)),
    [messages]
  );

  return (
    <SharedPageShell
      title="Сообщения"
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Сообщения" },
      ]}
    >
      {sortedThreads.length === 0 ? (
        <EmptyState
          title="Нет переписок"
          description="Сообщения появятся при работе со сделками и заявками"
        />
      ) : (
        <div className="space-y-2">
          {sortedThreads.map((thread) => (
            <Card key={thread.id} className="hover:border-gray-900">
              <Link href={`/messages/${thread.id}`} className="block">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant="outline">
                        {RELATED_TYPE_LABELS[thread.relatedType] || thread.relatedType}
                      </Badge>
                      {thread.unread > 0 && (
                        <Badge variant="solid">{thread.unread} новых</Badge>
                      )}
                    </div>
                    <CardTitle className="truncate">{thread.title}</CardTitle>
                    <CardDescription className="truncate mt-1">
                      {thread.lastMessage}
                    </CardDescription>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {formatShortDate(thread.lastDate)}
                    </p>
                  </div>
                </div>
              </Link>

              {thread.relatedLink && thread.relatedType !== "support" && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <Link
                    href={thread.relatedLink}
                    className="text-xs underline text-gray-600 hover:text-gray-900"
                  >
                    {thread.relatedType === "deal" ? "Открыть сделку" : "Открыть заявку"} →
                  </Link>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </SharedPageShell>
  );
}
