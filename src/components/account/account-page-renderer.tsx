"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
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
import { BackButton } from "@/components/ui/back-button";
import { OrganizerDashboardSection } from "@/components/organizer/organizer-dashboard-section";
import { OrganizerSettingsSection } from "@/components/organizer/organizer-settings-section";
import { OrganizerEventsSection } from "@/components/organizer/organizer-events-section";
import { OrganizerEventFormSection } from "@/components/organizer/organizer-event-form-section";
import { OrganizerVenuesSection } from "@/components/organizer/organizer-venues-section";
import { OrganizerParticipantDetailSection } from "@/components/organizer/organizer-participant-detail-section";
import { CustomerSettingsSection } from "@/components/customer/customer-settings-section";
import { CustomerProjectsSection } from "@/components/customer/customer-projects-section";
import { CustomerDashboardRecommendations } from "@/components/customer/customer-dashboard-recommendations";
import { ContractorDashboardSection } from "@/components/contractor/contractor-dashboard-section";
import { ContractorServiceDetailSection } from "@/components/contractor/contractor-service-detail-section";
import {
  ContractorServiceFormModal,
  buildServicePayload,
  createEmptyServiceForm,
  serviceToFormState,
  type ServiceFormState,
} from "@/components/contractor/contractor-service-form-modal";
import { CustomerFavoritesSection } from "@/components/customer/customer-favorites-section";
import { CustomerCartSection } from "@/components/customer/customer-cart-section";
import { CustomerCheckoutSection } from "@/components/customer/customer-checkout-section";
import { RepeatOrderForm } from "@/components/customer/repeat-order-form";
import { CustomerMyEventsSection } from "@/components/customer/customer-my-events-section";
import { VenueHallsSection } from "@/components/venue/venue-halls-section";
import { ResponseCard } from "@/components/responses/response-card";
import { ChecksPanel } from "@/components/account/checks-panel";
import { ContractorPortfolioFormSection } from "@/components/contractor/contractor-portfolio-section";
import {
  ContractorCatalogFormSection,
  ContractorServicesListSection,
} from "@/components/contractor/contractor-catalog-section";
import { ContractorMyResponsesSection } from "@/components/contractor/contractor-my-responses-section";
import { ProjectGanttSection } from "@/components/contractor/project-gantt-section";
import { ContractorSettingsSection } from "@/components/contractor/contractor-settings-section";
import { AccountContractorSection } from "@/components/contractors/account-contractor-section";
import { AvailableRequestCard } from "@/components/requests/available-request-card";
import { VenueServicesSection } from "@/components/venue/venue-services-section";
import { VenueSettingsSection } from "@/components/venue/venue-settings-section";
import { VenueEventsSection } from "@/components/venue/venue-events-section";
import { VenueBookingsSection } from "@/components/venue/venue-bookings-section";
import { VenueBookingDetailSection } from "@/components/venue/venue-booking-detail-section";
import { VenueEventBookingsSection } from "@/components/venue/venue-event-bookings-section";
import { VenueProfileSection } from "@/components/venue/venue-profile-section";
import { VenueEventDetailSection } from "@/components/venue/venue-event-detail-section";
import { VenueEventOrdersSection } from "@/components/venue/venue-event-orders-section";
import { PinLoginSettings } from "@/components/account/pin-login-settings";
import { CompanyProfileSection } from "@/components/account/company-profile-section";
import {
  DashboardStatCard,
  DashboardStatsGrid,
  PaymentInvoicesLabel,
} from "@/components/account/dashboard-stat-card";
import { PaymentsPanel } from "@/components/finance/payments-panel";
import { VenuePaymentsPanel } from "@/components/finance/venue-payments-panel";
import { OrganizerPaymentsPanel } from "@/components/finance/organizer-payments-panel";
import { EventOrdersPanel } from "@/components/deals/event-orders-panel";
import { DocumentsPanel } from "@/components/documents/documents-panel";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import {
  getContractorPayoutBalance,
  isPaymentForUser,
  isRequestVisibleToContractor,
} from "@/lib/utils/cabinet-scope";
import {
  findContractorForUser,
  getContractorIdForUser,
  getVenueIdForUser,
  isDealForUser,
} from "@/lib/utils/user-entity-map";
import { useToast } from "@/components/ui/toast-provider";
import { getNavForRole } from "@/constants/nav-menus";
import { DEMO_USERS, SEED_CONTRACTORS, SEED_EVENTS, SEED_SERVICES } from "@/data/mocks/seed";
import { getInterestRecommendationReason, getOkvedRecommendationReason, matchInterests, matchOkved } from "@/lib/utils/okved";
import { CUSTOMER_CART_HREF } from "@/lib/utils/cart-routes";
import { withFromParam } from "@/lib/utils/message-related-links";
import { formatDate, formatDateTime, formatPrice } from "@/lib/utils/formatters";
import { DEAL_STATUS_LABELS, REQUEST_FORMAT_LABELS, STAGE_STATUS_LABELS } from "@/constants/statuses";
import type { CompanyProfile, Request, Service, UserRole } from "@/data/types";
import {
  AlertCircle, CheckCircle, Clock, Plus,
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
  const router = useRouter();
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
  const searchParams = useSearchParams();
  const fromMessages = searchParams.get("from") === "messages";
  const pageTitle =
    slug === "repeat-order"
      ? "Повторить заказ"
      : (slug === "profile" || slug === "legal" || slug === "cities" || slug === "production" || slug === "portfolio" || slug === "reviews") && role !== "venue"
      ? null
      : isPortfolioFormPage || slug === "portfolio" || isCatalogFormPage || contractorServiceId || (venueEvent && role === "venue") || slug === "floor-plan" || slug === "halls" || slug === "spaces"
      ? null
      : slug === "create-event" || slug === "edit-event" || slug.startsWith("events/") || slug.startsWith("orders/") || slug.startsWith("bookings/") || slug.startsWith("contractors/")
        ? null
        : isDashboard && (role === "venue" || role === "organizer")
          ? matchedNav?.label || "Дашборд"
          : slug === "documents" && role === "customer"
            ? "ЭДО и документооборот"
          : slug === "cart"
            ? "Корзина"
          : slug === "checkout"
            ? "Оформление заказа"
          : slug === "gantt" && role === "contractor"
            ? "Сводный график"
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
        <BackButton fallbackHref="/account/customer/active-projects?tab=completed" className="mb-2" />
      )}
      {slug === "checkout" && (
        <BackButton fallbackHref="/account/customer/cart" className="mb-2" />
      )}
      {slug === "gantt" && role === "contractor" && (
        <BackButton fallbackHref="/account/contractor/active-projects" className="mb-2" />
      )}
      {fromMessages && slug === "bookings" && (
        <BackButton
          className="mb-2"
          fallbackHref="/messages"
          onClick={() => router.push("/messages")}
        />
      )}
      {pageTitle && (
        <div
          className={
            slug === "favorites" || (role === "contractor" && slug === "active-projects")
              ? "relative mb-[24px]"
              : "mb-4"
          }
        >
          <h1 className="text-xl font-bold">{pageTitle}</h1>
          {role === "customer" && slug === "favorites" && (
            <Link href={CUSTOMER_CART_HREF} className="absolute right-0 top-0">
              <Button variant="soft-outline">
                <ShoppingCart className="h-4 w-4" />
                Корзина
              </Button>
            </Link>
          )}
          {role === "contractor" && slug === "active-projects" && (
            <Button
              variant="outline"
              size="sm"
              className="absolute right-0 top-0"
              onClick={() => router.push("/account/contractor/gantt")}
            >
              Сводный график
            </Button>
          )}
        </div>
      )}
      {renderContent()}
    </div>
  );
}

