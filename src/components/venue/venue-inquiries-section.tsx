"use client";

import { useState } from "react";
import { BookingSubjectCard } from "@/components/bookings/booking-subject-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusSummary } from "@/components/ui/status-summary";
import { SEED_HALLS } from "@/data/mocks/seed";
import type { VenueInquiry } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { getInquiryStatus } from "@/lib/state/inquiry-machine";
import { getPrototypeNowDateIso } from "@/lib/time/now";
import { formatShortDate } from "@/lib/utils/formatters";

interface Props {
  venueId: string;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export function VenueInquiriesSection({ venueId, showToast }: Props) {
  const user = useAuthStore((state) => state.user);
  const inquiries = usePrototypeStore((state) => state.venueInquiries);
  const updateVenueInquiry = usePrototypeStore((state) => state.updateVenueInquiry);
  const venueInquiries = inquiries.filter((item) => item.venueId === venueId);
  const halls = SEED_HALLS.filter((hall) => hall.venueId === venueId && hall.available);
  const today = getPrototypeNowDateIso();

  const [hallId, setHallId] = useState(halls[0]?.id ?? "");
  const [price, setPrice] = useState("850000");
  const [rejectReason, setRejectReason] = useState("");
  const [altHallId, setAltHallId] = useState(halls[1]?.id ?? halls[0]?.id ?? "");
  const [altFrom, setAltFrom] = useState("");
  const [altTo, setAltTo] = useState("");

  if (venueInquiries.length === 0) return null;

  const respond = (inquiry: VenueInquiry, next: VenueInquiry["status"]) => {
    const history = [
      ...(inquiry.history ?? []),
      { date: today, actor: "venue", action: next },
    ];

    if (next === "proposal_received") {
      updateVenueInquiry(inquiry.id, {
        status: "proposal_received",
        hallId,
        proposalPrice: `${Number(price).toLocaleString("ru-RU")} ₽`,
        proposalSummary: `Зал ${SEED_HALLS.find((hall) => hall.id === hallId)?.name ?? hallId}`,
        holdUntil: inquiry.holdUntil ?? today,
        cancellationTerms:
          inquiry.cancellationTerms ?? "Бесплатная отмена за 21 день до монтажа, далее удержание 30%.",
        history,
      });
      showToast("Предложение отправлено организатору", "success");
      return;
    }

    if (next === "changes_proposed") {
      updateVenueInquiry(inquiry.id, {
        status: "changes_proposed",
        alternativeHallId: altHallId,
        alternativeDateFrom: altFrom || inquiry.dateFrom,
        alternativeDateTo: altTo || inquiry.dateTo,
        changeReason: rejectReason || "Предлагаем другой зал или даты",
        history,
      });
      showToast("Альтернатива отправлена организатору", "success");
      return;
    }

    if (next === "declined") {
      if (!rejectReason.trim()) {
        showToast("Укажите причину отклонения", "error");
        return;
      }
      updateVenueInquiry(inquiry.id, {
        status: "declined",
        declineReason: rejectReason,
        alternativeHallId: altHallId || undefined,
        alternativeDateFrom: altFrom || undefined,
        alternativeDateTo: altTo || undefined,
        history,
      });
      showToast("Запрос отклонён", "success");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Запросы организаторов</h2>
      {venueInquiries.map((inquiry) => {
        const lifecycle = getInquiryStatus(inquiry, user);
        return (
          <Card key={inquiry.id} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-sm">
                {inquiry.eventTitle ?? "Черновик мероприятия"}
              </CardTitle>
              <Badge variant="outline">{lifecycle.label}</Badge>
            </div>
            <CardDescription>
              {inquiry.organizerName ?? "Организатор"} · {formatShortDate(inquiry.dateFrom)} —{" "}
              {formatShortDate(inquiry.dateTo)}
              {inquiry.minArea ? ` · от ${inquiry.minArea} кв.м` : ""}
            </CardDescription>
            <StatusSummary status={lifecycle} />
            {(inquiry.status === "proposal_received" ||
              inquiry.status === "changes_proposed" ||
              inquiry.status === "selected") && <BookingSubjectCard inquiry={inquiry} />}
            {lifecycle.allowedActions.includes("propose_inquiry") && (
              <div className="grid sm:grid-cols-2 gap-3">
                <Select
                  label="Зал"
                  value={hallId}
                  onChange={(event) => setHallId(event.target.value)}
                  options={halls.map((hall) => ({
                    value: hall.id,
                    label: `${hall.name} · ${hall.area} кв.м`,
                  }))}
                />
                <Input
                  label="Цена предложения, ₽"
                  type="number"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                />
              </div>
            )}
            {(lifecycle.allowedActions.includes("reject_inquiry") ||
              lifecycle.allowedActions.includes("propose_changes")) && (
              <>
                <Textarea
                  label="Причина отказа или комментарий к альтернативе"
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  placeholder="Зал занят в эти даты, доступен зал 2 с 8 апреля"
                />
                <div className="grid sm:grid-cols-3 gap-3">
                  <Select
                    label="Альтернативный зал"
                    value={altHallId}
                    onChange={(event) => setAltHallId(event.target.value)}
                    options={halls.map((hall) => ({ value: hall.id, label: hall.name }))}
                  />
                  <Input
                    label="Альт. дата с"
                    type="date"
                    value={altFrom}
                    onChange={(event) => setAltFrom(event.target.value)}
                  />
                  <Input
                    label="Альт. дата по"
                    type="date"
                    value={altTo}
                    onChange={(event) => setAltTo(event.target.value)}
                  />
                </div>
              </>
            )}
            <div className="flex flex-wrap gap-2">
              {lifecycle.allowedActions.includes("propose_inquiry") && (
                <Button size="sm" onClick={() => respond(inquiry, "proposal_received")}>
                  Принять и отправить условия
                </Button>
              )}
              {lifecycle.allowedActions.includes("propose_changes") && (
                <Button size="sm" variant="outline" onClick={() => respond(inquiry, "changes_proposed")}>
                  Предложить изменения
                </Button>
              )}
              {lifecycle.allowedActions.includes("reject_inquiry") && (
                <Button size="sm" variant="ghost" onClick={() => respond(inquiry, "declined")}>
                  Отклонить
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
