const ORGANIZER_NAMES: Record<string, string> = {
  "user-organizer": "ООО «МебельЭкспо Организатор»",
  "user-organizer-forum": "ООО «IT Forum Организатор»",
};

export function getOrganizerDisplayName(organizerId?: string | null) {
  if (!organizerId) return "Организатор мероприятия";
  return ORGANIZER_NAMES[organizerId] ?? "Организатор мероприятия";
}
