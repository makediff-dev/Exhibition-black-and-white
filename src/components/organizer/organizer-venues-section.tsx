"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
import {
  SEED_HALLS,
  SEED_PAVILIONS,
  SEED_VENUE_PROFILE_MEDIA,
  SEED_VENUE_SPACE_BLOCKS,
} from "@/data/mocks/seed";
import type { VenueInquiry } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { formatPrice, formatShortDate } from "@/lib/utils/formatters";

function getVenueStats(venueId: string) {
  const halls = SEED_HALLS.filter((hall) => hall.venueId === venueId);
  const pavilions = SEED_PAVILIONS.filter((pavilion) => pavilion.venueId === venueId);
  const blocks = SEED_VENUE_SPACE_BLOCKS.filter((block) => block.venueId === venueId);
  const photos = SEED_VENUE_PROFILE_MEDIA.filter(
    (item) => item.venueId === venueId && item.type === "photo",
  );
  const prices = blocks.length
    ? blocks.map((block) => block.pricePerSqm)
    : halls.map((hall) => Math.round(1800 + hall.area / 10));

  return {
    halls,
    pavilions,
    photos,
    totalArea: halls.reduce((sum, hall) => sum + hall.area, 0),
    priceMin: Math.min(...prices),
    priceMax: Math.max(...prices),
    freeHalls: halls.filter((hall) => hall.available).length,
  };
}

function buildDemoProposal(venueName: string, minArea: string) {
  const areaHint = minArea ? ` от ${minArea} кв.м` : "";
  return {
    proposalSummary: `${venueName} готова рассмотреть проведение мероприятия${areaHint}. Предварительно доступны залы под запрошенные даты.`,
    proposalPrice: "2 200 – 4 500 ₽ / кв.м",
  };
}

