import { getNavForRole } from "@/constants/nav-menus";
import type { MessageThread, UserRole } from "@/data/types";
import { getPublicEntityHref, getThreadContextRef } from "@/lib/domain/entity-ref";

const ACCOUNT_ROLES: UserRole[] = ["customer", "contractor", "venue", "organizer"];

export function withFromParam(href: string, from: string) {
  const [path, existingQuery = ""] = href.split("?");
  const params = new URLSearchParams(existingQuery);
  params.set("from", from);
  return `${path}?${params.toString()}`;
}

export function withFromMessages(href: string) {
  return withFromParam(href, "messages");
}

export function keepsCabinetSidebar(from: string | null, role?: string | null) {
  if (!from) return false;
  if (from === "messages" || from === "requests" || from === "dashboard" || from === "cart") {
    return true;
  }
  if (!role) return false;
  return getNavForRole(role).some((item) => item.slug === from);
}

export function getCabinetBackHref(from: string | null, fallback: string, role?: string | null) {
  if (from === "messages") return "/messages";
  if (from === "requests") return "/requests";
  if (from === "dashboard" && role && ACCOUNT_ROLES.includes(role as UserRole)) {
    return `/account/${role}`;
  }
  if (from && role) {
    const item = getNavForRole(role).find((item) => item.slug === from);
    if (item) return item.href;
  }
  if (from === "cities" || from === "production" || from === "portfolio") {
    return `/account/contractor/profile?tab=${from}`;
  }
  return fallback;
}

function eventIdFromThread(
  thread: Pick<MessageThread, "relatedId" | "relatedLink"> &
    Partial<Pick<MessageThread, "contextId">>
) {
  const contextId = thread.contextId || thread.relatedId;
  if (contextId && contextId.startsWith("evt-")) return contextId;
  const match = thread.relatedLink.match(/\/events\/([^/?#]+)/);
  return match?.[1];
}

function bookingIdFromThread(
  thread: Pick<MessageThread, "relatedId" | "relatedLink"> &
    Partial<Pick<MessageThread, "contextId">>
) {
  const contextId = thread.contextId || thread.relatedId;
  if (contextId && contextId.startsWith("book-")) return contextId;
  const match = thread.relatedLink.match(/\/bookings\/([^/?#]+)/);
  const id = match?.[1];
  if (id && id !== "event") return id;
  if (contextId) return contextId;
  return undefined;
}

export function resolveMessageRelatedHref(
  thread: Pick<MessageThread, "relatedType" | "relatedId" | "relatedLink"> &
    Partial<Pick<MessageThread, "contextType" | "contextId">>,
  role?: UserRole | null
) {
  const context = getThreadContextRef(thread);
  const type = context?.type ?? thread.relatedType;
  const id = context?.id ?? thread.relatedId;

  if (type === "event") {
    const eventId = eventIdFromThread(thread);
    if (eventId && role === "organizer") {
      return `/account/organizer/edit-event?id=${encodeURIComponent(eventId)}`;
    }
    if (eventId && role === "venue") {
      return `/account/venue/events/${encodeURIComponent(eventId)}`;
    }
  }

  if (type === "booking" && role && ACCOUNT_ROLES.includes(role)) {
    const bookingId = bookingIdFromThread(thread);
    if (bookingId) {
      return `/account/${role}/bookings/${encodeURIComponent(bookingId)}`;
    }
  }

  if (context) return getPublicEntityHref(context);
  if (type && id) return thread.relatedLink;
  return thread.relatedLink;
}
