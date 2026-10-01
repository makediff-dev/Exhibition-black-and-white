"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, Pin } from "lucide-react";
import { MessageThreadPanel } from "@/components/messages/message-thread-panel";
import styles from "@/components/messages/messages.module.css";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import { getPublicVenueByCatalogId, getPublicVenueById } from "@/constants/venues";
import { SEED_EVENTS } from "@/data/mocks/seed";
import type { ChatMessage, Deal, MessageCategory, MessageThread, Request, UserRole } from "@/data/types";
import { canContactVenue } from "@/lib/auth/authorization";
import { loginHref } from "@/lib/auth/session";
import {
  buildContextThread,
  buildMessagesContextHref,
  findThreadByContext,
  getContextBackLabel,
  getContextTypeLabel,
  getThreadContextRef,
  parseContextSearchParams,
} from "@/lib/domain/entity-ref";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { useCabinetSession } from "@/lib/hooks/use-cabinet-session";
import { formatPrice, formatShortDate } from "@/lib/utils/formatters";
import {
  resolveMessageRelatedHref,
  withFromMessages,
} from "@/lib/utils/message-related-links";
import { getThreadInboxCategory, isThreadForUser } from "@/lib/utils/cabinet-scope";
import { isThreadInboxPinned, sortInboxThreads } from "@/lib/utils/chat-actions";
import { getPrototypeNowIso } from "@/lib/time/now";
import { cn } from "@/lib/utils/cn";

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
  const context = getThreadContextRef(thread);
  const relatedType = context?.type ?? thread.relatedType;
  const relatedId = context?.id ?? thread.relatedId;

  if (relatedType === "deal") {
    const deal = deals.find((item) => item.id === relatedId);
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

  if (relatedType === "request") {
    const request = requests.find((item) => item.id === relatedId);
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

  if (relatedType === "event") {
    const event = SEED_EVENTS.find((item) => item.id === relatedId);
    return {
      customer: "—",
      event: event?.title ?? thread.title,
      venue: event?.venue ?? "—",
      cost: "—",
    };
  }

  if (relatedType === "booking") {
    const event = SEED_EVENTS.find((item) => item.id === "evt-1");
    return {
      customer: "—",
      event: event?.title ?? "—",
      venue: event?.venue ?? "—",
      cost: "—",
    };
  }

  if (relatedType === "venue") {
    const venue = getPublicVenueById(relatedId) ?? getPublicVenueByCatalogId(relatedId);
    return {
      customer: "—",
      event: "—",
      venue: venue?.name ?? thread.title,
      cost: "—",
    };
  }

  return null;
}

function getRelatedLinkLabel(thread: MessageThread) {
  return getContextBackLabel(getThreadContextRef(thread)?.type ?? thread.relatedType);
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accountRole } = useCabinetSession();
  const user = useAuthStore((state) => state.user);
  const { messages, deals, requests, addMessage, addThread, updateChatMessage, markThreadRead, toggleInboxPin } =
    usePrototypeStore();
  const [activeCategory, setActiveCategory] = useState<MessageCategory | "all">("all");
  const [text, setText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [contextError, setContextError] = useState<string | null>(null);
  const contextRef = useMemo(() => parseContextSearchParams(searchParams), [searchParams]);

  useEffect(() => {
    if (!contextRef || selectedThreadId) return;

    const existing = findThreadByContext(messages, contextRef);
    if (existing) {
      router.replace(`/messages/${existing.id}`);
      return;
    }

    if (!user?.role) {
      router.replace(loginHref(buildMessagesContextHref(contextRef)));
      return;
    }

    if (contextRef.type === "venue") {
      const contact = canContactVenue(user, contextRef.id);
      if (!contact.allowed) {
        setContextError(contact.reason);
        return;
      }
      const venue = getPublicVenueById(contextRef.id) ?? getPublicVenueByCatalogId(contextRef.id);
      const roles = [user.role, "venue"].filter(
        (role, index, list) => role && list.indexOf(role) === index
      ) as Exclude<UserRole, null>[];
      const thread = buildContextThread({
        ref: contextRef,
        title: venue?.name ?? "Площадка",
        category: "venue",
        participantRoles: roles,
        lastMessage: "Диалог с площадкой",
      });
      addThread(thread);
      router.replace(`/messages/${thread.id}`);
      return;
    }

    if (contextRef.type === "deal") {
      const deal = deals.find((item) => item.id === contextRef.id);
      const thread = buildContextThread({
        ref: contextRef,
        title: deal ? `Сделка ${deal.number}` : "Сделка",
        category: "customer",
        participantRoles: ["customer", "contractor"],
        lastMessage: "Диалог по сделке",
      });
      addThread(thread);
      router.replace(`/messages/${thread.id}`);
    }
  }, [addThread, contextRef, deals, messages, router, selectedThreadId, user]);

  const actorId = user?.id ?? user?.name ?? "guest";

  const sortedThreads = useMemo(
    () => sortInboxThreads(messages, actorId),
    [messages, actorId]
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

  useEffect(() => {
    if (!selectedThreadId || !senderName) return;
    markThreadRead(selectedThreadId, senderName);
  }, [markThreadRead, selectedThreadId, senderName]);

  useEffect(() => {
    setEditingMessageId(null);
    setText("");
    setAttachedFiles([]);
  }, [selectedThreadId]);

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setText("");
  };

  const handleStartEdit = (message: ChatMessage) => {
    setEditingMessageId(message.id);
    setText(message.text);
    setAttachedFiles([]);
  };

  const handleSend = () => {
    if (!selectedThread) return;
    const nextText = text.trim();

    if (editingMessageId) {
      if (!nextText) return;
      updateChatMessage(selectedThread.id, editingMessageId, {
        text: nextText,
        editedAt: getPrototypeNowIso(),
      });
      handleCancelEdit();
      return;
    }

    if (!nextText && attachedFiles.length === 0) return;

    addMessage(selectedThread.id, {
      id: `m-${Date.now()}`,
      sender: senderName,
      text: nextText || "(файл без текста)",
      date: getPrototypeNowIso(),
      files: attachedFiles,
    });

    setText("");
    setAttachedFiles([]);
  };

  return (
    <div ref={pageRef} className={styles.page}>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Сообщения</h1>
      {contextError ? (
        <p className="mb-4 text-sm text-gray-600">{contextError}</p>
      ) : null}
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
                const inboxPinned = isThreadInboxPinned(thread, actorId);

                return (
                  <Card
                    key={thread.id}
                    hoverable
                    aria-current={isActive ? "true" : undefined}
                    className={cn(styles.threadCard, isActive && styles.threadCardActive)}
                  >
                    <div className={styles.threadCardTop}>
                      <Link href={`/messages/${thread.id}`} className={styles.threadCardBody}>
                        <div className={styles.threadCardMeta}>
                          <div className={styles.threadCardBadges}>
                            <Badge variant="muted">
                              {getContextTypeLabel(getThreadContextRef(thread)?.type ?? thread.relatedType)}
                            </Badge>
                            {inboxPinned ? (
                              <Badge variant="outline">Закреплён</Badge>
                            ) : null}
                            {thread.unread > 0 ? (
                              <Badge variant="solid">{thread.unread} новых</Badge>
                            ) : null}
                          </div>
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
                      <button
                        type="button"
                        className={cn(styles.inboxPinButton, inboxPinned && styles.inboxPinButtonActive)}
                        aria-pressed={inboxPinned}
                        aria-label={inboxPinned ? "Открепить чат" : "Закрепить чат"}
                        onClick={() => toggleInboxPin(thread.id, actorId)}
                      >
                        <Pin className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {thread.relatedLink && (getThreadContextRef(thread)?.type ?? thread.relatedType) !== "support" ? (
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
              actorId={actorId}
              forwardTargets={scopedThreads.filter((item) => item.id !== selectedThread.id)}
              text={text}
              attachedFiles={attachedFiles}
              editingMessageId={editingMessageId}
              onTextChange={setText}
              onAttach={(fileName) => setAttachedFiles((prev) => [...prev, fileName])}
              onSend={handleSend}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
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
