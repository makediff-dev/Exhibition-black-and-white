import type { Event } from "@/data/types";

function normalizeSearchValue(value: string) {
  return value.toLowerCase().replace(/[«»"']/g, "").trim();
}

export function getEventSearchIndex(event: Event) {
  return [
    event.title,
    event.city,
    event.industry,
    event.venue,
    event.description,
    ...(event.searchAliases ?? []),
  ]
    .map(normalizeSearchValue)
    .join(" ");
}

export function matchesEventSearch(event: Event, query: string) {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) return true;

  const index = getEventSearchIndex(event);
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  return tokens.every((token) => index.includes(token));
}

export function getEventMonthKey(date: string) {
  const parsed = new Date(date);
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
}

export function formatEventMonthLabel(date: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}
