"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast-provider";
import { OrganizerParticipantsList } from "@/components/organizer/organizer-participants-list";
import { OrganizerEventServicesPanel } from "@/components/organizer/organizer-event-services-panel";
import { OrganizerEventBookingsPanel } from "@/components/organizer/organizer-event-bookings-panel";
import { OrganizerEventRecommendedPartnersPanel } from "@/components/organizer/organizer-event-recommended-partners-panel";
import { CITIES } from "@/constants/categories";
import { VENUE_CATALOG } from "@/constants/venues";
import { SEED_EVENTS } from "@/data/mocks/seed";
import type { Event } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";

const CATEGORY_OPTIONS = [
  { value: "exhibition", label: "Выставка" },
  { value: "forum", label: "Форум" },
  { value: "conference", label: "Конференция" },
];

const INDUSTRY_OPTIONS = [
  { value: "furniture", label: "Мебель и интерьер" },
  { value: "it", label: "IT и технологии" },
  { value: "food", label: "Продукты питания" },
  { value: "fashion", label: "Мода и текстиль" },
  { value: "industry", label: "Промышленность" },
];

const VENUE_OPTIONS = VENUE_CATALOG.map((venue) => ({
  value: venue.id,
  label: venue.shortName,
}));

interface FormState {
  title: string;
  category: Event["category"];
  industry: string;
  description: string;
  city: string;
  venueId: string;
  startDate: string;
  endDate: string;
  assemblyStart: string;
  assemblyEnd: string;
  dismantlingStart: string;
  dismantlingEnd: string;
  participationTerms: string;
  participantInfo: string;
  participantMemo: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  category: "exhibition",
  industry: "furniture",
  description: "",
  city: "Москва",
  venueId: "",
  startDate: "",
  endDate: "",
  assemblyStart: "",
  assemblyEnd: "",
  dismantlingStart: "",
  dismantlingEnd: "",
  participationTerms: "",
  participantInfo: "",
  participantMemo: "",
};

function mapEventToForm(event: Event): FormState {
  const industryValue =
    INDUSTRY_OPTIONS.find((option) => option.label === event.industry)?.value ?? "furniture";

  return {
    title: event.title,
    category: event.category,
    industry: industryValue,
    description: event.description,
    city: event.city,
    venueId: event.venueId ?? "venue-1",
    startDate: event.startDate,
    endDate: event.endDate,
    assemblyStart: "",
    assemblyEnd: "",
    dismantlingStart: "",
    dismantlingEnd: "",
    participationTerms: event.participationTerms,
    participantInfo: "",
    participantMemo: "",
  };
}

interface Props {
  mode: "create" | "edit";
  initialTab?: "event" | "participants" | "services" | "bookings";
  forcedEventId?: string;
}

type EventFormTab = "event" | "participants" | "services" | "bookings";

