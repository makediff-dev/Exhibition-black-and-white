import { getNavForRole, resolveActiveNavSlug } from "@/constants/nav-menus";
import type { Deal, Notification, UserRole } from "@/data/types";
import { withFromParam } from "@/lib/utils/message-related-links";

const CATEGORY_NAV_SLUG: Record<string, Partial<Record<Exclude<UserRole, null>, string>>> = {
  responses: { customer: "responses", contractor: "my-responses" },
  deals: { customer: "active-projects", contractor: "active-projects" },
  documents: {
    customer: "edo",
    contractor: "documents",
    venue: "documents",
    organizer: "documents",
  },
  bookings: { venue: "bookings" },
  payments: {
    customer: "payments",
    contractor: "payouts",
    venue: "payments",
    organizer: "payments",
  },
  orders: { venue: "orders", organizer: "orders", customer: "cart" },
  events: { organizer: "events", venue: "events", customer: "my-events" },
  participants: { organizer: "events" },
  system: { customer: "edo" },
};

function pickNavSlug(role: string, slug: string): string | undefined {
  return getNavForRole(role).some((item) => item.slug === slug) ? slug : undefined;
}

export function resolveNotificationNavSlug(
  notification: Pick<Notification, "link" | "category">,
  role?: UserRole | null,
  deals?: Deal[],
): string | undefined {
  if (!role) return undefined;

  const path = notification.link.split("#")[0].split("?")[0];

  if (path.startsWith("/deals/")) {
    const dealId = path.split("/")[2];
    const deal = deals?.find((item) => item.id === dealId);
    if (deal?.status === "completed") {
      return pickNavSlug(role, "active-projects") ?? pickNavSlug(role, "completed-projects");
    }
    return pickNavSlug(role, "active-projects") ?? pickNavSlug(role, "completed-projects");
  }

  if (notification.category === "responses") {
    const responsesSlug = CATEGORY_NAV_SLUG.responses[role];
    if (responsesSlug) {
      const matched = pickNavSlug(role, responsesSlug);
      if (matched) return matched;
    }
  }

  const fromCategory = notification.category
    ? CATEGORY_NAV_SLUG[notification.category]?.[role]
    : undefined;
  if (fromCategory) {
    const matched = pickNavSlug(role, fromCategory);
    if (matched) return matched;
  }

  return resolveActiveNavSlug(path, role);
}

export function resolveNotificationHref(
  notification: Pick<Notification, "link" | "category">,
  role?: UserRole | null,
  deals?: Deal[],
): string {
  if (!notification.link) return "";

  const slug = resolveNotificationNavSlug(notification, role, deals);
  if (slug === undefined) return notification.link;

  return withFromParam(notification.link, slug === "" ? "dashboard" : slug);
}
