"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { OrganizerParticipantsList } from "@/components/organizer/organizer-participants-list";
import { SEED_EVENTS } from "@/data/mocks/seed";
import { usePrototypeStore } from "@/lib/store";
import { formatShortDate } from "@/lib/utils/formatters";

interface Props {
  eventId: string;
  organizerId?: string;
}

export function OrganizerEventParticipantsSection({
  eventId,
  organizerId = "user-organizer",
}: Props) {
  const participants = usePrototypeStore((state) => state.participants);

  const event = SEED_EVENTS.find((item) => item.id === eventId);

  if (!event || event.organizerId !== organizerId) {
    return <EmptyState title="Мероприятие не найдено" />;
  }

  const eventParticipants = useMemo(
    () => participants.filter((participant) => participant.eventId === eventId),
    [participants, eventId]
  );

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="space-y-2">
        <BackButton fallbackHref={`/account/organizer/edit-event?id=${event.id}`} />
        <h1 className="text-xl font-bold text-gray-900">Участники / экспоненты</h1>
        <p className="text-sm text-gray-600">
          {formatShortDate(event.startDate)} — {formatShortDate(event.endDate)} · {event.city} ·{" "}
          {event.venue}
        </p>
      </div>

      <Card className="space-y-2">
        <CardTitle className="text-sm">{eventParticipants.length} экспонентов</CardTitle>
        <CardDescription>
          Экспонент — компания, которая участвует со своим стендом. Подрядчики и застройщики
          отображаются в разделе «Заказы».
        </CardDescription>
      </Card>

      <OrganizerParticipantsList
        participants={eventParticipants}
        participantHref={(participant) =>
          `/account/organizer/events/${eventId}/participants/${participant.id}`
        }
      />

      <Link href={`/account/organizer/edit-event?id=${event.id}`}>
        <Button size="sm" variant="outline">
          К мероприятию
        </Button>
      </Link>
    </div>
  );
}
