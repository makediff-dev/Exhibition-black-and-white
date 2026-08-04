"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
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
import { VenueCabinetHeader } from "@/components/venue/venue-cabinet-header";
import { AccountCabinetHeader } from "@/components/account/account-cabinet-header";
import { OrganizerDashboardSection } from "@/components/organizer/organizer-dashboard-section";
import { OrganizerSettingsSection } from "@/components/organizer/organizer-settings-section";
import { OrganizerEventsSection } from "@/components/organizer/organizer-events-section";
import { OrganizerEventFormSection } from "@/components/organizer/organizer-event-form-section";
import { OrganizerVenuesSection } from "@/components/organizer/organizer-venues-section";
import { OrganizerParticipantDetailSection } from "@/components/organizer/organizer-participant-detail-section";
import { VenueFloorPlanSection } from "@/components/venue/venue-floor-plan-section";
import { VenueHallsSection } from "@/components/venue/venue-halls-section";
import { ServiceCard } from "@/components/catalog/service-card";
import { ResponseCard } from "@/components/responses/response-card";
import { ChecksPanel } from "@/components/account/checks-panel";
import { PortfolioCard } from "@/components/contractors/portfolio-card";
import { PortfolioDetail } from "@/components/contractors/portfolio-detail";
import { ProjectGanttSection } from "@/components/contractor/project-gantt-section";
import { ReviewCard } from "@/components/contractors/review-card";
import { AvailableRequestCard } from "@/components/requests/available-request-card";
import { VenueServicesSection } from "@/components/venue/venue-services-section";
import { VenueSettingsSection } from "@/components/venue/venue-settings-section";
import { VenueEventsSection } from "@/components/venue/venue-events-section";
import { VenueBookingsSection } from "@/components/venue/venue-bookings-section";
import { VenueProfileSection } from "@/components/venue/venue-profile-section";
import { VenueSpacesSection } from "@/components/venue/venue-spaces-section";
import { VenueEventDetailSection } from "@/components/venue/venue-event-detail-section";
import { PinLoginSettings } from "@/components/account/pin-login-settings";
import { PaymentsPanel } from "@/components/finance/payments-panel";
import { VenuePaymentsPanel } from "@/components/finance/venue-payments-panel";
import { OrganizerPaymentsPanel } from "@/components/finance/organizer-payments-panel";
import { EventOrdersPanel } from "@/components/deals/event-orders-panel";
import { DocumentsPanel } from "@/components/documents/documents-panel";
import { useAuthStore, useCartStore, useFavoritesStore, usePrototypeStore } from "@/lib/store";
import {
  findContractorForUser,
  getContractorIdForUser,
  isDealForUser,
  isResponseForUser,
} from "@/lib/utils/user-entity-map";
import { useToast } from "@/components/ui/toast-provider";
import { getNavForRole } from "@/constants/nav-menus";
import { DEMO_USERS, SEED_CONTRACTORS, SEED_EVENTS, SEED_SERVICES } from "@/data/mocks/seed";
import { formatDate, formatDateTime, formatPrice, formatShortDate } from "@/lib/utils/formatters";
import { matchOkved, getOkvedRecommendationReason } from "@/lib/utils/okved";
import { DEAL_STATUS_LABELS, REQUEST_FORMAT_LABELS, STAGE_STATUS_LABELS } from "@/constants/statuses";
import { SERVICE_CATEGORIES, CITIES, FEDERAL_DISTRICT_OPTIONS, getCitiesByDistrict } from "@/constants/categories";
import type { CompanyProfile, ContractorReview, Request, Service, UserRole } from "@/data/types";
import {
  AlertCircle, Building2, CheckCircle, Clock, FileText, Hash, MapPin, Plus, ShieldCheck, Star, User,
} from "lucide-react";

interface Props {
  role: UserRole;
  slug: string;
}

function getRequestEventTitle(request: Request) {
  if (!request.eventId) return undefined;
  return SEED_EVENTS.find((event) => event.id === request.eventId)?.title;
}

