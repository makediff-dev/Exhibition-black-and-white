import { SEED_CONTRACTORS, SEED_EVENTS, SEED_SERVICES } from "@/data/mocks/seed";
import { matchesEventSearch } from "@/lib/utils/event-search";

export interface SearchSuggestion {
  id: string;
  label: string;
  subtitle: string;
  href: string;
  type: "event" | "contractor" | "service";
}

const TYPE_LABELS: Record<SearchSuggestion["type"], string> = {
  event: "Мероприятие",
  contractor: "Исполнитель",
  service: "Услуга",
};

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

export function getSearchSuggestions(query: string, limit = 8): SearchSuggestion[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const suggestions: SearchSuggestion[] = [];

  for (const event of SEED_EVENTS) {
    if (!matchesEventSearch(event, trimmed)) continue;
    suggestions.push({
      id: `event-${event.id}`,
      label: event.title,
      subtitle: `${getSearchTypeLabel("event")} · ${event.city}`,
      href: `/events/${event.id}`,
      type: "event",
    });
    if (suggestions.length >= limit) return suggestions;
  }

  for (const contractor of SEED_CONTRACTORS) {
    const haystack = `${contractor.name} ${contractor.description} ${contractor.categories.join(" ")} ${contractor.city}`;
    if (!matchesText(haystack, trimmed)) continue;
    suggestions.push({
      id: `contractor-${contractor.id}`,
      label: contractor.name,
      subtitle: `${getSearchTypeLabel("contractor")} · ${contractor.city}`,
      href: `/contractors/${contractor.id}`,
      type: "contractor",
    });
    if (suggestions.length >= limit) return suggestions;
  }

  for (const service of SEED_SERVICES) {
    const haystack = `${service.title} ${service.category} ${service.contractorName} ${service.city}`;
    if (!matchesText(haystack, trimmed)) continue;
    suggestions.push({
      id: `service-${service.id}`,
      label: service.title,
      subtitle: `${getSearchTypeLabel("service")} · ${service.contractorName}`,
      href: `/services/${service.id}`,
      type: "service",
    });
    if (suggestions.length >= limit) return suggestions;
  }

  return suggestions;
}
