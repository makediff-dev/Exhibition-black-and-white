"use client";

import { BackButton } from "@/components/ui/back-button";
import { EmptyState } from "@/components/ui/states";
import { EventOrdersPanel } from "@/components/deals/event-orders-panel";
import { SEED_EVENTS } from "@/data/mocks/seed";

interface Props {
  eventId: string;
  venueId?: string;
}

export function VenueEventOrdersSection({ eventId, venueId = "venue-1" }: Props) {
  const event = SEED_EVENTS.find(
    (item) => item.id === eventId && item.venueId === venueId
  );

  if (!event) {
    return (
      <div className="space-y-4 w-full">
        <BackButton fallbackHref="/account/venue/orders" />
        <EmptyState
          title="Мероприятие не найдено"
          description="Проверьте ссылку или вернитесь к списку заказов"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <BackButton fallbackHref="/account/venue/orders" />
      <EventOrdersPanel
        eventId={eventId}
        venueId={venueId}
        showVenueNote
        showDirectionFilter
        unboxed
      />
    </div>
  );
}
