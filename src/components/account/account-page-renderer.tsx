"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/states";
import { Modal } from "@/components/ui/modal";
import { FileUpload } from "@/components/ui/file-upload";
import { VenueDashboardSection } from "@/components/venue/venue-dashboard-section";
import { AccountCabinetHeader } from "@/components/account/account-cabinet-header";
import { BackButton } from "@/components/ui/back-button";
import { OrganizerDashboardSection } from "@/components/organizer/organizer-dashboard-section";
import { OrganizerSettingsSection } from "@/components/organizer/organizer-settings-section";
import { OrganizerEventsSection } from "@/components/organizer/organizer-events-section";
import { OrganizerEventFormSection } from "@/components/organizer/organizer-event-form-section";
import { OrganizerVenuesSection } from "@/components/organizer/organizer-venues-section";
import { OrganizerParticipantDetailSection } from "@/components/organizer/organizer-participant-detail-section";
import { CustomerSettingsSection } from "@/components/customer/customer-settings-section";
import { CustomerDashboardRecommendations } from "@/components/customer/customer-dashboard-recommendations";
import { ContractorDashboardSection } from "@/components/contractor/contractor-dashboard-section";
import { ContractorServiceDetailSection } from "@/components/contractor/contractor-service-detail-section";
import { ContractorProductionSection } from "@/components/contractor/contractor-production-section";
import {
  ContractorServiceFormModal,
  buildServicePayload,
  createEmptyServiceForm,
  serviceToFormState,
  type ServiceFormState,
} from "@/components/contractor/contractor-service-form-modal";
import { CustomerFavoritesSection } from "@/components/customer/customer-favorites-section";
import { CustomerCartSection } from "@/components/customer/customer-cart-section";
import { RepeatOrderForm } from "@/components/customer/repeat-order-form";
import { CustomerMyEventsSection } from "@/components/customer/customer-my-events-section";
import { VenueFloorPlanSection } from "@/components/venue/venue-floor-plan-section";
import { VenueHallsSection } from "@/components/venue/venue-halls-section";
import { ResponseCard } from "@/components/responses/response-card";
import { ChecksPanel } from "@/components/account/checks-panel";
import {
  ContractorPortfolioFormSection,
  ContractorPortfolioListSection,
} from "@/components/contractor/contractor-portfolio-section";
import {
  ContractorCatalogFormSection,
  ContractorServicesListSection,
} from "@/components/contractor/contractor-catalog-section";
import { ContractorMyResponsesSection } from "@/components/contractor/contractor-my-responses-section";
import { ProjectGanttSection } from "@/components/contractor/project-gantt-section";
import { ContractorSettingsSection } from "@/components/contractor/contractor-settings-section";
import { AccountContractorSection } from "@/components/contractors/account-contractor-section";
import { ReviewCard } from "@/components/contractors/review-card";
import { AvailableRequestCard } from "@/components/requests/available-request-card";
import { VenueServicesSection } from "@/components/venue/venue-services-section";
import { VenueSettingsSection } from "@/components/venue/venue-settings-section";
import { VenueEventsSection } from "@/components/venue/venue-events-section";
import { VenueBookingsSection } from "@/components/venue/venue-bookings-section";
import { VenueBookingDetailSection } from "@/components/venue/venue-booking-detail-section";
import { VenueEventBookingsSection } from "@/components/venue/venue-event-bookings-section";
import { VenueProfileSection } from "@/components/venue/venue-profile-section";
import { VenueSpacesSection } from "@/components/venue/venue-spaces-section";
import { VenueEventDetailSection } from "@/components/venue/venue-event-detail-section";
import { VenueEventOrdersSection } from "@/components/venue/venue-event-orders-section";
import { PinLoginSettings } from "@/components/account/pin-login-settings";
import { CompanyProfileSection } from "@/components/account/company-profile-section";
import { PaymentsPanel } from "@/components/finance/payments-panel";
import { VenuePaymentsPanel } from "@/components/finance/venue-payments-panel";
import { OrganizerPaymentsPanel } from "@/components/finance/organizer-payments-panel";
import { EventOrdersPanel } from "@/components/deals/event-orders-panel";
import { DocumentsPanel } from "@/components/documents/documents-panel";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import {
  findContractorForUser,
  getContractorIdForUser,
  isDealForUser,
} from "@/lib/utils/user-entity-map";
import { useToast } from "@/components/ui/toast-provider";
import { getNavForRole } from "@/constants/nav-menus";
import { DEMO_USERS, SEED_CONTRACTORS, SEED_EVENTS, SEED_SERVICES } from "@/data/mocks/seed";
import { getInterestRecommendationReason, getOkvedRecommendationReason, matchInterests, matchOkved } from "@/lib/utils/okved";
import { formatDate, formatDateTime, formatPrice, formatShortDate } from "@/lib/utils/formatters";
import { DEAL_STATUS_LABELS, REQUEST_FORMAT_LABELS, STAGE_STATUS_LABELS } from "@/constants/statuses";
import { SERVICE_CATEGORIES, CITIES, FEDERAL_DISTRICT_OPTIONS, getCitiesByDistrict } from "@/constants/categories";
import type { CompanyProfile, ContractorReview, Request, Service, UserRole } from "@/data/types";
import {
  AlertCircle, CheckCircle, Clock, Plus, Star,
} from "lucide-react";

interface Props {
  role: UserRole;
  slug: string;
}

function getRequestEventTitle(request: Request) {
  if (!request.eventId) return undefined;
  return SEED_EVENTS.find((event) => event.id === request.eventId)?.title;
}

