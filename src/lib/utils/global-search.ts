import { CURRENT_HOME_ORDERS, URGENT_HOME_ORDERS } from "@/constants/home-orders";
import { PUBLIC_VENUES } from "@/constants/venues";
import { SEED_CONTRACTORS, SEED_EVENTS, SEED_SERVICES } from "@/data/mocks/seed";
import {
  getContractorCardSlides,
  getEventCardSlides,
  getServiceCardSlides,
} from "@/lib/utils/catalog-card-images";
import { matchesEventSearch } from "@/lib/utils/event-search";
import { formatReviewCount, formatServicePrice, formatShortDate } from "@/lib/utils/formatters";

export type SearchGroupKind = "service" | "contractor" | "order" | "event" | "venue";

export interface SearchSuggestion {
  id: string;
  label: string;
  subtitle: string;
  href: string;
  type: "event" | "contractor" | "service";
}

export interface SearchHit {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  imageUrl: string;
}

export interface SearchGroup {
  kind: SearchGroupKind;
  title: string;
  catalogHref: string;
  items: SearchHit[];
}

const TYPE_LABELS: Record<SearchSuggestion["type"], string> = {
  event: "Мероприятие",
  contractor: "Исполнитель",
  service: "Услуга",
};

const GROUP_META: Record<SearchGroupKind, { title: string; catalogPath: string }> = {
  service: { title: "Услуги", catalogPath: "/services" },
  contractor: { title: "Исполнители", catalogPath: "/contractors" },
  order: { title: "Заказы", catalogPath: "/requests" },
  event: { title: "Мероприятия", catalogPath: "/events" },
  venue: { title: "Площадки", catalogPath: "/venues" },
};

const MIXED_GROUP_ORDER: SearchGroupKind[] = ["service", "contractor", "order", "event", "venue"];
const DEFAULT_PER_GROUP = 5;

export function getSearchTypeLabel(type: SearchSuggestion["type"]) {
  return TYPE_LABELS[type];
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[«»"']/g, "").trim();
}

function matchesText(haystack: string, query: string) {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  const index = normalize(haystack);
  return tokens.every((token) => index.includes(token));
}

function catalogHref(path: string, query: string) {
  return `${path}?q=${encodeURIComponent(query)}`;
}

function uniqueHomeOrders() {
  const orders = new Map<string, (typeof URGENT_HOME_ORDERS)[number]>();
  for (const order of [...URGENT_HOME_ORDERS, ...CURRENT_HOME_ORDERS]) {
    if (!orders.has(order.requestId)) {
      orders.set(order.requestId, order);
    }
  }
  return Array.from(orders.values());
}

function collectServices(query: string, limit: number): SearchHit[] {
  const items: SearchHit[] = [];
  SEED_SERVICES.forEach((service, index) => {
    if (items.length >= limit) return;
    const haystack = `${service.title} ${service.category} ${service.contractorName} ${service.city} ${service.description}`;
    if (!matchesText(haystack, query)) return;
    items.push({
      id: `service-${service.id}`,
      title: service.title,
      subtitle: `${service.contractorName} · ${formatServicePrice(service)}`,
      href: `/services/${service.id}`,
      imageUrl: getServiceCardSlides(service, index)[0]?.imageUrl ?? "",
    });
  });
  return items;
}

function collectContractors(query: string, limit: number): SearchHit[] {
  const items: SearchHit[] = [];
  SEED_CONTRACTORS.forEach((contractor, index) => {
    if (items.length >= limit) return;
    const haystack = `${contractor.name} ${contractor.description} ${contractor.categories.join(" ")} ${contractor.city}`;
    if (!matchesText(haystack, query)) return;
    items.push({
      id: `contractor-${contractor.id}`,
      title: contractor.name,
      subtitle: `${contractor.city} · ${contractor.rating.toLocaleString("ru-RU")} · ${formatReviewCount(contractor.reviewCount)}`,
      href: `/contractors/${contractor.id}`,
      imageUrl: getContractorCardSlides(contractor.id, contractor.name, index)[0]?.imageUrl ?? "",
    });
  });
  return items;
}

function collectOrders(query: string, limit: number): SearchHit[] {
  const items: SearchHit[] = [];
  for (const order of uniqueHomeOrders()) {
    if (items.length >= limit) break;
    const haystack = `${order.title} ${order.description} ${order.budget} ${order.deadlineLabel}`;
    if (!matchesText(haystack, query)) continue;
    items.push({
      id: `order-${order.id}`,
      title: order.title,
      subtitle: `${order.budget} · ${order.deadlineLabel}`,
      href: `/requests/${order.requestId}`,
      imageUrl: order.imageUrl,
    });
  }
  return items;
}

function collectEvents(query: string, limit: number): SearchHit[] {
  const items: SearchHit[] = [];
  SEED_EVENTS.forEach((event, index) => {
    if (items.length >= limit) return;
    if (!matchesEventSearch(event, query)) return;
    items.push({
      id: `event-${event.id}`,
      title: event.title,
      subtitle: `${event.city} · ${formatShortDate(event.startDate)}`,
      href: `/events/${event.id}`,
      imageUrl: getEventCardSlides(event, index)[0]?.imageUrl ?? "",
    });
  });
  return items;
}

function collectVenues(query: string, limit: number): SearchHit[] {
  const items: SearchHit[] = [];
  for (const venue of PUBLIC_VENUES) {
    if (items.length >= limit) break;
    const haystack = `${venue.name} ${venue.city} ${venue.halls} ${venue.description} ${venue.address ?? ""}`;
    if (!matchesText(haystack, query)) continue;
    items.push({
      id: `venue-${venue.id}`,
      title: venue.name,
      subtitle: `${venue.city} · ${venue.halls}`,
      href: `/venues/${venue.id}`,
      imageUrl: venue.imageUrl,
    });
  }
  return items;
}

const COLLECTORS: Record<SearchGroupKind, (query: string, limit: number) => SearchHit[]> = {
  service: collectServices,
  contractor: collectContractors,
  order: collectOrders,
  event: collectEvents,
  venue: collectVenues,
};

export function getGroupedSearchResults(
  query: string,
  options?: { kinds?: SearchGroupKind[]; perGroup?: number },
): SearchGroup[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const kinds = options?.kinds?.length ? options.kinds : MIXED_GROUP_ORDER;
  const perGroup = options?.perGroup ?? DEFAULT_PER_GROUP;

  return kinds.flatMap((kind) => {
    const items = COLLECTORS[kind](trimmed, perGroup);
    if (items.length === 0) return [];
    const meta = GROUP_META[kind];
    return [
      {
        kind,
        title: meta.title,
        catalogHref: catalogHref(meta.catalogPath, trimmed),
        items,
      },
    ];
  });
}

export function getSearchSuggestions(query: string, limit = 8): SearchSuggestion[] {
  const groups = getGroupedSearchResults(query, {
    kinds: ["event", "contractor", "service"],
    perGroup: limit,
  });

  const suggestions: SearchSuggestion[] = [];
  for (const group of groups) {
    for (const item of group.items) {
      if (suggestions.length >= limit) return suggestions;
      if (group.kind !== "event" && group.kind !== "contractor" && group.kind !== "service") continue;
      suggestions.push({
        id: item.id,
        label: item.title,
        subtitle: item.subtitle,
        href: item.href,
        type: group.kind,
      });
    }
  }

  return suggestions;
}