export function OrganizerEventFormSection({
  mode,
  initialTab = "event",
  forcedEventId,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const participants = usePrototypeStore((state) => state.participants);
  const organizerEventServices = usePrototypeStore((state) => state.organizerEventServices);
  const bookings = usePrototypeStore((state) => state.bookings);
  const organizerEventDraft = usePrototypeStore((state) => state.organizerEventDraft);
  const setOrganizerEventDraft = usePrototypeStore((state) => state.setOrganizerEventDraft);
  const eventId = searchParams.get("id") ?? forcedEventId ?? null;
  const tabFromQuery = searchParams.get("tab");
  const fromMessages = searchParams.get("from") === "messages";

  const existingEvent = useMemo(
    () => (eventId ? SEED_EVENTS.find((event) => event.id === eventId) : undefined),
    [eventId]
  );

  const participantCount = useMemo(() => {
    if (!eventId) return 0;
    return participants.filter((participant) => participant.eventId === eventId).length;
  }, [participants, eventId]);

  const eventParticipants = useMemo(() => {
    if (!eventId) return [];
    return participants.filter((participant) => participant.eventId === eventId);
  }, [participants, eventId]);

  const serviceCount = useMemo(() => {
    if (!eventId) return 0;
    return organizerEventServices.filter((service) => service.eventId === eventId).length;
  }, [organizerEventServices, eventId]);

  const bookingCount = useMemo(() => {
    if (!eventId) return 0;
    return bookings.filter((booking) => booking.eventId === eventId).length;
  }, [bookings, eventId]);

  const pendingBookingCount = useMemo(() => {
    if (!eventId) return 0;
    return bookings.filter(
      (booking) => booking.eventId === eventId && booking.status === "pending"
    ).length;
  }, [bookings, eventId]);

  const resolveInitialTab = (): EventFormTab => {
    if (tabFromQuery === "participants" || initialTab === "participants") return "participants";
    if (tabFromQuery === "services" || initialTab === "services") return "services";
    if (tabFromQuery === "bookings" || initialTab === "bookings") return "bookings";
    return "event";
  };

  const [activeTab, setActiveTab] = useState<EventFormTab>(resolveInitialTab());
  const [participantQuery, setParticipantQuery] = useState("");

  const filteredEventParticipants = useMemo(() => {
    const normalizedQuery = participantQuery.trim().toLowerCase();
    if (!normalizedQuery) return eventParticipants;

    return eventParticipants.filter(
      (participant) =>
        participant.name.toLowerCase().includes(normalizedQuery) ||
        participant.status.toLowerCase().includes(normalizedQuery) ||
        (participant.assignedSpace ?? "").toLowerCase().includes(normalizedQuery)
    );
  }, [eventParticipants, participantQuery]);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const ensureDraftEventId = (): string => {
    if (eventId) return eventId;
    if (organizerEventDraft?.id) return organizerEventDraft.id;

    const industryLabel =
      INDUSTRY_OPTIONS.find((option) => option.value === form.industry)?.label ?? form.industry;

    const newId = `event-draft-${Date.now()}`;
    setOrganizerEventDraft({
      id: newId,
      title: form.title.trim() || "Черновик",
      category: form.category,
      industry: industryLabel,
      description: form.description,
      city: form.city,
      startDate: form.startDate,
      endDate: form.endDate,
      participationTerms: form.participationTerms,
      selectedVenueId: organizerEventDraft?.selectedVenueId,
      selectedVenueName: organizerEventDraft?.selectedVenueName,
    });
    return newId;
  };

  useEffect(() => {
    if (tabFromQuery === "participants") {
      setActiveTab("participants");
    } else if (tabFromQuery === "services") {
      setActiveTab("services");
    } else if (tabFromQuery === "bookings") {
      setActiveTab("bookings");
    }
  }, [tabFromQuery]);

  useEffect(() => {
    if (mode === "edit" && existingEvent) {
      setForm(mapEventToForm(existingEvent));
      return;
    }
    if (mode === "create" && organizerEventDraft) {
      const industryValue =
        INDUSTRY_OPTIONS.find((option) => option.label === organizerEventDraft.industry)?.value ??
        organizerEventDraft.industry;

      setForm({
        title: organizerEventDraft.title,
        category: organizerEventDraft.category,
        industry: industryValue,
        description: organizerEventDraft.description,
        city: organizerEventDraft.city,
        venueId: organizerEventDraft.selectedVenueId ?? "",
        startDate: organizerEventDraft.startDate,
        endDate: organizerEventDraft.endDate,
        assemblyStart: "",
        assemblyEnd: "",
        dismantlingStart: "",
        dismantlingEnd: "",
        participationTerms: organizerEventDraft.participationTerms ?? "",
        participantInfo: "",
        participantMemo: "",
      });
    }
  }, [mode, existingEvent, organizerEventDraft]);

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveDraft = () => {
    if (!form.title.trim()) {
      showToast("Укажите название мероприятия", "error");
      return;
    }

    const industryLabel =
      INDUSTRY_OPTIONS.find((option) => option.value === form.industry)?.label ?? form.industry;

    setOrganizerEventDraft({
      id: organizerEventDraft?.id ?? `event-draft-${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      industry: industryLabel,
      description: form.description,
      city: form.city,
      startDate: form.startDate,
      endDate: form.endDate,
      participationTerms: form.participationTerms,
      selectedVenueId: organizerEventDraft?.selectedVenueId,
      selectedVenueName: organizerEventDraft?.selectedVenueName,
    });

    showToast("Черновик сохранён. Теперь можно отправить запрос площадкам", "success");
    router.push("/account/organizer/venues");
  };

  const handlePublish = () => {
    showToast(
      mode === "edit"
        ? "Изменения отправлены на публикацию"
        : "Мероприятие отправлено на публикацию",
      "success"
    );
    router.push("/account/organizer/events");
  };

  return (
    <div className="space-y-6 w-full">
      <div className="space-y-2">
        <BackButton fallbackHref={fromMessages ? "/messages" : "/account/organizer/events"} />
        {mode === "edit" && (existingEvent?.title || form.title) ? (
          <h1 className="text-xl font-bold text-gray-900">
            {existingEvent?.title ?? form.title}
          </h1>
        ) : null}
        {mode === "edit" && eventId ? (
          <Tabs
            tabs={[
              { id: "event", label: "О мероприятии" },
              { id: "participants", label: `Участники / экспоненты (${participantCount})` },
              { id: "services", label: `Услуги (${serviceCount})` },
              {
                id: "bookings",
                label: `Бронирования (${bookingCount})${pendingBookingCount > 0 ? " •" : ""}`,
              },
            ]}
            activeTab={activeTab}
            onChange={(tabId) => setActiveTab(tabId as EventFormTab)}
            className="mt-2"
          />
        ) : null}
      </div>

      {mode === "edit" && eventId && activeTab === "participants" ? (
        <div className="space-y-4 w-full max-w-3xl">
          <Card className="space-y-2 w-full">
            <CardTitle className="text-sm">Экспоненты мероприятия</CardTitle>
            <CardDescription>
              Участники — компании со своим стендом на выставке. Застройщики и подрядчики — в
              разделе «Заказы».
            </CardDescription>
          </Card>
          <Input
            placeholder="Поиск участника..."
            value={participantQuery}
            onChange={(event) => setParticipantQuery(event.target.value)}
            className="w-full"
          />
          <OrganizerParticipantsList
            participants={filteredEventParticipants}
            participantHref={(participant) =>
              `/account/organizer/events/${eventId}/participants/${participant.id}`
            }
          />
        </div>
      ) : mode === "edit" && eventId && activeTab === "services" ? (
        <OrganizerEventServicesPanel eventId={eventId} showToast={showToast} />
      ) : mode === "edit" && eventId && activeTab === "bookings" ? (
        <OrganizerEventBookingsPanel eventId={eventId} />
      ) : (
      <div className="w-full max-w-3xl space-y-6">
        <Card className="space-y-4">
        <Input
          label="Название"
          value={form.title}
          onChange={(event) => updateForm("title", event.target.value)}
        />

        <Select
          label="Категория"
          options={CATEGORY_OPTIONS}
          value={form.category}
          onChange={(event) =>
            updateForm("category", event.target.value as Event["category"])
          }
        />

        <Select
          label="Отрасль"
          options={INDUSTRY_OPTIONS}
          value={form.industry}
          onChange={(event) => updateForm("industry", event.target.value)}
        />

        <Textarea
          label="Описание"
          value={form.description}
          onChange={(event) => updateForm("description", event.target.value)}
        />

        <Select
          label="Город"
          options={CITIES.map((city) => ({ value: city, label: city }))}
          value={form.city}
          onChange={(event) => updateForm("city", event.target.value)}
        />

        {mode === "create" ? (
          <Card className="space-y-2 bg-gray-50">
            <CardTitle className="text-sm">Площадка проведения</CardTitle>
            <CardDescription className="leading-relaxed">
              Площадка не выбирается сразу. Сначала сохраните черновик мероприятия, затем на
              странице «Площадки проведения» отправьте запрос одной или нескольким площадкам на
              нужные даты. После получения предложений вы выберете лучшие условия и официально
              закрепите площадку.
            </CardDescription>
            {organizerEventDraft?.selectedVenueName ? (
              <p className="text-sm text-gray-900">
                Выбранная площадка: <strong>{organizerEventDraft.selectedVenueName}</strong>
              </p>
            ) : (
              <Link href="/account/organizer/venues" className="inline-block text-sm underline">
                Перейти к запросам площадкам
              </Link>
            )}
          </Card>
        ) : (
          <Select
            label="Площадка"
            options={VENUE_OPTIONS}
            value={form.venueId}
            onChange={(event) => updateForm("venueId", event.target.value)}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Дата начала"
            type="date"
            value={form.startDate}
            onChange={(event) => updateForm("startDate", event.target.value)}
          />
          <Input
            label="Дата окончания"
            type="date"
            value={form.endDate}
            onChange={(event) => updateForm("endDate", event.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Даты монтажа · с"
            type="date"
            value={form.assemblyStart}
            onChange={(event) => updateForm("assemblyStart", event.target.value)}
          />
          <Input
            label="Даты монтажа · по"
            type="date"
            value={form.assemblyEnd}
            onChange={(event) => updateForm("assemblyEnd", event.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Даты демонтажа · с"
            type="date"
            value={form.dismantlingStart}
            onChange={(event) => updateForm("dismantlingStart", event.target.value)}
          />
          <Input
            label="Даты демонтажа · по"
            type="date"
            value={form.dismantlingEnd}
            onChange={(event) => updateForm("dismantlingEnd", event.target.value)}
          />
        </div>

        <Textarea
          label="Условия участия"
          value={form.participationTerms}
          onChange={(event) => updateForm("participationTerms", event.target.value)}
        />

        <Textarea
          label="Информация для участников"
          value={form.participantInfo}
          onChange={(event) => updateForm("participantInfo", event.target.value)}
          placeholder="Регламент, схема проезда, контакты организатора"
        />

        <Textarea
          label="Памятка участника"
          value={form.participantMemo}
          onChange={(event) => updateForm("participantMemo", event.target.value)}
          placeholder="Требования к стендам, пропускам, монтажу"
        />

        <FileUpload label="Прикрепить файлы" fullWidth />

        <div className="flex gap-2 flex-wrap pt-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            Сохранить черновик
          </Button>
          <Button variant="outline" onClick={() => showToast("Предпросмотр")}>
            Предпросмотр
          </Button>
          <Button onClick={handlePublish}>Опубликовать</Button>
        </div>
      </Card>

        <Card className="space-y-4">
          <div>
            <CardTitle className="text-sm">Ретроспектива и масштаб</CardTitle>
            <CardDescription className="mt-2">
              Организатор привлекает участников — покажите масштаб прошлых лет: фото,
              списки участников и динамику развития мероприятия.
            </CardDescription>
          </div>

          <div className="space-y-3">
            <FileUpload label="Фото прошлых лет" accept="image/*" fullWidth />
            <FileUpload label="Список участников прошлых лет" accept=".pdf,.xlsx,.csv" fullWidth />
            <FileUpload label="Статистика развития" accept=".pdf,.xlsx,.pptx" fullWidth />
          </div>

          <p className="text-xs text-gray-600 border border-dashed border-gray-300 p-3">
            Страница мероприятия публичная, но блок «Участники прошлых лет» виден только
            после бесплатной регистрации на платформе.
          </p>
        </Card>

      <OrganizerEventRecommendedPartnersPanel
        eventId={eventId}
        draftEventId={organizerEventDraft?.id}
        onEnsureDraftId={ensureDraftEventId}
        showToast={showToast}
      />
      </div>
      )}
    </div>
  );
}