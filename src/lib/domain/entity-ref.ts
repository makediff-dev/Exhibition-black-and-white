import type {
  EntityRef,
  EntityType,
  MessageThread,
  UserRole,
} from "../../data/types/index.ts";
import { getPrototypeNowDateIso } from "../time/now.ts";

/** Public card id is canonical; org catalog id is an alias of the same venue. */
const VENUE_ID_ALIASES: Record<string, string> = {
  "v-1": "v-1",
  "venue-1": "v-1",
};

export const ENTITY_TYPES: EntityType[] = [
  "event",
  "venue",
  "request",
  "order",
  "deal",
  "invoice",
  "document",
  "booking",
  "support",
];

export function isEntityType(value: string): value is EntityType {
  return ENTITY_TYPES.includes(value as EntityType);
}

export function canonicalizeEntityId(type: EntityType, id: string): string {
  if (type !== "venue") return id;
  return VENUE_ID_ALIASES[id] ?? id;
}

export function canonicalizeEntityRef(ref: EntityRef): EntityRef {
  return { type: ref.type, id: canonicalizeEntityId(ref.type, ref.id) };
}

export function sameEntityRef(a: EntityRef, b: EntityRef): boolean {
  const left = canonicalizeEntityRef(a);
  const right = canonicalizeEntityRef(b);
  return left.type === right.type && left.id === right.id;
}

export function getThreadContextRef(
  thread: Pick<MessageThread, "relatedType" | "relatedId"> &
    Partial<Pick<MessageThread, "contextType" | "contextId">>
): EntityRef | null {
  const rawType = thread.contextType || thread.relatedType;
  const rawId = thread.contextId || thread.relatedId;
  if (!rawType || !rawId || !isEntityType(rawType)) return null;
  return canonicalizeEntityRef({ type: rawType, id: rawId });
}

export function parseContextSearchParams(
  search: Pick<URLSearchParams, "get">
): EntityRef | null {
  const typeRaw =
    search.get("contextType") ??
    search.get("related") ??
    (search.get("venueId") ? "venue" : search.get("dealId") ? "deal" : null);
  const idRaw = search.get("contextId") ?? search.get("venueId") ?? search.get("dealId");
  if (!typeRaw || !idRaw || !isEntityType(typeRaw)) return null;
  return canonicalizeEntityRef({ type: typeRaw, id: idRaw });
}

export function getPublicEntityHref(ref: EntityRef): string {
  const { type, id } = canonicalizeEntityRef(ref);
  switch (type) {
    case "venue":
      return `/venues/${id}`;
    case "event":
      return `/events/${id}`;
    case "request":
      return `/requests/${id}`;
    case "deal":
      return `/deals/${id}`;
    case "order":
      return `/orders/${id}`;
    case "invoice":
      return "/payments";
    case "document":
      return "/documents";
    case "booking":
      return "/account/venue/bookings";
    case "support":
      return "/messages";
  }
}

export function buildMessagesContextHref(ref: EntityRef): string {
  const canonical = canonicalizeEntityRef(ref);
  const params = new URLSearchParams({
    contextType: canonical.type,
    contextId: canonical.id,
  });
  return `/messages?${params.toString()}`;
}

export function findThreadByContext(
  threads: MessageThread[],
  ref: EntityRef
): MessageThread | undefined {
  const target = canonicalizeEntityRef(ref);
  return threads.find((thread) => {
    const current = getThreadContextRef(thread);
    return current ? sameEntityRef(current, target) : false;
  });
}

export function getContextTypeLabel(type: EntityType | string): string {
  if (type === "deal") return "Сделка";
  if (type === "request") return "Заявка";
  if (type === "support") return "Поддержка";
  if (type === "booking") return "Бронирование";
  if (type === "event") return "Мероприятие";
  if (type === "venue") return "Площадка";
  if (type === "order") return "Заказ";
  if (type === "invoice") return "Счёт";
  if (type === "document") return "Документ";
  return type;
}

export function getContextBackLabel(type: EntityType | string): string {
  if (type === "deal") return "Открыть сделку →";
  if (type === "request") return "Открыть заявку →";
  if (type === "booking") return "Открыть бронирование →";
  if (type === "event") return "Открыть мероприятие →";
  if (type === "venue") return "Открыть площадку →";
  return "Открыть →";
}

export function buildContextThread(input: {
  ref: EntityRef;
  title: string;
  category: MessageThread["category"];
  participantRoles: Exclude<UserRole, null>[];
  lastMessage?: string;
}): MessageThread {
  const ref = canonicalizeEntityRef(input.ref);
  const href = getPublicEntityHref(ref);
  const lastMessage = input.lastMessage ?? "Диалог создан";
  const lastDate = getPrototypeNowDateIso();
  return {
    id: `msg-${ref.type}-${ref.id}`,
    title: input.title,
    category: input.category,
    contextType: ref.type,
    contextId: ref.id,
    relatedType: ref.type,
    relatedId: ref.id,
    relatedLink: href,
    lastMessage,
    lastDate,
    unread: 0,
    participantRoles: input.participantRoles,
    messages: [
      {
        id: `m-${ref.type}-${ref.id}-start`,
        sender: "Система",
        text: lastMessage,
        date: lastDate,
        files: [],
      },
    ],
  };
}