function DashboardWidgets({ role }: { role: string }) {
  const { requests, deals, payments } = usePrototypeStore();
  const user = useAuthStore((s) => s.user);
  const activeDeals = deals.filter(
    (d) => d.status !== "completed" && isDealForUser(d, user)
  );
  const myPayments = payments.filter((p) => isPaymentForUser(p, user, deals));
  const pendingIncoming = myPayments.filter(
    (p) => p.status === "pending" && (p.direction === "incoming" || !p.direction)
  ).length;
  const pendingOutgoing = myPayments.filter(
    (p) => p.status === "pending" && p.direction === "outgoing"
  ).length;

  return (
    <div className="mb-6">
      <DashboardStatsGrid>
        <DashboardStatCard
          value={
            role === "contractor"
              ? requests.filter((r) => isRequestVisibleToContractor(r, user)).length
              : requests.filter((r) => r.status === "published" && r.customerId === user?.id).length
          }
          label={role === "contractor" ? "Активные заказы" : "Активные заявки"}
        />
        <DashboardStatCard value={activeDeals.length} label="Активные проекты" />
        <DashboardStatCard
          value={pendingOutgoing}
          label={
            <PaymentInvoicesLabel
              direction="исходящие"
              tooltip="Например, если в качестве заказчика выступает агентство и оно выставляет счёт конечному заказчику"
            />
          }
        />
        <DashboardStatCard
          value={pendingIncoming}
          label={<PaymentInvoicesLabel direction="входящие" />}
        />
      </DashboardStatsGrid>
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
  const [edoTab, setEdoTab] = useState(() =>
    slug === "documents"
      ? "documents"
      : slug === "reminders"
        ? "reminders"
        : slug === "closing-docs"
          ? "closing"
          : "connection"
  );

  useEffect(() => {
    if (slug === "documents") setEdoTab("documents");
    else if (slug === "reminders") setEdoTab("reminders");
    else if (slug === "closing-docs") setEdoTab("closing");
    else if (slug === "edo") setEdoTab("connection");
  }, [slug]);

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
          <Modal
            open
            title="Подключите ЭДО"
            onClose={() => {
              setEdoModal(false);
              setShowEdoPrompt(false);
            }}
            footer={
              <Link href="/account/customer/edo">
                <Button onClick={() => setEdoModal(false)}>Подключить</Button>
              </Link>
            }
          >
            <p className="text-sm">
              Для подписания документов рекомендуем подключить электронный документооборот.
            </p>
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
                href={withFromParam(`/events/${event.id}`, "dashboard")}
                className="block text-sm mt-2 hover:underline"
              >
                {event.title} — {getOkvedRecommendationReason(user?.mainOkved || "")}
              </Link>
            ))}
            {interestRecommendedEvents.map((event) => (
              <Link
                key={event.id}
                href={withFromParam(`/events/${event.id}`, "dashboard")}
                className="block text-sm mt-2 hover:underline"
              >
                {event.title} — {getInterestRecommendationReason()}
              </Link>
            ))}
          </Card>
        </div>
        <Card className="mt-4">
          <CardTitle>Сделки, требующие действия</CardTitle>
          {deals
            .filter(
              (d) =>
                ["negotiation", "stage_review", "awaiting_payment"].includes(d.status) &&
                isDealForUser(d, user)
            )
            .map((d) => (
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
    return <CompanyProfileSection showToast={showToast} initialTab="company" />;
  }

  if (slug === "edo" || slug === "reminders" || slug === "closing-docs" || slug === "documents") {
    const pendingDocs = documents.filter((d) => d.status === "sent");
    const isDocumentsTab = edoTab === "documents";
    return (
      <div className="space-y-4 w-full">
        <Tabs
          tabs={[
            { id: "connection", label: "Подключение ЭДО" },
            { id: "documents", label: "Документы" },
            { id: "reminders", label: `Напоминания${pendingDocs.length ? ` (${pendingDocs.length})` : ""}` },
            { id: "closing", label: "Запрос закрывающих" },
          ]}
          activeTab={edoTab}
          onChange={setEdoTab}
          className="w-full"
        />

        <div className={isDocumentsTab ? undefined : "max-w-2xl"}>

        {edoTab === "connection" && (
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

        {edoTab === "documents" && <DocumentsPanel hideEdoPrompt />}

        {edoTab === "reminders" && (
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

        {edoTab === "closing" && (
          <div>
            <p className="text-sm mb-4">Запросите закрывающие документы у исполнителей.</p>
            <div className="flex flex-col gap-3">
              <Select label="Сделка" options={deals.map((d) => ({ value: d.id, label: d.title }))} />
              <Textarea label="Комментарий" />
              <Button onClick={() => showToast("Запрос отправлен")}>Запросить документы</Button>
            </div>
          </div>
        )}
        </div>
      </div>
    );
  }

  if (slug === "favorites") {
    return <CustomerFavoritesSection />;
  }

  if (slug === "cart") {
    return <CustomerCartSection />;
  }

  if (slug === "checkout") {
    return <CustomerCheckoutSection cartHref="/account/customer/cart" />;
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

  if (slug === "active-projects" || slug === "completed-projects") {
    const projectTab =
      slug === "completed-projects" || searchParams.get("tab") === "completed"
        ? "completed"
        : "active";
    const customerDeals = deals.filter((deal) => deal.customerId === user?.id);
    return (
      <CustomerProjectsSection
        key={projectTab}
        deals={customerDeals}
        initialTab={projectTab}
      />
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
            onAction={() => router.push("/account/customer/active-projects?tab=completed")}
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
          onCancel={() => router.push("/account/customer/active-projects?tab=completed")}
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
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">Выберите завершённый заказ для повторения:</p>
        {completed.map((d) => (
          <Card key={d.id} borderHover>
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

  if (slug === "my-events") {
    return <CustomerMyEventsSection customerId={user?.id ?? "user-customer"} />;
  }

  if (slug === "settings") {
    return <CustomerSettingsSection customerId={user?.id ?? "user-customer"} showToast={showToast} />;
  }

  if (slug.startsWith("bookings/")) {
    const bookingId = slug.split("/")[1];
    if (bookingId && bookingId !== "event") {
      return (
        <VenueBookingDetailSection
          bookingId={bookingId}
          role="customer"
          showToast={showToast}
        />
      );
    }
  }

  return <EmptyState title="Раздел не найден" />;
}

function ContractorPages({ slug }: { slug: string }) {
  const user = useAuthStore((s) => s.user);
  const { requests, deals, responses, services, payments, addService, updateService, removeService, getContractorCatalogs, removeServiceCatalog } = usePrototypeStore();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
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
              {requests
                .filter((r) => isRequestVisibleToContractor(r, user))
                .slice(0, 3)
                .map((request) => {
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
            <p className="text-2xl font-bold mt-2">
              {formatPrice(getContractorPayoutBalance(payments, deals, user))}
            </p>
          </Card>
        </div>
        <ContractorDashboardSection user={user} />
      </>
    );
  }

  if (
    slug === "profile" ||
    slug === "cities" ||
    slug === "production" ||
    slug === "portfolio" ||
    slug === "reviews"
  ) {
    const profileTab =
      slug === "cities" || slug === "production" || slug === "portfolio" || slug === "reviews"
        ? slug
        : undefined;
    return <CompanyProfileSection showToast={showToast} initialTab={profileTab} />;
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

  if (slug === "available-requests") {
    const available = requests.filter((r) =>
      isRequestVisibleToContractor(r, user)
    );

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
    const projectTab =
      slug === "completed-projects" || searchParams.get("tab") === "completed"
        ? "completed"
        : "active";
    const contractorId = getContractorIdForUser(user);
    const contractorDeals = deals.filter(
      (deal) =>
        (contractorId !== null && deal.contractorId === contractorId) ||
        deal.contractorName === user?.name,
    );
    return (
      <CustomerProjectsSection
        key={projectTab}
        deals={contractorDeals}
        initialTab={projectTab}
        basePath="/account/contractor/active-projects"
        partnerName={(deal) => deal.customerName}
        showRepeatOrder={false}
      />
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

  if (slug === "settings") {
    const contractorId = getContractorIdForUser(user) ?? "ctr-1";
    return <ContractorSettingsSection contractorId={contractorId} showToast={showToast} />;
  }

  if (slug.startsWith("bookings/")) {
    const bookingId = slug.split("/")[1];
    if (bookingId && bookingId !== "event") {
      return (
        <VenueBookingDetailSection
          bookingId={bookingId}
          role="contractor"
          showToast={showToast}
        />
      );
    }
  }

  return <EmptyState title="Раздел не найден" />;
}

function VenuePages({ slug }: { slug: string }) {
  const { showToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const venueId = getVenueIdForUser(user);

  if (slug === "" || slug === "dashboard") {
    return <VenueDashboardSection venueId={venueId} />;
  }

  if (slug === "profile") {
    return <VenueProfileSection venueId={venueId} showToast={showToast} />;
  }

  if (slug === "halls" || slug === "spaces" || slug === "floor-plan") {
    return (
      <VenueHallsSection
        venueId={venueId}
        showToast={showToast}
        initialHallTab={slug === "floor-plan" ? "plan" : slug === "spaces" ? "sale" : "card"}
      />
    );
  }

  if (slug.startsWith("events/")) {
    const eventId = slug.split("/")[1];
    return <VenueEventDetailSection venueId={venueId} eventId={eventId} showToast={showToast} />;
  }

  if (slug === "events") {
    return <VenueEventsSection venueId={venueId} />;
  }

  if (slug === "venue-services") {
    return <VenueServicesSection venueId={venueId} showToast={showToast} />;
  }

  if (slug.startsWith("bookings/event/")) {
    const eventId = slug.split("/")[2];
    return <VenueEventBookingsSection eventId={eventId} venueId={venueId} />;
  }

  if (slug.startsWith("bookings/")) {
    const bookingId = slug.split("/")[1];
    return (
      <VenueBookingDetailSection
        bookingId={bookingId}
        venueId={venueId}
        role="venue"
        showToast={showToast}
      />
    );
  }

  if (slug === "bookings") {
    return <VenueBookingsSection venueId={venueId} />;
  }

  if (slug.startsWith("orders/")) {
    const eventId = slug.split("/")[1];
    return <VenueEventOrdersSection eventId={eventId} venueId={venueId} />;
  }

  if (slug === "orders") {
    return (
      <EventOrdersPanel
        venueId={venueId}
        showVenueNote
        showDirectionFilter
        title="Заказы площадки"
        unboxed
      />
    );
  }

  if (slug === "payments") return <VenuePaymentsPanel venueId={venueId} />;
  if (slug === "documents") return <DocumentsPanel />;
  if (slug === "notifications") return <Link href="/notifications"><Button>Уведомления</Button></Link>;

  if (slug === "settings") {
    return <VenueSettingsSection venueId={venueId} showToast={showToast} />;
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

  if (slug.startsWith("bookings/")) {
    const bookingId = slug.split("/")[1];
    if (bookingId && bookingId !== "event") {
      return (
        <VenueBookingDetailSection
          bookingId={bookingId}
          role="organizer"
          showToast={showToast}
        />
      );
    }
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