export function AccountPageRenderer({ role, slug }: Props) {
  const nav = getNavForRole(role || "");
  const matchedNav = nav.find((n) => n.slug === slug);
  const current = matchedNav || nav[0];
  const user = useAuthStore((s) => s.user);
  const isDashboard = slug === "" || slug === "dashboard";
  const portfolioItemId = slug.startsWith("portfolio/") ? slug.split("/")[1] : null;
  const isCatalogFormPage = slug.startsWith("services/catalog/");
  const contractorServiceId =
    slug.startsWith("services/") && !isCatalogFormPage ? slug.split("/")[1] : null;
  const isPortfolioFormPage = Boolean(portfolioItemId);
  const venueEventId = slug.startsWith("events/") ? slug.split("/")[1] : null;
  const venueEvent = venueEventId
    ? SEED_EVENTS.find((event) => event.id === venueEventId)
    : undefined;
  const contractorForTitle =
    role === "contractor"
      ? findContractorForUser(user) ?? undefined
      : undefined;
  const pageTitle =
    slug === "repeat-order"
      ? "Повторить заказ"
      : isPortfolioFormPage || slug === "portfolio" || isCatalogFormPage || contractorServiceId || (venueEvent && role === "venue") || slug === "floor-plan" || slug === "halls"
      ? null
      : slug === "create-event" || slug === "edit-event" || slug.startsWith("events/") || slug.startsWith("orders/") || slug.startsWith("bookings/") || slug.startsWith("contractors/")
        ? null
        : isDashboard && role === "venue"
          ? matchedNav?.label || "Дашборд"
          : isDashboard && role === "organizer"
            ? null
            : matchedNav?.label ?? (slug.includes("/") ? null : "Кабинет");

  const renderContent = () => {
    if (slug.startsWith("contractors/")) {
      return <AccountContractorSection slug={slug} role={role} />;
    }
    if (role === "customer") return <CustomerPages slug={slug} />;
    if (role === "contractor") return <ContractorPages slug={slug} />;
    if (role === "venue") return <VenuePages slug={slug} />;
    if (role === "organizer") return <OrganizerPages slug={slug} />;
    return null;
  };

  return (
    <div>
      {slug === "repeat-order" && (
        <BackButton fallbackHref="/account/customer/completed-projects" className="mb-2" />
      )}
      {pageTitle && <h1 className="text-xl font-bold mb-4">{pageTitle}</h1>}
      {role === "organizer" &&
      user &&
      slug !== "create-event" &&
      slug !== "edit-event" &&
      !slug.startsWith("events/") ? (
        <AccountCabinetHeader
          user={user}
          asPageTitle={isDashboard}
          actions={
            slug === "events" ? (
              <Link href="/account/organizer/create-event">
                <Button size="sm">Создать мероприятие</Button>
              </Link>
            ) : undefined
          }
        />
      ) : null}
      {renderContent()}
    </div>
  );
}

