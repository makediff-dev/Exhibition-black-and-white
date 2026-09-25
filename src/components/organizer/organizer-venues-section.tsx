"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Building2, MapPin, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast-provider";
import { CITIES } from "@/constants/categories";
import { VENUE_CATALOG } from "@/constants/venues";
import { SEED_EVENTS } from "@/data/mocks/seed";
import type { VenueInquiry } from "@/data/types";
import { BookingSubjectCard } from "@/components/bookings/booking-subject-card";
import { StatusSummary } from "@/components/ui/status-summary";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { getInquiryStatus } from "@/lib/state/inquiry-machine";
import { getPrototypeNowDateIso } from "@/lib/time/now";
import { formatShortDate, pluralizeRu } from "@/lib/utils/formatters";
import {
  canSendVenueInquiry,
  buildGroupedVenueInquiries,
  countOrganizerEvents,
  listOrganizerInquiryEvents,
  toInquiryEventOption,
  type InquiryEventOption,
} from "@/lib/utils/organizer-venue-inquiry";
import { formatVenuePriceRange, getVenueStats } from "@/lib/utils/venue-stats";

export function OrganizerVenuesSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const user = useAuthStore((state) => state.user);
  const organizerEventDraft = usePrototypeStore((state) => state.organizerEventDraft);
  const venueInquiries = usePrototypeStore((state) => state.venueInquiries);
  const addVenueInquiries = usePrototypeStore((state) => state.addVenueInquiries);
  const selectVenueInquiry = usePrototypeStore((state) => state.selectVenueInquiry);
  const updateVenueInquiry = usePrototypeStore((state) => state.updateVenueInquiry);

  const organizerId = user?.id ?? "user-organizer";
  const eventIdFromUrl = searchParams.get("eventId");
  const selectableEvents = useMemo(
    () => listOrganizerInquiryEvents(SEED_EVENTS, organizerEventDraft, organizerId),
    [organizerEventDraft, organizerId],
  );
  const ownedEventCount = countOrganizerEvents(SEED_EVENTS, organizerId);

  const [selectedEventId, setSelectedEventId] = useState(
    eventIdFromUrl ?? selectableEvents[0]?.id ?? "",
  );
  const selectedEvent: InquiryEventOption | null = useMemo(() => {
    const fromList = selectableEvents.find((item) => item.id === selectedEventId);
    if (fromList) return fromList;
    const fromSeed = SEED_EVENTS.find((item) => item.id === selectedEventId);
    return fromSeed ? toInquiryEventOption(fromSeed) : null;
  }, [selectableEvents, selectedEventId]);

  const [city, setCity] = useState(selectedEvent?.city ?? organizerEventDraft?.city ?? "");
  const [dateFrom, setDateFrom] = useState(
    selectedEvent?.startDate ?? organizerEventDraft?.startDate ?? "",
  );
  const [dateTo, setDateTo] = useState(selectedEvent?.endDate ?? organizerEventDraft?.endDate ?? "");
  const [minArea, setMinArea] = useState("");
  const [requirements, setRequirements] = useState("");
  const [selectedVenueIds, setSelectedVenueIds] = useState<string[]>([]);
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [acceptId, setAcceptId] = useState<string | null>(null);

  useEffect(() => {
    if (eventIdFromUrl) setSelectedEventId(eventIdFromUrl);
  }, [eventIdFromUrl]);

  useEffect(() => {
    if (!selectedEvent) return;
    setCity(selectedEvent.city);
    setDateFrom(selectedEvent.startDate);
    setDateTo(selectedEvent.endDate);
  }, [selectedEvent]);

  const venues = useMemo(() => {
    return VENUE_CATALOG.map((venue) => ({
      venue,
      stats: getVenueStats(venue.id),
    })).filter(({ venue, stats }) => {
      if (city && venue.city !== city) return false;
      if (minArea && stats.totalArea < Number(minArea)) return false;
      return true;
    });
  }, [city, minArea]);

  const activeInquiries = useMemo(() => {
    if (!selectedEvent) return [];
    return venueInquiries.filter(
      (item) => item.eventDraftId === selectedEvent.id || item.eventId === selectedEvent.id,
    );
  }, [selectedEvent, venueInquiries]);

  const canSend = canSendVenueInquiry(selectedEvent);

  const toggleVenueSelection = (venueId: string) => {
    setSelectedVenueIds((prev) =>
      prev.includes(venueId) ? prev.filter((id) => id !== venueId) : [...prev, venueId],
    );
  };

  const sendInquiries = (venueIds: string[]) => {
    if (!selectedEvent) {
      setDraftModalOpen(true);
      return;
    }
    if (!canSend) {
      showToast("Для завершённого мероприятия запрос площадке отправить нельзя", "error");
      return;
    }
    if (!dateFrom || !dateTo) {
      showToast("Укажите даты проведения в фильтрах", "error");
      return;
    }
    if (venueIds.length === 0) {
      showToast("Выберите хотя бы одну площадку", "error");
      return;
    }

    const inquiries: VenueInquiry[] = buildGroupedVenueInquiries({
      venueIds,
      event: selectedEvent,
      organizerName: user?.name ?? "Организатор",
      dateFrom,
      dateTo,
      minArea: minArea || undefined,
      requirements: requirements || undefined,
      sentAt: getPrototypeNowDateIso(),
      resolveVenueName: (venueId) =>
        VENUE_CATALOG.find((item) => item.id === venueId)?.shortName ?? "Площадка",
    });

    addVenueInquiries(inquiries);
    setSelectedVenueIds([]);
    showToast(
      venueIds.length === 1
        ? "Запрос отправлен площадке"
        : `Запрос отправлен ${venueIds.length} площадкам`,
    );
  };

  const handleSingleRequest = (venueId: string) => {
    sendInquiries([venueId]);
  };

  const handleBulkRequest = () => {
    sendInquiries(selectedVenueIds);
  };

  const handleSelectVenue = (inquiryId: string) => {
    setAcceptId(inquiryId);
  };

  const confirmAccept = () => {
    if (!acceptId) return;
    const ok = selectVenueInquiry(acceptId);
    if (!ok) {
      showToast("Нельзя закрепить площадку: нет предложения или зал занят", "error");
      return;
    }
    setAcceptId(null);
    showToast("Площадка закреплена, бронирования стали источником дат", "success");
  };

  return (
    <div className="space-y-6 w-full">
      <Card className="bg-gray-50">
        <CardTitle className="text-sm">Как работает запрос к площадке</CardTitle>
        <CardDescription className="mt-2 leading-relaxed">
          Выберите существующий черновик или предстоящее мероприятие — либо откройте эту
          страницу с конкретным событием. Затем отправьте запрос выбранным площадкам на
          нужные даты. Групповой запрос создаёт одну заявку события и отдельные предложения
          площадок. После ответов вы закрепляете одну площадку.
        </CardDescription>
      </Card>

      <Card className="sticky top-20 z-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-3">
            <CardTitle className="text-sm">Контекст запроса</CardTitle>
            {selectableEvents.length > 0 ? (
              <Select
                label="Мероприятие"
                value={selectedEventId}
                onChange={(event) => setSelectedEventId(event.target.value)}
                options={selectableEvents.map((item) => ({
                  value: item.id,
                  label: `${item.title} · ${item.kind === "draft" ? "черновик" : "предстоит"}`,
                }))}
              />
            ) : (
              <CardDescription>
                Подходящего черновика или будущего мероприятия нет.
                {ownedEventCount > 0
                  ? ` В кабинете уже есть ${ownedEventCount} событий в архиве или завершённых — для запроса нужна будущая или черновая карточка.`
                  : " Создайте карточку нового мероприятия, чтобы отправить запрос."}
              </CardDescription>
            )}
            {selectedEvent ? (
              <CardDescription>
                {selectedEvent.title} · {city || selectedEvent.city}
                {dateFrom && dateTo
                  ? ` · ${formatShortDate(dateFrom)} — ${formatShortDate(dateTo)}`
                  : ""}
                {minArea ? ` · от ${minArea} кв.м` : ""}
                {requirements ? ` · ${requirements}` : ""}
              </CardDescription>
            ) : null}
            {selectedEvent?.kind === "completed" ? (
              <p className="text-sm text-gray-700">
                Мероприятие завершено — новый запрос площадке отправить нельзя.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/account/organizer/create-event">
              <Button size="sm" variant="outline">
                Создать мероприятие
              </Button>
            </Link>
            {selectedEvent && selectedEvent.kind !== "draft" ? (
              <Link href={`/account/organizer/edit-event?id=${selectedEvent.id}`}>
                <Button size="sm" variant="outline">
                  Карточка события
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          label="Город"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          options={[
            { value: "", label: "Все города" },
            ...CITIES.map((item) => ({ value: item, label: item })),
          ]}
        />
        <Input
          label="Дата с"
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
        />
        <Input
          label="Дата по"
          type="date"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
        />
        <Input
          label="Площадь от, кв.м"
          type="number"
          min={0}
          value={minArea}
          onChange={(event) => setMinArea(event.target.value)}
          placeholder="1200"
        />
      </div>
      <Input
        label="Требования к площадке"
        value={requirements}
        onChange={(event) => setRequirements(event.target.value)}
        placeholder="Зал от 1200 кв.м, мощность от 200 кВт, ночная разгрузка"
      />

      {selectedVenueIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 cabinet-card border border-gray-300 bg-gray-50 p-4">
          <p className="text-sm text-gray-700">
            Выбрано площадок: <strong>{selectedVenueIds.length}</strong>
          </p>
          <Button onClick={handleBulkRequest} disabled={!canSend}>
            Отправить запрос выбранным площадкам
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {venues.map(({ venue, stats }) => {
          const photo = stats.photos[0];
          const isSelected = selectedVenueIds.includes(venue.id);
          const inquiry = activeInquiries.find((item) => item.venueId === venue.id);

          return (
            <Card
              key={venue.id}
              flush
              className={`cabinet-card h-full overflow-hidden flex flex-col ${
                isSelected ? "border-gray-900 ring-1 ring-gray-900" : ""
              }`}
            >
              <div className="h-36 bg-gray-100 border-b border-gray-200 flex items-center justify-center text-xs text-gray-500 px-4 text-center">
                {photo?.title ?? "Фото площадки"}
              </div>

              <div className="p-4 flex flex-col flex-1 min-w-0">
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleVenueSelection(venue.id)}
                    className="h-4 w-4 shrink-0"
                  />
                  <span className="text-xs text-gray-600 leading-none">
                    Выбрать для группового запроса
                  </span>
                </label>

                <CardTitle className="text-base leading-snug">{venue.shortName}</CardTitle>
                <CardDescription className="mt-1 line-clamp-2">{venue.legalName}</CardDescription>

                <div className="mt-3 space-y-2 text-sm text-gray-700 flex-1">
                  <p className="flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>{venue.address}</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <Building2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>
                      {pluralizeRu(stats.pavilions.length, ["павильон", "павильона", "павильонов"])}
                      {" · "}
                      {pluralizeRu(stats.halls.length, ["зал", "зала", "залов"])}
                    </span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <Maximize2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>
                      {stats.totalArea.toLocaleString("ru-RU")} кв.м · свободно залов:{" "}
                      {stats.freeHalls}
                    </span>
                  </p>
                  <p className="text-gray-900 font-medium">
                    {formatVenuePriceRange(stats.priceMin, stats.priceMax)}
                  </p>
                  <p className="text-xs text-gray-600">
                    Загрузка {stats.occupancyPercent}%
                    {stats.preliminaryOccupancyPercent > 0
                      ? ` · предварительно ${stats.preliminaryOccupancyPercent}%`
                      : ""}
                    {" · "}
                    занято {stats.occupiedArea.toLocaleString("ru-RU")} кв.м, свободно{" "}
                    {stats.freeArea.toLocaleString("ru-RU")} кв.м
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                    {venue.description}
                  </p>
                </div>

                {inquiry ? (
                  <div className="mt-4 cabinet-card border border-gray-300 bg-gray-50 p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">Запрос отправлен</span>
                      <Badge variant={inquiry.status === "selected" ? "solid" : "outline"}>
                        {getInquiryStatus(inquiry, user).label}
                      </Badge>
                    </div>
                    {inquiry.proposalSummary ? (
                      <p className="text-gray-600 leading-relaxed">{inquiry.proposalSummary}</p>
                    ) : null}
                    {inquiry.proposalPrice ? (
                      <p className="text-gray-900 font-medium">{inquiry.proposalPrice}</p>
                    ) : null}
                    {(inquiry.status === "proposal_received" || inquiry.status === "changes_proposed") ? (
                      <Button size="sm" className="w-full" onClick={() => handleSelectVenue(inquiry.id)}>
                        Принять предложение
                      </Button>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col gap-2">
                  <Button size="sm" variant="outline" className="w-full">
                    Показать на карте
                  </Button>
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={!canSend}
                    onClick={() => handleSingleRequest(venue.id)}
                  >
                    Сделать запрос
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {activeInquiries.length > 0 ? (
        <Card>
          <CardTitle className="text-sm">Запросы площадкам</CardTitle>
          <CardDescription className="mt-2 mb-4">
            Одна история запросов: и вы, и площадка видите один статус и кто ходит следующим.
          </CardDescription>
          <div className="space-y-3">
            {activeInquiries.map((inquiry) => {
              const lifecycle = getInquiryStatus(inquiry, user);
              return (
              <div key={inquiry.id} className="cabinet-card border border-gray-300 p-4 text-sm space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{inquiry.venueName}</p>
                  <Badge variant={inquiry.status === "selected" ? "solid" : "outline"}>
                    {lifecycle.label}
                  </Badge>
                </div>
                <StatusSummary status={lifecycle} />
                <p className="text-gray-600">
                  {formatShortDate(inquiry.dateFrom)} — {formatShortDate(inquiry.dateTo)}
                  {inquiry.minArea ? ` · от ${inquiry.minArea} кв.м` : ""}
                </p>
                {(inquiry.status === "proposal_received" || inquiry.status === "changes_proposed") && (
                  <>
                    <BookingSubjectCard inquiry={inquiry} />
                    <Button size="sm" className="mt-1" onClick={() => handleSelectVenue(inquiry.id)}>
                      Принять предложение
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        updateVenueInquiry(inquiry.id, {
                          status: "declined",
                          declineReason: "Организатор отклонил условия",
                        })
                      }
                    >
                      Отклонить
                    </Button>
                  </>
                )}
              </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      <Modal
        open={draftModalOpen}
        onClose={() => setDraftModalOpen(false)}
        title="Нужна карточка будущего мероприятия"
        footer={
          <>
            <Button variant="outline" onClick={() => setDraftModalOpen(false)}>
              Закрыть
            </Button>
            <Button
              onClick={() => {
                setDraftModalOpen(false);
                router.push("/account/organizer/create-event");
              }}
            >
              Создать мероприятие
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-700 leading-relaxed">
          Запрос привязывается к черновику или предстоящему мероприятию. Если подходящего события
          нет, создайте новое — это не значит, что в кабинете нет других карточек.
        </p>
      </Modal>
      <Modal
        open={Boolean(acceptId)}
        onClose={() => setAcceptId(null)}
        title="Подтверждение брони"
        footer={
          <>
            <Button variant="outline" onClick={() => setAcceptId(null)}>
              Назад
            </Button>
            <Button onClick={confirmAccept}>Закрепить площадку</Button>
          </>
        }
      >
        {acceptId ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              После принятия это бронирование станет источником площадки и дат мероприятия.
              Счёт — согласие, не денежный резерв.
            </p>
            <BookingSubjectCard
              inquiry={venueInquiries.find((item) => item.id === acceptId)}
            />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}