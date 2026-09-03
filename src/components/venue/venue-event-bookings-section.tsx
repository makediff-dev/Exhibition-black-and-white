"use client";

import { BackButton } from "@/components/ui/back-button";
import { EmptyState } from "@/components/ui/states";
import { VenueBookingsSection } from "@/components/venue/venue-bookings-section";
import { SEED_EVENTS } from "@/data/mocks/seed";

interface Props {
  eventId: string;
  venueId?: string;
}

export function VenueEventBookingsSection({ eventId, venueId = "venue-1" }: Props) {
  const event = SEED_EVENTS.find(
    (item) => item.id === eventId && item.venueId === venueId
  );

  if (!event) {
    return (
      <div className="space-y-4 w-full">
        <BackButton fallbackHref="/account/venue/bookings" />
        <EmptyState
          title="Мероприятие не найдено"
          description="Проверьте ссылку или вернитесь к списку бронирований"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <BackButton fallbackHref={`/account/venue/events/${eventId}`} />
      <div>
        <h1 className="text-xl font-bold">{event.title}</h1>
        <p className="text-sm text-gray-600 mt-1">Бронирования по мероприятию</p>
      </div>
      <VenueBookingsSection venueId={venueId} initialEventId={eventId} lockEventFilter />
    </div>
  );
}