function PaymentInvoicesLabel({
  direction,
  tooltip,
}: {
  direction: string;
  tooltip?: string;
}) {
  return (
    <div className="mt-1">
      <p className="text-sm text-gray-600">Неоплаченные счета</p>
      <div className="flex items-center gap-1">
        <p className="text-sm font-semibold text-gray-900">{direction}</p>
        {tooltip && (
          <Tooltip content={tooltip}>
            <button
              type="button"
              className="shrink-0 text-gray-500 hover:text-gray-900"
              aria-label="Подробнее о неоплаченных исходящих счетах"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

function ContractorCitiesSection({
  user,
  showToast,
}: {
  user: CompanyProfile | null;
  showToast: ReturnType<typeof useToast>["showToast"];
}) {
  const updateUser = useAuthStore((s) => s.updateUser);
  const [district, setDistrict] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const availableCities = useMemo(
    () => getCitiesByDistrict(district),
    [district]
  );

  const handleAddCity = () => {
    if (!selectedCity || !user) return;
    if (user.cities.includes(selectedCity)) {
      showToast("Город уже добавлен", "info");
      return;
    }
    updateUser({ cities: [...user.cities, selectedCity] });
    showToast("Город добавлен");
    setSelectedCity("");
  };

  return (
    <div className="max-w-lg space-y-4">
      <p className="text-sm mb-1">Города оказания услуг:</p>
      <div className="flex flex-wrap gap-2">
        {user?.cities.map((city) => (
          <Badge key={city}>{city}</Badge>
        ))}
      </div>

      <Select
        label="Федеральный округ"
        value={district}
        onChange={(e) => {
          setDistrict(e.target.value);
          setSelectedCity("");
        }}
        options={[
          { value: "", label: "Все федеральные округа" },
          ...FEDERAL_DISTRICT_OPTIONS.map((item) => ({ value: item, label: item })),
        ]}
      />

      <Select
        label="Добавить город"
        value={selectedCity}
        onChange={(e) => setSelectedCity(e.target.value)}
        options={[
          { value: "", label: availableCities.length ? "Выберите город" : "Города не найдены" },
          ...availableCities.map((city) => ({ value: city, label: city })),
        ]}
      />

      <Button size="sm" onClick={handleAddCity} disabled={!selectedCity}>
        Добавить
      </Button>
    </div>
  );
}

function DashboardWidgets({ role }: { role: string }) {
  const { requests, deals, notifications, payments } = usePrototypeStore();
  const user = useAuthStore((s) => s.user);
  const activeDeals = deals.filter(
    (d) => d.status !== "completed" && isDealForUser(d, user)
  );
  const unreadNotif = notifications.filter((n) => !n.read).length;
  const pendingIncoming = payments.filter(
    (p) => p.status === "pending" && (p.direction === "incoming" || !p.direction)
  ).length;
  const pendingOutgoing = payments.filter(
    (p) => p.status === "pending" && p.direction === "outgoing"
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      <Card><CardTitle className="text-2xl">{requests.filter((r) => r.status === "published").length}</CardTitle><CardDescription>{role === "contractor" ? "Активные заказы" : "Активные заявки"}</CardDescription></Card>
      <Card><CardTitle className="text-2xl">{activeDeals.length}</CardTitle><CardDescription>Активные проекты</CardDescription></Card>
      <Card><CardTitle className="text-2xl">{unreadNotif}</CardTitle><CardDescription>Новые уведомления</CardDescription></Card>
      <Card>
        <CardTitle className="text-2xl">{pendingOutgoing}</CardTitle>
        <PaymentInvoicesLabel
          direction="исходящие"
          tooltip="Например, если в качестве заказчика выступает агентство и оно выставляет счёт конечному заказчику"
        />
      </Card>
      <Card>
        <CardTitle className="text-2xl">{pendingIncoming}</CardTitle>
        <PaymentInvoicesLabel direction="входящие" />
      </Card>
    </div>
  );
}

function CustomerReviewsSection({
  deals,
  showToast,
}: {
  deals: ReturnType<typeof usePrototypeStore.getState>["deals"];
  showToast: ReturnType<typeof useToast>["showToast"];
}) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      <p className="text-sm mb-4">Оставьте отзыв о завершённой сделке:</p>
      <Select
        label="Сделка"
        options={deals
          .filter((deal) => deal.status === "completed")
          .map((deal) => ({ value: deal.id, label: deal.title }))}
      />
      <div className="flex gap-1 my-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" className="border border-gray-300 p-2 hover:border-gray-900">
            <Star className="h-4 w-4" />
          </button>
        ))}
      </div>
      <Textarea label="Отзыв" />

      <div className="mt-4 flex flex-col lg:flex-row lg:items-start gap-6">
        <div className="flex flex-col items-start gap-3">
          <FileUpload
            label="Прикрепить фото и видео"
            accept="image/*,video/*"
            onUpload={() => showToast("Файл добавлен", "success")}
          />
          <Button
            variant="outline"
            type="button"
            onClick={() => showToast("Рекомендация отправлена исполнителю", "success")}
          >
            Порекомендовать исполнителя
          </Button>
          <Button type="button" onClick={() => setSubmitted(true)}>
            Отправить
          </Button>
        </div>

        {submitted && (
          <p className="text-sm text-gray-700 max-w-md">
            Отзыв отправлен на модерацию, будет опубликован при успешной модерации. Срок
            публикации может занимать до 7 дней.
          </p>
        )}
      </div>
    </div>
  );
}

