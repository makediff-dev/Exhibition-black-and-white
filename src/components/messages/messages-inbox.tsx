"use client";

import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import { MessageThreadPanel } from "@/components/messages/message-thread-panel";
import styles from "@/components/messages/messages.module.css";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import { SEED_EVENTS } from "@/data/mocks/seed";
import type { Deal, MessageCategory, MessageThread, Request } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { useCabinetSession } from "@/lib/hooks/use-cabinet-session";
import { formatPrice, formatShortDate } from "@/lib/utils/formatters";
import {
  resolveMessageRelatedHref,
  withFromMessages,
} from "@/lib/utils/message-related-links";
import { getThreadInboxCategory, isThreadForUser } from "@/lib/utils/cabinet-scope";
import { cn } from "@/lib/utils/cn";

const RELATED_TYPE_LABELS: Record<string, string> = {
  deal: "Сделка",
  request: "Заявка",
  support: "Поддержка",
  booking: "Бронирование",
  event: "Мероприятие",
};

const MESSAGE_TABS: { id: MessageCategory | "all"; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "system", label: "Системные" },
  { id: "customer", label: "Заказчики" },
  { id: "contractor", label: "Исполнители" },
  { id: "venue", label: "Площадки" },
  { id: "organizer", label: "Организаторы" },
];

const CUSTOMER_NAME = "ООО «Вымышленная Мебель»";

function getRequestCost(request: Request) {
  if (request.budget.type === "range" && request.budget.min && request.budget.max) {
    return `${formatPrice(request.budget.min)} – ${formatPrice(request.budget.max)}`;
  }
  if (request.budget.min) return formatPrice(request.budget.min);
  if (request.budget.type === "hidden") return "Скрыта";
  return "По запросу";
}

function getThreadDetails(
  thread: MessageThread,
  deals: Deal[],
  requests: Request[]
) {
  if (thread.relatedType === "deal") {
    const deal = deals.find((item) => item.id === thread.relatedId);
    if (!deal) return null;

    const request = deal.requestId ? requests.find((item) => item.id === deal.requestId) : undefined;
    const event = request?.eventId
      ? SEED_EVENTS.find((item) => item.id === request.eventId)
      : undefined;

    return {
      customer: deal.customerName,
      event: event?.title ?? "—",
      venue: event?.venue ?? request?.city ?? "—",
      cost: formatPrice(deal.totalPrice),
    };
  }

  if (thread.relatedType === "request") {
    const request = requests.find((item) => item.id === thread.relatedId);
    if (!request) return null;

    const event = request.eventId
      ? SEED_EVENTS.find((item) => item.id === request.eventId)
      : undefined;

    return {
      customer: CUSTOMER_NAME,
      event: event?.title ?? "—",
      venue: event?.venue ?? request.city,
      cost: getRequestCost(request),
    };
  }

  if (thread.relatedType === "event") {
    const event = SEED_EVENTS.find((item) => item.id === thread.relatedId);
    return {
      customer: "—",
      event: event?.title ?? thread.title,
      venue: event?.venue ?? "—",
      cost: "—",
    };
  }

  if (thread.relatedType === "booking") {
    const event = SEED_EVENTS.find((item) => item.id === "evt-1");
    return {
      customer: "—",
      event: event?.title ?? "—",
      venue: event?.venue ?? "—",
      cost: "—",
    };
  }

  return null;
}

function getRelatedLinkLabel(thread: MessageThread) {
  if (thread.relatedType === "deal") return "Открыть сделку →";
  if (thread.relatedType === "request") return "Открыть заявку →";
  if (thread.relatedType === "booking") return "Открыть бронирование →";
  if (thread.relatedType === "event") return "Открыть мероприятие →";
  return "Открыть →";
}

function useFillToViewportBottom<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateHeight = () => {
      const top = element.getBoundingClientRect().top;
      const viewport = window.visualViewport;
      const viewportBottom = viewport
        ? viewport.height + viewport.offsetTop
        : window.innerHeight;
      const bottomGap = 16;
      element.style.height = `${Math.max(280, Math.floor(viewportBottom - top - bottomGap))}px`;
    };

    updateHeight();
    const frame = window.requestAnimationFrame(updateHeight);
    const observer = new ResizeObserver(updateHeight);
    if (element.parentElement) observer.observe(element.parentElement);

    window.addEventListener("resize", updateHeight);
    window.visualViewport?.addEventListener("resize", updateHeight);
    window.visualViewport?.addEventListener("scroll", updateHeight);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
      window.visualViewport?.removeEventListener("resize", updateHeight);
      window.visualViewport?.removeEventListener("scroll", updateHeight);
    };
  }, []);

  return ref;
}

interface MessagesInboxProps {
  selectedThreadId?: string;
}

