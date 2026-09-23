import { Card, CardTitle } from "@/components/ui/card";
import { CardField } from "@/components/ui/card-field";
import { SEED_HALLS } from "@/data/mocks/seed";
import type { Booking, VenueInquiry } from "@/data/types";
import { resolveInquirySchedule } from "@/lib/utils/bookings-from-inquiry";
import { formatShortDate } from "@/lib/utils/formatters";

function hallFacts(hallId?: string) {
  return SEED_HALLS.find((hall) => hall.id === hallId);
}

export function BookingSubjectCard({
  inquiry,
  booking,
}: {
  inquiry?: VenueInquiry;
  booking?: Booking;
}) {
  const schedule = inquiry ? resolveInquirySchedule(inquiry) : undefined;
  const hall = hallFacts(schedule?.hallId ?? booking?.hallId);
  const eventTitle = inquiry?.eventTitle ?? "Мероприятие";
  const parties = `${inquiry?.organizerName ?? booking?.organizerName ?? "Организатор"} · ${inquiry?.venueName ?? "Площадка"}`;
  const start = schedule?.dateFrom ?? booking?.periodStart ?? booking?.date;
  const end = schedule?.dateTo ?? booking?.periodEnd ?? start;
  const hold = inquiry?.holdUntil ?? booking?.holdUntil;
  const cancel = inquiry?.cancellationTerms ?? booking?.cancellationTerms;

  return (
    <Card className="space-y-3">
      <CardTitle className="text-sm">Предмет брони до подтверждения</CardTitle>
      <div className="space-y-[10px]">
        <CardField label="Мероприятие и стороны">
          {eventTitle}. {parties}
        </CardField>
        <CardField label="Зал">
          {hall
            ? `${hall.name} · ${hall.area.toLocaleString("ru-RU")} кв.м · ${hall.widthMeters ?? "—"}×${hall.lengthMeters ?? "—"} м · ${hall.planCoords ?? "координаты на плане уточняются"}`
            : "Зал не выбран"}
        </CardField>
        <CardField label="Проведение">
          {start ? `${formatShortDate(start)} — ${formatShortDate(end ?? start)}` : "даты не заданы"}
        </CardField>
        {inquiry && (
          <CardField label="Монтаж / демонтаж">
            {inquiry.setupStart
              ? `${formatShortDate(inquiry.setupStart)} — ${formatShortDate(inquiry.setupEnd ?? inquiry.setupStart)}`
              : "2 дня до открытия"}
            {" / "}
            {inquiry.teardownStart
              ? `${formatShortDate(inquiry.teardownStart)} — ${formatShortDate(inquiry.teardownEnd ?? inquiry.teardownStart)}`
              : "2 дня после закрытия"}
          </CardField>
        )}
        <CardField label="Мощность и ограничения">
          {hall ? `${hall.powerKw ?? "—"} кВт. ${hall.constraints ?? ""}` : "—"}
        </CardField>
        <CardField label="Цена">{inquiry?.proposalPrice ?? "после расчёта площадки"}</CardField>
        <CardField label="Удержание оффера">{hold ? `до ${formatShortDate(hold)}` : "не указано"}</CardField>
        <CardField label="Отмена">{cancel ?? "по регламенту площадки"}</CardField>
      </div>
    </Card>
  );
}
