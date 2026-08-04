"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { SEED_EVENTS } from "@/data/mocks/seed";
import type { Participant } from "@/data/types";

interface Props {
  participants: Participant[];
  showEventColumn?: boolean;
  participantHref: (participant: Participant) => string;
}

export function OrganizerParticipantsList({
  participants,
  showEventColumn = false,
  participantHref,
}: Props) {
  const eventMap = Object.fromEntries(SEED_EVENTS.map((event) => [event.id, event]));

  if (participants.length === 0) {
    return (
      <Card>
        <CardDescription>Участники не найдены по выбранным фильтрам</CardDescription>
      </Card>
    );
  }

  return (
    <>
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-300">
              {[
                ...(showEventColumn ? ["Мероприятие"] : []),
                "Компания",
                "Статус",
                "Площадь",
                "Оплата",
                "Документы",
                "",
              ].map((heading) => (
                <th key={heading || "actions"} className="text-left py-2 px-2 font-medium">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {participants.map((participant) => {
              const event = eventMap[participant.eventId];

              return (
                <tr key={participant.id} className="border-b border-gray-200">
                  {showEventColumn && (
                    <td className="py-2 px-2">
                      <Link
                        href={`/account/organizer/edit-event?id=${participant.eventId}&tab=participants`}
                        className="underline hover:text-gray-900"
                      >
                        {event?.title ?? participant.eventId}
                      </Link>
                    </td>
                  )}
                  <td className="py-2 px-2">
                    <Link
                      href={participantHref(participant)}
                      className="underline hover:text-gray-900"
                    >
                      {participant.name}
                    </Link>
                  </td>
                  <td className="py-2 px-2">
                    <Badge variant="outline">{participant.status}</Badge>
                  </td>
                  <td className="py-2 px-2">{participant.assignedSpace || "—"}</td>
                  <td className="py-2 px-2">{participant.paid ? "Оплачено" : "Не оплачено"}</td>
                  <td className="py-2 px-2">{participant.documents.length} док.</td>
                  <td className="py-2 px-2">
                    <Link href={participantHref(participant)}>
                      <Button size="sm" variant="ghost">
                        Карточка
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {participants.map((participant) => {
          const event = eventMap[participant.eventId];

          return (
            <Card key={participant.id}>
              {showEventColumn && event ? (
                <CardDescription className="mb-1">{event.title}</CardDescription>
              ) : null}
              <CardTitle className="text-base">{participant.name}</CardTitle>
              <CardDescription className="mt-2 space-y-1">
                <span className="block">{participant.status}</span>
                <span className="block">{participant.assignedSpace || "—"}</span>
                <span className="block">{participant.paid ? "Оплачено" : "Не оплачено"}</span>
              </CardDescription>
              <Link href={participantHref(participant)} className="inline-block mt-3">
                <Button size="sm" variant="outline">
                  Карточка
                </Button>
              </Link>
            </Card>
          );
        })}
      </div>
    </>
  );
}