export function MessagesInbox({ selectedThreadId }: MessagesInboxProps) {
  const pageRef = useFillToViewportBottom<HTMLDivElement>();
  const { accountRole } = useCabinetSession();
  const user = useAuthStore((state) => state.user);
  const { messages, deals, requests, addMessage } = usePrototypeStore();
  const [activeCategory, setActiveCategory] = useState<MessageCategory | "all">("all");
  const [text, setText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);

  const sortedThreads = useMemo(
    () => [...messages].sort((a, b) => b.lastDate.localeCompare(a.lastDate)),
    [messages]
  );

  const scopedThreads = useMemo(
    () => sortedThreads.filter((thread) => isThreadForUser(thread, accountRole ?? user?.role)),
    [sortedThreads, accountRole, user?.role]
  );

  const currentRole = accountRole ?? user?.role;

  const filteredThreads = useMemo(() => {
    if (activeCategory === "all") return scopedThreads;
    return scopedThreads.filter(
      (thread) => getThreadInboxCategory(thread, currentRole) === activeCategory
    );
  }, [activeCategory, scopedThreads, currentRole]);

  const visibleTabs = useMemo(
    () =>
      MESSAGE_TABS.filter(
        (tab) =>
          tab.id === "all" ||
          scopedThreads.some((thread) => getThreadInboxCategory(thread, currentRole) === tab.id)
      ),
    [scopedThreads, currentRole]
  );

  const selectedThread = useMemo(
    () => (selectedThreadId ? messages.find((thread) => thread.id === selectedThreadId) : undefined),
    [messages, selectedThreadId],
  );

  const senderName = user?.name || "Гость";

  const handleSend = () => {
    if (!text.trim() && attachedFiles.length === 0) return;
    if (!selectedThread) return;

    addMessage(selectedThread.id, {
      id: `m-${Date.now()}`,
      sender: senderName,
      text: text.trim() || "(файл без текста)",
      date: new Date().toISOString().split("T")[0],
      files: attachedFiles,
    });

    setText("");
    setAttachedFiles([]);
  };

  return (
    <div ref={pageRef} className={styles.page}>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Сообщения</h1>
      <Tabs
        tabs={visibleTabs}
        activeTab={activeCategory}
        onChange={(id) => setActiveCategory(id as MessageCategory | "all")}
        className={styles.tabs}
      />
      <div
        className={cn(
          styles.inbox,
          selectedThreadId ? styles.inboxChatOpen : styles.inboxListOnly,
        )}
      >
        <div className={styles.listColumn}>
          {filteredThreads.length === 0 ? (
            <EmptyState
              title="Нет переписок в этой категории"
              description="Выберите другую категорию или дождитесь новых сообщений"
            />
          ) : (
            <div className={styles.threadList}>
              {filteredThreads.map((thread) => {
                const details = getThreadDetails(thread, deals, requests);
                const isActive = thread.id === selectedThreadId;

                return (
                  <Card
                    key={thread.id}
                    hoverable
                    className={cn(styles.threadCard, isActive && styles.threadCardActive)}
                  >
                    <Link href={`/messages/${thread.id}`} className={styles.threadCardBody}>
                      <div className={styles.threadCardMeta}>
                        <Badge variant="muted">
                          {RELATED_TYPE_LABELS[thread.relatedType] || thread.relatedType}
                        </Badge>
                        {thread.unread > 0 ? (
                          <Badge variant="solid">{thread.unread} новых</Badge>
                        ) : null}
                        <span className={styles.threadCardDate}>
                          <MessageSquare className="h-3 w-3" />
                          {formatShortDate(thread.lastDate)}
                        </span>
                      </div>
                      <p className={styles.threadCardTitle}>{thread.title}</p>
                      <p className={styles.threadCardPreview}>{thread.lastMessage}</p>
                      {details ? (
                        <p className={styles.threadCardDetails}>
                          {details.event !== "—" ? details.event : details.venue}
                          {details.cost !== "—" ? ` · ${details.cost}` : ""}
                        </p>
                      ) : null}
                    </Link>
                    {thread.relatedLink && thread.relatedType !== "support" ? (
                      <Link
                        href={withFromMessages(resolveMessageRelatedHref(thread, accountRole))}
                        className={styles.messageCardLink}
                      >
                        {getRelatedLinkLabel(thread)}
                      </Link>
                    ) : null}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.chatColumn}>
          {selectedThread ? (
            <MessageThreadPanel
              thread={selectedThread}
              senderName={senderName}
              text={text}
              attachedFiles={attachedFiles}
              onTextChange={setText}
              onAttach={(fileName) => setAttachedFiles((prev) => [...prev, fileName])}
              onSend={handleSend}
            />
          ) : (
            <div className={styles.chatEmpty}>
              <p className={styles.chatEmptyTitle}>Выберите переписку</p>
              <p className={styles.chatEmptyText}>Нажмите на карточку слева, чтобы открыть чат</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
