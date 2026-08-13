"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { OrganizerParticipantsList } from "@/components/organizer/organizer-participants-list";
import { SEED_EVENTS } from "@/data/mocks/seed";
import { usePrototypeStore } from "@/lib/store";

interface Props {
  organizerId?: string;
}

export function OrganizerParticipantsGlobalSection({ organizerId = "user-organizer" }: Props) {
  const participants = usePrototypeStore((state) => state.participants);
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("");

  const organizerEvents = useMemo(
    () => SEED_EVENTS.filter((event) => event.organizerId === organizerId),
    [organizerId]
  );

  const organizerEventIds = useMemo(
    () => new Set(organizerEvents.map((event) => event.id)),
    [organizerEvents]
  );

  const filteredParticipants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return participants
      .filter((participant) => organizerEventIds.has(participant.eventId))
      .filter((participant) => !eventFilter || participant.eventId === eventFilter)
      .filter((participant) => {
        if (!normalizedQuery) return true;
        const event = organizerEvents.find((item) => item.id === participant.eventId);
        return (
          participant.name.toLowerCase().includes(normalizedQuery) ||
          participant.status.toLowerCase().includes(normalizedQuery) ||
          (participant.assignedSpace ?? "").toLowerCase().includes(normalizedQuery) ||
          (event?.title ?? "").toLowerCase().includes(normalizedQuery)
        );
      });
  }, [participants, organizerEventIds, organizerEvents, eventFilter, query]);

  return (
    <div className="space-y-4 w-full">
      <p className="text-sm text-gray-600">
        Поиск экспонентов по всем мероприятиям. Это компании со своим стендом — не подрядчики и не
        застройщики. Управление заявками — на вкладке «Участники / экспоненты» внутри события.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 max-w-3xl">
        <Input
          placeholder="Поиск участника..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Select
          label="Мероприятие"
          value={eventFilter}
          onChange={(event) => setEventFilter(event.target.value)}
          options={[
            { value: "", label: "Все мероприятия" },
            ...organizerEvents.map((event) => ({ value: event.id, label: event.title })),
          ]}
        />
      </div>

      <OrganizerParticipantsList
        participants={filteredParticipants}
        showEventColumn
        participantHref={(participant) =>
          `/account/organizer/events/${participant.eventId}/participants/${participant.id}`
        }
      />
    </div>
  );
}