export function OrganizerVenuesSection() {
  const router = useRouter();
  const { showToast } = useToast();
  const organizerEventDraft = usePrototypeStore((state) => state.organizerEventDraft);
  const venueInquiries = usePrototypeStore((state) => state.venueInquiries);
  const addVenueInquiries = usePrototypeStore((state) => state.addVenueInquiries);
  const selectVenueInquiry = usePrototypeStore((state) => state.selectVenueInquiry);

  const [city, setCity] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minArea, setMinArea] = useState("");
  const [selectedVenueIds, setSelectedVenueIds] = useState<string[]>([]);
  const [draftModalOpen, setDraftModalOpen] = useState(false);

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
    if (!organizerEventDraft) return [];
    return venueInquiries.filter((item) => item.eventDraftId === organizerEventDraft.id);
  }, [organizerEventDraft, venueInquiries]);

  const toggleVenueSelection = (venueId: string) => {
    setSelectedVenueIds((prev) =>
      prev.includes(venueId) ? prev.filter((id) => id !== venueId) : [...prev, venueId],
    );
  };

  const sendInquiries = (venueIds: string[]) => {
    if (!organizerEventDraft) {
      setDraftModalOpen(true);
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

    const inquiries: VenueInquiry[] = venueIds.map((venueId) => {
      const venue = VENUE_CATALOG.find((item) => item.id === venueId);
      const proposal = buildDemoProposal(venue?.shortName ?? "Площадка", minArea);

      return {
        id: `vi-${venueId}-${Date.now()}`,
        eventDraftId: organizerEventDraft.id,
        venueId,
        venueName: venue?.shortName ?? "Площадка",
        dateFrom,
        dateTo,
        minArea: minArea || undefined,
        status: "proposal_received",
        sentAt: new Date().toISOString(),
        ...proposal,
      };
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
    selectVenueInquiry(inquiryId);
    showToast("Площадка выбрана. Можно переходить к управлению проектом", "success");
  };

  return (
    <div className="space-y-6 w-full">
      <Card className="bg-gray-50">
        <CardTitle className="text-sm">Как работает запрос к площадке</CardTitle>
        <CardDescription className="mt-2 leading-relaxed">
          Сначала заполните карточку нового мероприятия. Затем отправьте запрос выбранным
          площадкам на нужные даты — можно выбрать сразу несколько. Площадки пришлют
          предложения, после чего вы выбираете лучшие условия и только тогда официально
          закрепляете площадку для проекта.
        </CardDescription>
      </Card>

      {organizerEventDraft ? (
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-sm">Черновик мероприятия</CardTitle>
              <CardDescription className="mt-2">
                {organizerEventDraft.title} · {organizerEventDraft.city}
                {organizerEventDraft.startDate && organizerEventDraft.endDate
                  ? ` · ${formatShortDate(organizerEventDraft.startDate)} — ${formatShortDate(organizerEventDraft.endDate)}`
                  : null}
              </CardDescription>
              {organizerEventDraft.selectedVenueName ? (
                <p className="mt-2 text-sm text-gray-900">
                  Выбранная площадка: <strong>{organizerEventDraft.selectedVenueName}</strong>
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/account/organizer/create-event">
                <Button size="sm" variant="outline">
                  Редактировать мероприятие
                </Button>
              </Link>
              {organizerEventDraft.selectedVenueId ? (
                <Link href="/account/organizer/events">
                  <Button size="sm">Управление проектом</Button>
                </Link>
              ) : null}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardTitle className="text-sm">Сначала создайте мероприятие</CardTitle>
          <CardDescription className="mt-2">
            Без карточки мероприятия запрос площадке отправить нельзя — сначала заполните
            основные параметры события.
          </CardDescription>
          <Link href="/account/organizer/create-event" className="inline-block mt-3">
            <Button size="sm">Создать мероприятие</Button>
          </Link>
        </Card>
      )}

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

      {selectedVenueIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-gray-300 bg-gray-50 p-4">
          <p className="text-sm text-gray-700">
            Выбрано площадок: <strong>{selectedVenueIds.length}</strong>
          </p>
          <Button onClick={handleBulkRequest}>
            Отправить запрос выбранным площадкам
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {venues.map(({ venue, stats }) => {
          const photo = stats.photos[0];
          const isSelected = selectedVenueIds.includes(venue.id);
          const inquiry = activeInquiries.find((item) => item.venueId === venue.id);

          return (
            <Card
              key={venue.id}
              className={`h-full overflow-hidden p-0 flex flex-col ${
                isSelected ? "border-gray-900 ring-1 ring-gray-900" : ""
              }`}
            >
              <div className="h-36 bg-gray-100 border-b border-gray-200 flex items-center justify-center text-xs text-gray-500 px-4 text-center">
                {photo?.title ?? "Фото площадки"}
              </div>

              <div className="p-4 flex flex-col flex-1">
                <label className="flex items-start gap-2 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleVenueSelection(venue.id)}
                    className="mt-1"
                  />
                  <span className="text-xs text-gray-600">Выбрать для группового запроса</span>
                </label>

                <CardTitle className="text-base leading-snug">{venue.shortName}</CardTitle>
                <CardDescription className="mt-1">{venue.legalName}</CardDescription>

                <div className="mt-3 space-y-2 text-sm text-gray-700 flex-1">
                  <p className="flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    {venue.address}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    {stats.pavilions.length} павильонов · {stats.halls.length} залов
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Maximize2 className="h-3.5 w-3.5 shrink-0" />
                    {stats.totalArea.toLocaleString("ru-RU")} кв.м · свободно залов:{" "}
                    {stats.freeHalls}
                  </p>
                  <p className="text-gray-900 font-medium">
                    {formatPrice(stats.priceMin)} — {formatPrice(stats.priceMax)} / кв.м
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">{venue.description}</p>
                </div>

                {inquiry ? (
                  <div className="mt-4 border border-gray-300 bg-gray-50 p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">Запрос отправлен</span>
                      <Badge variant={inquiry.status === "selected" ? "solid" : "outline"}>
                        {inquiry.status === "selected"
                          ? "Площадка выбрана"
                          : inquiry.status === "proposal_received"
                            ? "Есть предложение"
                            : "Ожидает ответа"}
                      </Badge>
                    </div>
                    {inquiry.proposalSummary ? (
                      <p className="text-gray-600 leading-relaxed">{inquiry.proposalSummary}</p>
                    ) : null}
                    {inquiry.proposalPrice ? (
                      <p className="text-gray-900 font-medium">{inquiry.proposalPrice}</p>
                    ) : null}
                    {inquiry.status === "proposal_received" ? (
                      <Button size="sm" className="w-full" onClick={() => handleSelectVenue(inquiry.id)}>
                        Выбрать площадку
                      </Button>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="flex-1 min-w-[140px]">
                    Показать на карте
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 min-w-[140px]"
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
            Сравните предложения и выберите площадку с лучшими условиями — только после этого
            начнётся этап управления проектом.
          </CardDescription>
          <div className="space-y-3">
            {activeInquiries.map((inquiry) => (
              <div key={inquiry.id} className="border border-gray-300 p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{inquiry.venueName}</p>
                  <Badge variant={inquiry.status === "selected" ? "solid" : "outline"}>
                    {inquiry.status === "selected"
                      ? "Выбрана"
                      : inquiry.status === "proposal_received"
                        ? "Предложение получено"
                        : inquiry.status === "declined"
                          ? "Отклонена"
                          : "Ожидает ответа"}
                  </Badge>
                </div>
                <p className="mt-2 text-gray-600">
                  {formatShortDate(inquiry.dateFrom)} — {formatShortDate(inquiry.dateTo)}
                  {inquiry.minArea ? ` · от ${inquiry.minArea} кв.м` : ""}
                </p>
                {inquiry.proposalSummary ? (
                  <p className="mt-2 text-gray-700">{inquiry.proposalSummary}</p>
                ) : null}
                {inquiry.proposalPrice ? (
                  <p className="mt-1 font-medium">{inquiry.proposalPrice}</p>
                ) : null}
                {inquiry.status === "proposal_received" ? (
                  <Button size="sm" className="mt-3" onClick={() => handleSelectVenue(inquiry.id)}>
                    Выбрать площадку
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Modal
        open={draftModalOpen}
        onClose={() => setDraftModalOpen(false)}
        title="Сначала создайте мероприятие"
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
          Чтобы отправить запрос площадке на выбранные даты, сначала заполните карточку нового
          мероприятия. После этого вы сможете выбрать одну или несколько площадок и дождаться их
          предложений.
        </p>
      </Modal>
    </div>
  );
}