function CompanyRequisites({ user }: { user: CompanyProfile }) {
  const rows: { icon: typeof Building2; label: string; value: string }[] = [
    { icon: Building2, label: "Полное наименование", value: user.name },
    { icon: Hash, label: "ИНН", value: user.inn },
    { icon: Hash, label: "ОГРН", value: user.ogrn },
    { icon: MapPin, label: "Юридический адрес", value: user.address },
    { icon: User, label: "Генеральный директор", value: user.director },
    { icon: FileText, label: "Основной ОКВЭД", value: user.mainOkved },
  ];

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <p className="text-lg font-semibold">{user.name}</p>
          <p className="text-sm text-gray-600">{user.description}</p>
        </div>
        {user.verified && (
          <Badge className="shrink-0"><ShieldCheck className="h-3.5 w-3.5" /> Верифицирована</Badge>
        )}
      </div>

      <dl className="divide-y divide-gray-200 border-t border-gray-200">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between items-start gap-4 py-2.5 text-sm">
            <dt className="flex items-center gap-2 text-gray-600 shrink-0">
              <r.icon className="h-4 w-4" /> {r.label}
            </dt>
            <dd className="text-right font-medium">{r.value}</dd>
          </div>
        ))}
        {user.additionalOkved.length > 0 && (
          <div className="flex justify-between items-start gap-4 py-2.5 text-sm">
            <dt className="flex items-center gap-2 text-gray-600 shrink-0">
              <FileText className="h-4 w-4" /> Доп. ОКВЭД
            </dt>
            <dd className="text-right">
              <div className="flex flex-wrap gap-1.5 justify-end">
                {user.additionalOkved.map((okved) => (
                  <Badge key={okved} variant="dashed">{okved}</Badge>
                ))}
              </div>
            </dd>
          </div>
        )}
      </dl>

      <p className="text-xs text-gray-500 border border-dashed border-gray-300 p-2 mt-4">
        Реквизиты загружены из ЕГРЮЛ по ИНН и подтверждены при регистрации.
      </p>
    </Card>
  );
}