function CustomerPages({ slug }: { slug: string }) {
  const user = useAuthStore((s) => s.user);
  const { updateUser, showEdoPrompt, setShowEdoPrompt } = useAuthStore();
  const { requests, deals, responses, services, notifications, documents, payments } = usePrototypeStore();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const repeatDealId = searchParams.get("dealId");
  const [edoModal, setEdoModal] = useState(showEdoPrompt);
  const [edoTab, setEdoTab] = useState("connection");

  const okvedRecommendedEvents = useMemo(() => {
    if (!user) return [];
    return SEED_EVENTS.filter((event) => matchOkved(user.mainOkved, event.okvedTags));
  }, [user]);

  const interestRecommendedEvents = useMemo(() => {
    if (!user) return [];
    const okvedIds = new Set(
      SEED_EVENTS.filter((event) => matchOkved(user.mainOkved, event.okvedTags)).map((event) => event.id),
    );
    return SEED_EVENTS.filter(
      (event) => !okvedIds.has(event.id) && matchInterests(user.industries, event.industry),
    );
  }, [user]);

  if (slug === "" || slug === "dashboard") {
    return (
      <>
        {edoModal && user?.edoStatus === "not_connected" && (
          <Modal open title="Подключите ЭДО" onClose={() => { setEdoModal(false); setShowEdoPrompt(false); }}
            footer={<><Button variant="outline" onClick={() => { setEdoModal(false); setShowEdoPrompt(false); }}>Пропустить</Button><Link href="/account/customer/edo"><Button onClick={() => setEdoModal(false)}>Подключить</Button></Link></>}>
            <p className="text-sm">Для подписания документов рекомендуем подключить электронный документооборот.</p>
          </Modal>
        )}
        <DashboardWidgets role="customer" />
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardTitle>Быстрые действия</CardTitle>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link href="/requests/new"><Button size="sm">Создать заявку</Button></Link>
              <Link href="/services"><Button size="sm" variant="outline">Каталог услуг</Button></Link>
              <Link href="/events"><Button size="sm" variant="outline">Мероприятия</Button></Link>
            </div>
          </Card>
          <Card>
            <CardTitle>Рекомендации мероприятий</CardTitle>
            {okvedRecommendedEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block text-sm mt-2 hover:underline"
              >
                {event.title} — {getOkvedRecommendationReason(user?.mainOkved || "")}
              </Link>
            ))}
            {interestRecommendedEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block text-sm mt-2 hover:underline"
              >
                {event.title} — {getInterestRecommendationReason()}
              </Link>
            ))}
          </Card>
        </div>
        <Card className="mt-4">
          <CardTitle>Сделки, требующие действия</CardTitle>
          {deals.filter((d) => ["negotiation", "stage_review", "awaiting_payment"].includes(d.status)).map((d) => (
            <Link key={d.id} href={`/deals/${d.id}`} className="flex justify-between py-2 border-b border-gray-200 text-sm">
              <span>{d.title}</span>
              <Badge>{DEAL_STATUS_LABELS[d.status]}</Badge>
            </Link>
          ))}
        </Card>
        <CustomerDashboardRecommendations user={user} />
      </>
    );
  }

  if (slug === "profile") {
    return <CompanyProfileSection showToast={showToast} />;
  }

  if (slug === "legal") {
    return (
      <div className="space-y-4 max-w-lg">
        <Input label="ИНН" defaultValue={user?.inn} />
        <Input label="КПП" defaultValue="770101001" />
        <Input label="ОГРН (для ООО)" defaultValue={user?.ogrn} />
        <Input label="ОГРНИП (для ИП)" defaultValue="" placeholder="Заполняется для индивидуальных предпринимателей" />
        <Input label="Юридический адрес" defaultValue={user?.address} />
        <Input label="Фактический адрес" defaultValue={user?.actualAddress ?? ""} />
        <Input label="Сайт" defaultValue={user?.website ?? ""} />
        <Input label="Телефон компании" defaultValue={user?.phone ?? ""} />
        <Input label="Руководитель" defaultValue={user?.director} />
        <Input label="Расчётный счёт" defaultValue="40702810XXXXXXXXXXXX" />
        <Input label="БИК" defaultValue="044525225" />
        <Input label="Банк" defaultValue="ПАО «Вымышленный Банк»" />
        <Input label="Корреспондентский счёт банка" defaultValue="30101810XXXXXXXXXXXX" />
        <Button onClick={() => showToast("Данные сохранены")}>Сохранить</Button>
      </div>
    );
  }

  if (slug === "edo" || slug === "reminders" || slug === "closing-docs") {
    const currentTab =
      slug === "reminders" ? "reminders" : slug === "closing-docs" ? "closing" : edoTab;
    const pendingDocs = documents.filter((d) => d.status === "sent");
    return (
      <div className="max-w-2xl space-y-4">
        <Tabs
          tabs={[
            { id: "connection", label: "Подключение ЭДО" },
            { id: "reminders", label: `Напоминания${pendingDocs.length ? ` (${pendingDocs.length})` : ""}` },
            { id: "closing", label: "Запрос закрывающих" },
          ]}
          activeTab={currentTab}
          onChange={setEdoTab}
        />

        {currentTab === "connection" && (
          <div className="space-y-4 max-w-lg">
            {user?.edoStatus === "connected" ? (
              <div className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4" /> ЭДО подключено</div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm border border-dashed border-gray-400 p-3">
                  <AlertCircle className="h-4 w-4" /> ЭДО не подключено. Документы можно скачать временно.
                </div>
                <Select label="Оператор ЭДО" options={[{ value: "sbis", label: "СБИС" }, { value: "kontur", label: "Контур" }, { value: "tensor", label: "Тензор" }, { value: "other", label: "Другой оператор" }]} />
                <Input label="Идентификатор участника" placeholder="2BM-..." />
              </>
            )}
            <div>
              <p className="text-sm font-medium mb-3">
                Загрузить документы для подписания в ЭДО руководителем вашей организации (Договор, акты и т.д.)
              </p>
              <FileUpload
                label="Прикрепить документы"
                accept=".pdf,.doc,.docx"
                onUpload={() => showToast("Документ добавлен")}
              />
            </div>
            {user?.edoStatus !== "connected" && (
              <Button onClick={() => { updateUser({ edoStatus: "connected" }); showToast("ЭДО подключено"); }}>
                Проверить и подключить
              </Button>
            )}
          </div>
        )}

        {currentTab === "reminders" && (
          <Card>
            <p className="text-sm text-gray-600 mb-4">Напоминания о входящих документах и сроках.</p>
            {pendingDocs.map((d) => (
              <div key={d.id} className="flex justify-between py-2 border-b text-sm">
                <span>{d.type} {d.number}</span>
                <Badge variant="dashed"><Clock className="h-3 w-3" /> Ожидает подписи</Badge>
              </div>
            ))}
            {pendingDocs.length === 0 && <EmptyState title="Нет напоминаний" />}
          </Card>
        )}

        {currentTab === "closing" && (
          <div>
            <p className="text-sm mb-4">Запросите закрывающие документы у исполнителей.</p>
            <Select label="Сделка" options={deals.map((d) => ({ value: d.id, label: d.title }))} />
            <Textarea label="Комментарий" className="mt-3" />
            <Button className="mt-3" onClick={() => showToast("Запрос отправлен")}>Запросить документы</Button>
          </div>
        )}
      </div>
    );
  }

  if (slug === "favorites") {
    return <CustomerFavoritesSection />;
  }

  if (slug === "cart") {
    return <CustomerCartSection />;
  }

  if (slug === "responses") {
    const myRequests = requests.filter((r) => r.customerId === user?.id);
    const requestsWithResponses = myRequests
      .map((request) => ({
        request,
        requestResponses: responses.filter((response) => response.requestId === request.id),
      }))
      .filter((item) => item.requestResponses.length > 0);

    const groupedResponses = requestsWithResponses.reduce<
      Record<
        string,
        {
          eventTitle: string;
          city: string;
          category: string;
          items: typeof requestsWithResponses;
        }
      >
    >((groups, item) => {
      const eventTitle = getRequestEventTitle(item.request) ?? "Без мероприятия";
      const key = `${eventTitle}|${item.request.city}|${item.request.category}`;
      if (!groups[key]) {
        groups[key] = {
          eventTitle,
          city: item.request.city,
          category: item.request.category,
          items: [],
        };
      }
      groups[key].items.push(item);
      return groups;
    }, {});

    const responseGroups = Object.values(groupedResponses);

    if (responseGroups.length === 0) {
      return (
        <EmptyState
          title="Нет откликов"
          description="Здесь появятся отклики исполнителей на ваши заявки"
          actionLabel="Создать заявку"
          onAction={() => router.push("/requests/new")}
        />
      );
    }

    return (
      <div className="space-y-8">
        {responseGroups.map((group) => (
          <section key={`${group.eventTitle}-${group.city}-${group.category}`}>
            <div className="mb-4 space-y-1">
              <h2 className="text-lg font-bold text-gray-900">
                {group.eventTitle} · {group.city} · {group.category}
              </h2>
              <p className="text-sm text-gray-600">
                {group.items.length === 1
                  ? "1 заявка с откликами"
                  : `${group.items.length} заявки с откликами`}
              </p>
            </div>

            {group.items.map(({ request, requestResponses }) => (
              <div key={request.id} className="mb-6 last:mb-0">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Отклики: {request.title}
                </h3>
                <div className="flex flex-wrap gap-4">
                  {requestResponses.map((response) => (
                    <ResponseCard
                      key={response.id}
                      response={response}
                      requestId={request.id}
                      isOwner
                      category={request.category}
                      city={request.city}
                      eventTitle={getRequestEventTitle(request)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    );
  }

  if (slug === "active-projects") {
    const active = deals.filter((d) => d.customerId === user?.id && d.status !== "completed");
    return (
      <div className="space-y-3">
        {active.map((d) => (
          <Link key={d.id} href={`/deals/${d.id}`}>
            <Card className="hover:border-gray-900">
              <div className="flex justify-between">
                <CardTitle>{d.title}</CardTitle>
                <Badge>{DEAL_STATUS_LABELS[d.status]}</Badge>
              </div>
              <CardDescription>{d.contractorName} · {formatPrice(d.totalPrice)}</CardDescription>
            </Card>
          </Link>
        ))}
        {active.length === 0 && <EmptyState title="Нет активных проектов" />}
      </div>
    );
  }

  if (slug === "completed-projects") {
    const completed = deals.filter((d) => d.customerId === user?.id && d.status === "completed");
    if (completed.length === 0) {
      return <EmptyState title="Нет завершённых проектов" description="Здесь появятся проекты после завершения сделок" />;
    }
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {completed.map((d) => (
          <Card key={d.id} className="flex flex-col h-full">
            <Link href={`/deals/${d.id}`} className="flex-1 block hover:opacity-90">
              <CardTitle>{d.title}</CardTitle>
              <CardDescription className="mt-2">
                {d.number} · {d.contractorName} · {formatPrice(d.totalPrice)}
              </CardDescription>
            </Link>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => router.push(`/account/customer/repeat-order?dealId=${d.id}`)}
            >
              Повторить заказ
            </Button>
          </Card>
        ))}
      </div>
    );
  }

  if (slug === "repeat-order") {
    const completed = deals.filter((d) => d.customerId === user?.id && d.status === "completed");

    if (repeatDealId) {
      const deal = completed.find((item) => item.id === repeatDealId);
      if (!deal) {
        return (
          <EmptyState
            title="Заказ не найден"
            description="Выберите завершённый проект для повторения"
            actionLabel="К завершённым проектам"
            onAction={() => router.push("/account/customer/completed-projects")}
          />
        );
      }

      const relatedRequest = deal.requestId
        ? requests.find((request) => request.id === deal.requestId)
        : undefined;

      return (
        <RepeatOrderForm
          deal={deal}
          relatedRequest={relatedRequest}
          onCreated={(requestId) => router.push(`/requests/${requestId}`)}
          onCancel={() => router.push("/account/customer/completed-projects")}
        />
      );
    }

    if (completed.length === 0) {
      return (
        <EmptyState
          title="Нет завершённых заказов"
          description="Повторить заказ можно после завершения проекта"
          actionLabel="Активные проекты"
          onAction={() => router.push("/account/customer/active-projects")}
        />
      );
    }

    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600">Выберите завершённый заказ для повторения:</p>
        {completed.map((d) => (
          <Card key={d.id}>
            <CardTitle>{d.title}</CardTitle>
            <CardDescription className="mt-1">
              {d.number} · {d.contractorName} · {formatPrice(d.totalPrice)}
            </CardDescription>
            <Button
              size="sm"
              className="mt-3"
              onClick={() => router.push(`/account/customer/repeat-order?dealId=${d.id}`)}
            >
              Повторить заказ
            </Button>
          </Card>
        ))}
      </div>
    );
  }

  if (slug === "checks") {
    return <ChecksPanel role="customer" />;
  }

  if (slug === "payments") return <PaymentsPanel />;
  if (slug === "documents") return <DocumentsPanel />;

  if (slug === "reviews") {
    return <CustomerReviewsSection deals={deals} showToast={showToast} />;
  }

  if (slug === "my-events") {
    return <CustomerMyEventsSection customerId={user?.id ?? "user-customer"} />;
  }

  if (slug === "settings") {
    return <CustomerSettingsSection customerId={user?.id ?? "user-customer"} showToast={showToast} />;
  }

  return <EmptyState title="Раздел не найден" />;
}

function ContractorPages({ slug }: { slug: string }) {
  const user = useAuthStore((s) => s.user);
  const { requests, deals, responses, services, addService, updateService, removeService, getContractorCatalogs, removeServiceCatalog } = usePrototypeStore();
  const { showToast } = useToast();
  const router = useRouter();
  const [reviewModal, setReviewModal] = useState<ContractorReview | null>(null);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState<ServiceFormState>(createEmptyServiceForm);
  const [serviceErrors, setServiceErrors] = useState<Record<string, string>>({});

  const resetServiceForm = () => {
    setEditingServiceId(null);
    setServiceForm(createEmptyServiceForm());
  };

  const openCreateServiceModal = () => {
    resetServiceForm();
    setServiceErrors({});
    setServiceModalOpen(true);
  };

  const openEditServiceModal = (service: Service) => {
    setEditingServiceId(service.id);
    setServiceForm(serviceToFormState(service));
    setServiceErrors({});
    setServiceModalOpen(true);
  };

  const closeServiceModal = () => {
    setServiceModalOpen(false);
    resetServiceForm();
    setServiceErrors({});
  };

  const handleSaveService = () => {
    const errs: Record<string, string> = {};
    if (!serviceForm.title.trim()) errs.title = "Укажите название услуги";
    if (!serviceForm.price || Number(serviceForm.price) <= 0) errs.price = "Укажите корректную цену";
    if (!serviceForm.deadline.trim()) errs.deadline = "Укажите сроки";
    setServiceErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = buildServicePayload(serviceForm);

    if (editingServiceId) {
      updateService(editingServiceId, payload);
      showToast("Услуга обновлена");
    } else {
      addService({
        id: `svc-${Date.now()}`,
        contractorId: getContractorIdForUser(user) ?? user?.id ?? "ctr-1",
        contractorName: user?.name || "Исполнитель",
        rating: 0,
        reviewCount: 0,
        ...payload,
      });
      showToast("Услуга добавлена");
    }

    closeServiceModal();
  };

  if (slug === "" || slug === "dashboard") {
    return (
      <>
        <DashboardWidgets role="contractor" />
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center justify-between gap-2 mb-2">
              <CardTitle>Доступные заявки</CardTitle>
              <Link href="/account/contractor/available-requests" className="text-xs underline">
                Все
              </Link>
            </div>
            <div className="space-y-2">
              {requests.filter((r) => r.status === "published").slice(0, 3).map((request) => {
                const customerName = request.customerName ?? DEMO_USERS.customer.name;
                const responseDeadline = request.responseDeadlineAt
                  ? formatDateTime(request.responseDeadlineAt)
                  : request.deadline
                    ? `${formatDate(request.deadline)}, 23:59`
                    : null;

                return (
                  <Link
                    key={request.id}
                    href={`/requests/${request.id}`}
                    className="block py-2 border-b border-gray-200 last:border-0 hover:underline"
                  >
                    <p className="text-sm font-medium">{request.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {customerName}
                      {responseDeadline ? ` · до ${responseDeadline}` : ""}
                    </p>
                  </Link>
                );
              })}
            </div>
          </Card>
          <Card>
            <CardTitle>Доступно к выплате</CardTitle>
            <p className="text-2xl font-bold mt-2">{formatPrice(185000)}</p>
          </Card>
        </div>
        <ContractorDashboardSection user={user} />
      </>
    );
  }

  if (slug === "profile") {
    return <CompanyProfileSection showToast={showToast} />;
  }

  if (slug === "cities") {
    return <ContractorCitiesSection user={user} showToast={showToast} />;
  }

  if (slug === "production") {
    return <ContractorProductionSection user={user} showToast={showToast} />;
  }

  if (slug.startsWith("services/catalog/")) {
    const catalogId = slug.split("/")[2];
    const contractorId = getContractorIdForUser(user) ?? "ctr-1";
    return (
      <ContractorCatalogFormSection
        contractorId={contractorId}
        contractorName={user?.name ?? "Исполнитель"}
        catalogId={catalogId}
        showToast={showToast}
      />
    );
  }

  if (slug.startsWith("services/")) {
    const serviceId = slug.split("/")[1];
    const contractorId = getContractorIdForUser(user);
    const service = services.find(
      (item) =>
        item.id === serviceId &&
        ((contractorId !== null && item.contractorId === contractorId) ||
          item.contractorId === user?.id ||
          item.contractorName === user?.name)
    );

    if (!service) {
      return (
        <EmptyState
          title="Услуга не найдена"
          actionLabel="К списку услуг"
          onAction={() => router.push("/account/contractor/services")}
        />
      );
    }

    return (
      <>
        <ContractorServiceDetailSection
          service={service}
          onEdit={() => openEditServiceModal(service)}
        />
        <ContractorServiceFormModal
          open={serviceModalOpen}
          editingServiceId={editingServiceId}
          form={serviceForm}
          errors={serviceErrors}
          onClose={closeServiceModal}
          onChange={setServiceForm}
          onSave={handleSaveService}
          onError={(message) => showToast(message, "error")}
        />
      </>
    );
  }

  if (slug === "services") {
    const contractorId = getContractorIdForUser(user);
    const myServices = services.filter(
      (s) =>
        (contractorId !== null && s.contractorId === contractorId) ||
        s.contractorId === user?.id ||
        s.contractorName === user?.name
    );
    const myCatalogs = getContractorCatalogs(contractorId ?? user?.id ?? "ctr-1");

    return (
      <>
        <ContractorServicesListSection
          services={myServices}
          catalogs={myCatalogs}
          onAddService={openCreateServiceModal}
          onEditService={openEditServiceModal}
          onRemoveService={(serviceId) => {
            removeService(serviceId);
            showToast("Услуга удалена", "info");
          }}
          onRemoveCatalog={(catalogId) => {
            removeServiceCatalog(catalogId);
            showToast("Каталог удалён", "info");
          }}
        />
        <ContractorServiceFormModal
          open={serviceModalOpen}
          editingServiceId={editingServiceId}
          form={serviceForm}
          errors={serviceErrors}
          onClose={closeServiceModal}
          onChange={setServiceForm}
          onSave={handleSaveService}
          onError={(message) => showToast(message, "error")}
        />
      </>
    );
  }

  if (slug.startsWith("portfolio/")) {
    const itemId = slug.split("/")[1];
    const contractorId = getContractorIdForUser(user) ?? "ctr-1";
    return (
      <ContractorPortfolioFormSection
        contractorId={contractorId}
        itemId={itemId}
        showToast={showToast}
      />
    );
  }

  if (slug === "portfolio") {
    const contractorId = getContractorIdForUser(user) ?? "ctr-1";
    return <ContractorPortfolioListSection contractorId={contractorId} />;
  }

  if (slug === "available-requests") {
    const available = requests.filter((r) => r.status === "published");

    if (available.length === 0) {
      return (
        <EmptyState
          title="Доступных заявок нет"
          description="Новые заявки появятся после публикации заказчиками"
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {available.map((request) => {
          const event = request.eventId
            ? SEED_EVENTS.find((item) => item.id === request.eventId)
            : undefined;

          return (
            <AvailableRequestCard key={request.id} request={request} event={event} />
          );
        })}
      </div>
    );
  }

  if (slug === "my-responses") {
    return (
      <ContractorMyResponsesSection
        user={user}
        responses={responses}
        requests={requests}
        onBrowseRequests={() => router.push("/account/contractor/available-requests")}
      />
    );
  }

  if (slug === "active-projects" || slug === "completed-projects") {
    const isCompleted = slug === "completed-projects";
    const contractorId = getContractorIdForUser(user);
    const filtered = deals.filter(
      (d) =>
        ((contractorId !== null && d.contractorId === contractorId) ||
          d.contractorName === user?.name) &&
        (isCompleted ? d.status === "completed" : d.status !== "completed")
    );
    if (filtered.length === 0) {
      return (
        <EmptyState
          title={isCompleted ? "Завершённых проектов пока нет" : "Активных проектов пока нет"}
          description={isCompleted ? "Здесь появятся проекты после завершения сделок" : "Откликайтесь на заявки, чтобы начать проекты"}
          actionLabel={isCompleted ? "Активные проекты" : "Доступные заявки"}
          onAction={() => router.push(isCompleted ? "/account/contractor/active-projects" : "/account/contractor/available-requests")}
        />
      );
    }
    return (
      <div className="space-y-3">
        {filtered.map((d) => (
          <Link key={d.id} href={`/deals/${d.id}`}>
            <Card className="hover:border-gray-900 transition-colors">
              <div className="flex justify-between items-start gap-3 flex-wrap">
                <div>
                  <CardTitle>{d.title}</CardTitle>
                  <CardDescription>{d.number} · {formatPrice(d.totalPrice)}</CardDescription>
                </div>
                <Badge>{DEAL_STATUS_LABELS[d.status]}</Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    );
  }

  if (slug === "gantt") {
    const contractorId = getContractorIdForUser(user);
    const projectDeals = deals.filter(
      (d) =>
        ((contractorId !== null && d.contractorId === contractorId) ||
          d.contractorName === user?.name) &&
        d.status !== "completed"
    );
    return (
      <ProjectGanttSection
        deals={projectDeals}
        onBrowseRequests={() => router.push("/account/contractor/available-requests")}
      />
    );
  }

  if (slug === "payouts") return <PaymentsPanel defaultTab="payouts" />;
  if (slug === "documents") return <DocumentsPanel />;

  if (slug === "reviews") {
    const contractor = findContractorForUser(user);
    const reviews = contractor?.reviews ?? [];
    return (
      <div className="space-y-4">
        <Card>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold flex items-center gap-1">
              <Star className="h-6 w-6" /> {user?.rating ?? contractor?.rating}
            </p>
            <p className="text-sm text-gray-600">{user?.reviewCount ?? contractor?.reviewCount} отзывов</p>
          </div>
        </Card>

        {reviews.length === 0 ? (
          <EmptyState title="Отзывов пока нет" description="Отзывы появятся после завершённых сделок" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {reviews.map((rv) => (
              <ReviewCard key={rv.id} review={rv} onClick={() => setReviewModal(rv)} />
            ))}
          </div>
        )}

        <Modal
          open={!!reviewModal}
          onClose={() => setReviewModal(null)}
          title={reviewModal?.author ?? "Отзыв"}
          footer={<Button variant="outline" onClick={() => setReviewModal(null)}>Закрыть</Button>}
        >
          {reviewModal && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < reviewModal.rating ? "fill-gray-900 text-gray-900" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="ml-1 font-medium">{reviewModal.rating}.0</span>
                </div>
                <span className="text-xs text-gray-500">{formatShortDate(reviewModal.date)}</span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{reviewModal.text}</p>
              {(reviewModal.photos?.length ?? 0) > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {reviewModal.photos?.map((photo, index) => (
                    <div
                      key={`${reviewModal.id}-modal-photo-${index}`}
                      className="aspect-[4/3] border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center p-2 text-center text-xs text-gray-500"
                    >
                      {photo}
                    </div>
                  ))}
                </div>
              )}
              {(reviewModal.videos?.length ?? 0) > 0 && (
                <p className="text-xs text-gray-600">Видео: {reviewModal.videos?.join(", ")}</p>
              )}
            </div>
          )}
        </Modal>
      </div>
    );
  }

  if (slug === "settings") {
    const contractorId = getContractorIdForUser(user) ?? "ctr-1";
    return <ContractorSettingsSection contractorId={contractorId} showToast={showToast} />;
  }

  return <EmptyState title="Раздел не найден" />;
}

function VenuePages({ slug }: { slug: string }) {
  const { showToast } = useToast();

  if (slug === "" || slug === "dashboard") {
    return <VenueDashboardSection />;
  }

  if (slug === "profile") {
    return <VenueProfileSection showToast={showToast} />;
  }

  if (slug === "halls") {
    return <VenueHallsSection showToast={showToast} />;
  }

  if (slug === "spaces") {
    return <VenueSpacesSection showToast={showToast} />;
  }

  if (slug === "floor-plan") {
    return <VenueFloorPlanSection />;
  }

  if (slug.startsWith("events/")) {
    const eventId = slug.split("/")[1];
    return <VenueEventDetailSection eventId={eventId} showToast={showToast} />;
  }

  if (slug === "events") {
    return <VenueEventsSection />;
  }

  if (slug === "venue-services") {
    return <VenueServicesSection showToast={showToast} />;
  }

  if (slug.startsWith("bookings/event/")) {
    const eventId = slug.split("/")[2];
    return <VenueEventBookingsSection eventId={eventId} />;
  }

  if (slug.startsWith("bookings/")) {
    const bookingId = slug.split("/")[1];
    return <VenueBookingDetailSection bookingId={bookingId} showToast={showToast} />;
  }

  if (slug === "bookings") {
    return <VenueBookingsSection />;
  }

  if (slug.startsWith("orders/")) {
    const eventId = slug.split("/")[1];
    return <VenueEventOrdersSection eventId={eventId} />;
  }

  if (slug === "orders") {
    return (
      <EventOrdersPanel
        venueId="venue-1"
        showVenueNote
        showDirectionFilter
        title="Заказы площадки"
        unboxed
      />
    );
  }

  if (slug === "payments") return <VenuePaymentsPanel />;
  if (slug === "documents") return <DocumentsPanel />;
  if (slug === "notifications") return <Link href="/notifications"><Button>Уведомления</Button></Link>;

  if (slug === "settings") {
    return <VenueSettingsSection showToast={showToast} />;
  }

  return <EmptyState title="Раздел не найден" />;
}

function OrganizerLegacyRedirect({ to }: { to: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(to);
  }, [router, to]);

  return null;
}

function OrganizerPages({ slug }: { slug: string }) {
  const user = useAuthStore((s) => s.user);
  const { showToast } = useToast();
  const organizerId = user?.id ?? "user-organizer";

  if (slug.startsWith("events/")) {
    const [, eventId, section, participantId] = slug.split("/");

    if (section === "participants" && !participantId) {
      return (
        <OrganizerEventFormSection
          mode="edit"
          forcedEventId={eventId}
          initialTab="participants"
        />
      );
    }

    if (section === "participants" && participantId) {
      return (
        <OrganizerParticipantDetailSection
          eventId={eventId}
          participantId={participantId}
          organizerId={organizerId}
        />
      );
    }

    if (section === "services") {
      return (
        <OrganizerEventFormSection
          mode="edit"
          forcedEventId={eventId}
          initialTab="services"
        />
      );
    }

    if (section === "bookings") {
      return (
        <OrganizerEventFormSection
          mode="edit"
          forcedEventId={eventId}
          initialTab="bookings"
        />
      );
    }
  }

  if (slug === "" || slug === "dashboard") {
    return <OrganizerDashboardSection organizerId={organizerId} />;
  }

  if (slug === "profile") {
    return <CompanyProfileSection showToast={showToast} />;
  }

  if (slug === "events") {
    return <OrganizerEventsSection organizerId={user?.id ?? "user-organizer"} />;
  }

  if (slug === "create-event") {
    return <OrganizerEventFormSection mode="create" />;
  }

  if (slug === "edit-event") {
    return <OrganizerEventFormSection mode="edit" />;
  }

  if (slug === "venues") {
    return <OrganizerVenuesSection />;
  }

  if (slug === "participants" || slug === "services" || slug === "bookings") {
    return <OrganizerLegacyRedirect to="/account/organizer/events" />;
  }

  if (slug === "orders") {
    return (
      <EventOrdersPanel
        organizerId={user?.id ?? "user-organizer"}
        showDirectionFilter
        title="Заказы организатора"
        unboxed
      />
    );
  }
  if (slug === "payments") return <OrganizerPaymentsPanel organizerId={user?.id ?? "user-organizer"} />;
  if (slug === "documents") return <DocumentsPanel />;
  if (slug === "notifications") return <Link href="/notifications"><Button>Уведомления</Button></Link>;

  if (slug === "settings") {
    return <OrganizerSettingsSection organizerId={organizerId} showToast={showToast} />;
  }

  return <EmptyState title="Раздел не найден" />;
}
