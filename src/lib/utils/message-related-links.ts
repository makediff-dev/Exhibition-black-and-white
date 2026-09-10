import { getNavForRole } from "@/constants/nav-menus";
import type { MessageThread, UserRole } from "@/data/types";

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
  if (from === "messages" || from === "requests" || from === "dashboard") return true;
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
  if (from === "my-events") return "/account/customer/my-events";
  return fallback;
}

function eventIdFromThread(
  thread: Pick<MessageThread, "relatedId" | "relatedLink">
) {
  if (thread.relatedId && thread.relatedId.startsWith("evt-")) return thread.relatedId;
  const match = thread.relatedLink.match(/\/events\/([^/?#]+)/);
  return match?.[1];
}

function bookingIdFromThread(
  thread: Pick<MessageThread, "relatedId" | "relatedLink">
) {
  if (thread.relatedId && thread.relatedId.startsWith("book-")) return thread.relatedId;
  const match = thread.relatedLink.match(/\/bookings\/([^/?#]+)/);
  const id = match?.[1];
  if (id && id !== "event") return id;
  if (thread.relatedId) return thread.relatedId;
  return undefined;
}

export function resolveMessageRelatedHref(
  thread: Pick<MessageThread, "relatedType" | "relatedId" | "relatedLink">,
  role?: UserRole | null
) {
  if (thread.relatedType === "event") {
    const eventId = eventIdFromThread(thread);
    if (eventId && role === "organizer") {
      return `/account/organizer/edit-event?id=${encodeURIComponent(eventId)}`;
    }
    if (eventId && role === "venue") {
      return `/account/venue/events/${encodeURIComponent(eventId)}`;
    }
  }

  if (thread.relatedType === "booking" && role && ACCOUNT_ROLES.includes(role)) {
    const bookingId = bookingIdFromThread(thread);
    if (bookingId) {
      return `/account/${role}/bookings/${encodeURIComponent(bookingId)}`;
    }
  }

  return thread.relatedLink;
}