export function AccountPageRenderer({ role, slug }: Props) {
  const nav = getNavForRole(role || "");
  const current = nav.find((n) => n.slug === slug) || nav[0];
  const user = useAuthStore((s) => s.user);
  const isDashboard = slug === "" || slug === "dashboard";
  const portfolioItemId = slug.startsWith("portfolio/") ? slug.split("/")[1] : null;
  const venueEventId = slug.startsWith("events/") ? slug.split("/")[1] : null;
  const venueEvent = venueEventId
    ? SEED_EVENTS.find((event) => event.id === venueEventId)
    : undefined;
  const contractorForTitle =
    role === "contractor"
      ? findContractorForUser(user) ?? undefined
      : undefined;
  const portfolioItem = portfolioItemId
    ? contractorForTitle?.portfolio.find((item) => item.id === portfolioItemId)
    : undefined;
  const pageTitle =
    portfolioItem || (slug === "portfolio" && role === "contractor") || (venueEvent && role === "venue") || slug === "floor-plan" || slug === "halls"
      ? null
      : slug === "create-event" || slug === "edit-event" || slug.startsWith("events/")
        ? null
        : isDashboard && role === "venue" && user?.name
            ? user.name
            : isDashboard && role === "organizer"
              ? null
              : current?.label || "Кабинет";

  const renderContent = () => {
    if (role === "customer") return <CustomerPages slug={slug} />;
    if (role === "contractor") return <ContractorPages slug={slug} />;
    if (role === "venue") return <VenuePages slug={slug} />;
    if (role === "organizer") return <OrganizerPages slug={slug} />;
    return null;
  };

  return (
    <div>
      {pageTitle && <h1 className="text-xl font-bold mb-4">{pageTitle}</h1>}
      {role === "venue" && user && !slug.startsWith("events/") && slug !== "halls" && slug !== "floor-plan" ? (
        <VenueCabinetHeader user={user} />
      ) : null}
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

function PhotoUploadSection({
  title,
  photos,
  onUpload,
}: {
  title: string;
  photos: string[];
  onUpload: (fileName: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium mb-3">{title}</p>
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {photos.map((photo, index) => (
            <div
              key={`${title}-${photo}-${index}`}
              className="aspect-[4/3] border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center p-2 text-center text-xs text-gray-500"
            >
              {photo}
            </div>
          ))}
        </div>
      )}
      <FileUpload
        label="Загрузить фотографии"
        accept="image/*"
        onUpload={onUpload}
      />
    </div>
  );
}

function ProductionSection({
  user,
  showToast,
}: {
  user: CompanyProfile | null;
  showToast: ReturnType<typeof useToast>["showToast"];
}) {
  const [productionPhotos, setProductionPhotos] = useState(["Цех", "Склад"]);
  const [equipmentPhotos, setEquipmentPhotos] = useState(["Фрезерный станок", "Лазерная резка"]);

  return (
    <div className="max-w-2xl space-y-4">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" defaultChecked={user?.hasProduction} /> Собственное производство
      </label>
      <Input label="Адрес производства" defaultValue="г. Москва, ул. Заводская, 15" />
      <Input label="Площадь, кв.м" defaultValue="1200" />
      <Textarea label="Оборудование" defaultValue="Фрезерный станок, лазерная резка" />
      <PhotoUploadSection
        title="Фотографии производства"
        photos={productionPhotos}
        onUpload={(fileName) => setProductionPhotos((prev) => [...prev, fileName])}
      />
      <PhotoUploadSection
        title="Фотографии оборудования"
        photos={equipmentPhotos}
        onUpload={(fileName) => setEquipmentPhotos((prev) => [...prev, fileName])}
      />
      <Button onClick={() => showToast("Сохранено")}>Сохранить</Button>
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
  const cartItems = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const favoriteIds = useFavoritesStore((s) => s.serviceIds);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);
  const { showToast } = useToast();
  const router = useRouter();
  const [edoModal, setEdoModal] = useState(showEdoPrompt);
  const [edoTab, setEdoTab] = useState("connection");

  const recommendedEvents = SEED_EVENTS.filter((e) => user && matchOkved(user.mainOkved, e.okvedTags));

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
            {recommendedEvents.slice(0, 3).map((e) => (
              <Link key={e.id} href={`/events/${e.id}`} className="block text-sm mt-2 hover:underline">
                {e.title} — {getOkvedRecommendationReason(user?.mainOkved || "")}
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
      </>
    );
  }

  if (slug === "profile") {
    return (
      <form className="space-y-4 max-w-lg" onSubmit={(e) => { e.preventDefault(); showToast("Профиль сохранён"); }}>
        <Input label="Название компании" defaultValue={user?.name} />
        <Input label="ИНН" defaultValue={user?.inn} readOnly />
        <Input label="ОГРН" defaultValue={user?.ogrn} readOnly />
        <Textarea label="Описание" defaultValue={user?.description} />
        <Input label="ОКВЭД" defaultValue={user?.mainOkved} readOnly />
        <Button type="submit">Сохранить</Button>
      </form>
    );
  }

  if (slug === "legal") {
    return (
      <div className="space-y-4 max-w-lg">
        <Input label="ИНН" defaultValue={user?.inn} />
        <Input label="КПП" defaultValue="770101001" />
        <Input label="ОГРН (для ООО)" defaultValue={user?.ogrn} />
        <Input label="ОГРНИП (для ИП)" defaultValue="" placeholder="Заполняется для индивидуальных предпринимателей" />
        <Input label="Юридический адрес" defaultValue={user?.address} />
        <Input label="Фактический адрес" defaultValue="г. Москва, ул. Производственная, д. 12" />
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
    const favoriteServices = favoriteIds
      .map((id) => services.find((service) => service.id === id))
      .filter((service): service is Service => Boolean(service));

    const handleToggleFavorite = (service: Service) => {
      const added = toggleFavorite(service.id);
      showToast(
        added ? `«${service.title}» добавлено в избранное` : `«${service.title}» удалено из избранного`,
        added ? "success" : "info"
      );
    };

    const handleAddToCart = (service: Service) => {
      addItem({ serviceId: service.id, quantity: 1, comment: "", files: [] });
      showToast(`«${service.title}» добавлено в корзину`, "success");
    };

    return (
      <div className="space-y-4">
        {favoriteServices.length === 0 ? (
          <EmptyState
            title="Избранное пусто"
            description="Добавляйте услуги в избранное из каталога — нажмите на сердечко на карточке услуги"
            actionLabel="Перейти к услугам"
            onAction={() => router.push("/services")}
          />
        ) : (
          <>
            <p className="text-sm text-gray-600">
              Сохранено услуг: {favoriteServices.length}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {favoriteServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isFavorite={isFavorite(service.id)}
                  onToggleFavorite={() => handleToggleFavorite(service)}
                  onAdd={() => handleAddToCart(service)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (slug === "cart") {
    return (
      <div>
        <p className="text-sm mb-4">Позиций в корзине: {cartItems.length}</p>
        <Link href="/cart"><Button>Перейти в корзину</Button></Link>
      </div>
    );
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <Link key={d.id} href={`/deals/${d.id}`} className="block h-full">
            <Card className="flex flex-col h-full hover:border-gray-900 transition-colors">
              <CardTitle>{d.title}</CardTitle>
              <CardDescription className="flex-1">
                {d.number} · {d.contractorName} · {formatPrice(d.totalPrice)}
              </CardDescription>
              <span className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-gray-900 text-gray-900">
                Повторить заказ
              </span>
            </Card>
          </Link>
        ))}
      </div>
    );
  }

  if (slug === "repeat-order") {
    const completed = deals.filter((d) => d.customerId === user?.id && d.status === "completed");
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600">Выберите завершённый заказ для повторения:</p>
        {completed.map((d) => (
          <Card key={d.id}>
            <CardTitle>{d.title}</CardTitle>
            <Button size="sm" className="mt-2" onClick={() => { router.push(`/requests/new?format=${d.format}`); showToast("Форма предзаполнена"); }}>Повторить заказ</Button>
          </Card>
        ))}
      </div>
    );
  }

  if (slug === "checks") {
    return <ChecksPanel />;
  }

  if (slug === "payments") return <PaymentsPanel />;
  if (slug === "documents") return <DocumentsPanel />;

  if (slug === "reviews") {
    return <CustomerReviewsSection deals={deals} showToast={showToast} />;
  }

  if (slug === "settings") {
    return (
      <div className="max-w-lg space-y-4">
        <Input label="Email уведомлений" defaultValue="demo@example.ru" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Email-уведомления</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Push-уведомления</label>
        <PinLoginSettings />
        <Button onClick={() => showToast("Настройки сохранены")}>Сохранить</Button>
      </div>
    );
  }

  return <EmptyState title="Раздел не найден" />;
}

function ContractorPages({ slug }: { slug: string }) {
  const user = useAuthStore((s) => s.user);
  const { requests, deals, responses, services, addService, removeService } = usePrototypeStore();
  const { showToast } = useToast();
  const router = useRouter();
  const [reviewModal, setReviewModal] = useState<ContractorReview | null>(null);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    title: "",
    category: SERVICE_CATEGORIES[0],
    city: CITIES[0],
    price: "",
    priceFormat: "фиксированная",
    deadline: "",
    description: "",
    terms: "",
  });
  const [serviceErrors, setServiceErrors] = useState<Record<string, string>>({});

  const resetServiceForm = () =>
    setServiceForm({
      title: "",
      category: SERVICE_CATEGORIES[0],
      city: CITIES[0],
      price: "",
      priceFormat: "фиксированная",
      deadline: "",
      description: "",
      terms: "",
    });

  const handleAddService = () => {
    const errs: Record<string, string> = {};
    if (!serviceForm.title.trim()) errs.title = "Укажите название услуги";
    if (!serviceForm.price || Number(serviceForm.price) <= 0) errs.price = "Укажите корректную цену";
    if (!serviceForm.deadline.trim()) errs.deadline = "Укажите сроки";
    setServiceErrors(errs);
    if (Object.keys(errs).length > 0) return;

    addService({
      id: `svc-${Date.now()}`,
      title: serviceForm.title.trim(),
      city: serviceForm.city,
      contractorId: getContractorIdForUser(user) ?? user?.id ?? "ctr-1",
      contractorName: user?.name || "Исполнитель",
      category: serviceForm.category,
      price: Number(serviceForm.price),
      priceFormat: serviceForm.priceFormat,
      description: serviceForm.description.trim(),
      terms: serviceForm.terms.trim(),
      deadline: serviceForm.deadline.trim(),
      rating: 0,
      reviewCount: 0,
    });
    showToast("Услуга добавлена");
    resetServiceForm();
    setServiceErrors({});
    setServiceModalOpen(false);
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
        <div className="flex gap-2 mt-4">
          <Link href="/services"><Button size="sm" variant="outline">Купить услугу</Button></Link>
          <Link href="/requests/new?format=urgent"><Button size="sm" variant="outline">Срочный заказ</Button></Link>
        </div>
      </>
    );
  }

  if (slug === "profile") {
    return (
      <div className="max-w-2xl space-y-4">
        {user && <CompanyRequisites user={user} />}
        <Card className="space-y-4">
          <p className="text-sm font-medium">Публичная информация</p>
          <Input label="Отображаемое название" defaultValue={user?.name} />
          <Textarea label="Описание компании" defaultValue={user?.description} />
          <Button onClick={() => showToast("Сохранено")}>Сохранить</Button>
        </Card>
      </div>
    );
  }

  if (slug === "cities") {
    return <ContractorCitiesSection user={user} showToast={showToast} />;
  }

  if (slug === "production") {
    return <ProductionSection user={user} showToast={showToast} />;
  }

  if (slug === "services") {
    const contractorId = getContractorIdForUser(user);
    const myServices = services.filter(
      (s) =>
        (contractorId !== null && s.contractorId === contractorId) ||
        s.contractorId === user?.id ||
        s.contractorName === user?.name
    );
    return (
      <div>
        <Button size="sm" className="mb-4" onClick={() => setServiceModalOpen(true)}>
          <Plus className="h-4 w-4" /> Добавить услугу
        </Button>
        {myServices.length === 0 ? (
          <EmptyState
            title="Услуги не добавлены"
            description="Добавьте первую услугу, чтобы получать заказы"
            actionLabel="Добавить услугу"
            onAction={() => setServiceModalOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {myServices.map((s) => (
              <Card key={s.id}>
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <CardTitle>{s.title}</CardTitle>
                    <CardDescription>
                      {formatPrice(s.price)} · {s.city} · {s.category}
                    </CardDescription>
                    {s.deadline && <p className="text-xs text-gray-500 mt-1">Сроки: {s.deadline}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/services/${s.id}`}>
                      <Button size="sm" variant="ghost">Открыть</Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        removeService(s.id);
                        showToast("Услуга удалена", "info");
                      }}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal
          open={serviceModalOpen}
          onClose={() => setServiceModalOpen(false)}
          title="Добавить услугу"
          footer={
            <>
              <Button variant="outline" onClick={() => setServiceModalOpen(false)}>Отмена</Button>
              <Button onClick={handleAddService}>Добавить</Button>
            </>
          }
        >
          <div className="space-y-3">
            <Input
              label="Название услуги"
              value={serviceForm.title}
              onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
              error={serviceErrors.title}
              placeholder="Например: Дизайн-проект стенда"
            />
            <Select
              label="Категория"
              options={SERVICE_CATEGORIES.map((c) => ({ value: c, label: c }))}
              value={serviceForm.category}
              onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
            />
            <Select
              label="Город"
              options={CITIES.map((c) => ({ value: c, label: c }))}
              value={serviceForm.city}
              onChange={(e) => setServiceForm({ ...serviceForm, city: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Цена, ₽"
                type="number"
                value={serviceForm.price}
                onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                error={serviceErrors.price}
                placeholder="0"
              />
              <Select
                label="Формат цены"
                options={[
                  { value: "фиксированная", label: "Фиксированная" },
                  { value: "от", label: "От" },
                  { value: "за день", label: "За день" },
                  { value: "за комплект", label: "За комплект" },
                ]}
                value={serviceForm.priceFormat}
                onChange={(e) => setServiceForm({ ...serviceForm, priceFormat: e.target.value })}
              />
            </div>
            <Input
              label="Сроки"
              value={serviceForm.deadline}
              onChange={(e) => setServiceForm({ ...serviceForm, deadline: e.target.value })}
              error={serviceErrors.deadline}
              placeholder="Например: 10 рабочих дней"
            />
            <Textarea
              label="Описание"
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              placeholder="Что входит в услугу"
            />
            <Textarea
              label="Условия"
              value={serviceForm.terms}
              onChange={(e) => setServiceForm({ ...serviceForm, terms: e.target.value })}
              placeholder="Например: предоплата 50%"
            />
          </div>
        </Modal>
      </div>
    );
  }

  if (slug.startsWith("portfolio/")) {
    const itemId = slug.split("/")[1];
    const contractor = findContractorForUser(user);
    const item = contractor?.portfolio.find((entry) => entry.id === itemId);

    if (!item) {
      return (
        <EmptyState
          title="Проект не найден"
          actionLabel="К портфолио"
          onAction={() => router.push("/account/contractor/portfolio")}
        />
      );
    }

    return (
      <PortfolioDetail
        item={item}
        backHref="/account/contractor/portfolio"
        editable
        onSave={() => showToast("Проект сохранён")}
      />
    );
  }

  if (slug === "portfolio") {
    const contractor = findContractorForUser(user);
    const portfolio = contractor?.portfolio ?? [];

    return (
      <>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold">Портфолио</h1>
          <Button onClick={() => showToast("Добавление проекта в портфолио")}>
            Добавить портфолио
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {portfolio.map((item) => (
          <PortfolioCard
            key={item.id}
            item={item}
            href={`/account/contractor/portfolio/${item.id}`}
          />
        ))}
        </div>
      </>
    );
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
    const myResponses = responses.filter((r) => isResponseForUser(r, user));
    const responseStatusLabels: Record<string, string> = {
      pending: "На рассмотрении",
      accepted: "Принят",
      rejected: "Отклонён",
      withdrawn: "Отозван",
    };
    if (myResponses.length === 0) {
      return (
        <EmptyState
          title="Откликов пока нет"
          description="Откликнитесь на доступные заявки, чтобы получить заказы"
          actionLabel="Доступные заявки"
          onAction={() => router.push("/account/contractor/available-requests")}
        />
      );
    }
    return (
      <div className="space-y-3">
        {myResponses.map((r) => {
          const req = requests.find((rq) => rq.id === r.requestId);
          return (
            <Link key={r.id} href={`/requests/${r.requestId}/respond`}>
              <Card className="hover:border-gray-900 transition-colors">
                <div className="flex justify-between items-start gap-3 flex-wrap">
                  <div>
                    <CardTitle>{req?.title ?? "Заявка"}</CardTitle>
                    <CardDescription>
                      {formatPrice(r.price)} · {r.deadline} · Статус: {responseStatusLabels[r.status] ?? r.status}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{responseStatusLabels[r.status] ?? r.status}</Badge>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
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
    return (
      <div className="max-w-lg space-y-4">
        <Input label="Email" defaultValue="contractor@example.ru" />
        <PinLoginSettings />
        <Button onClick={() => showToast("Сохранено")}>Сохранить</Button>
      </div>
    );
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

  if (slug === "bookings") {
    return <VenueBookingsSection />;
  }

  if (slug === "orders") {
    return (
      <EventOrdersPanel
        eventId="evt-1"
        venueId="venue-1"
        showVenueNote
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
    return (
      <div className="max-w-lg space-y-4">
        <Input label="Название" defaultValue="ООО «МебельЭкспо Организатор»" />
        <Textarea label="Описание" />
        <Button onClick={() => showToast("Сохранено")}>Сохранить</Button>
      </div>
    );
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
