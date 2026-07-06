"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { FloorPlanGrid } from "@/components/catalog/floor-plan-grid";
import { useAuthStore, useCartStore, usePrototypeStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast-provider";
import { getNavForRole } from "@/constants/nav-menus";
import { SEED_EVENTS, SEED_SERVICES } from "@/data/mocks/seed";
import { formatDate, formatPrice, formatShortDate } from "@/lib/utils/formatters";
import { matchOkved, getOkvedRecommendationReason } from "@/lib/utils/okved";
import { DEAL_STATUS_LABELS, REQUEST_FORMAT_LABELS } from "@/constants/statuses";
import { SERVICE_CATEGORIES, CITIES } from "@/constants/categories";
import type { UserRole } from "@/data/types";
import {
  AlertCircle, CheckCircle, Clock, FileText, Plus, Star,
} from "lucide-react";

interface Props {
  role: UserRole;
  slug: string;
}

export function AccountPageRenderer({ role, slug }: Props) {
  const nav = getNavForRole(role || "");
  const current = nav.find((n) => n.slug === slug) || nav[0];

  const renderContent = () => {
    if (role === "customer") return <CustomerPages slug={slug} />;
    if (role === "contractor") return <ContractorPages slug={slug} />;
    if (role === "venue") return <VenuePages slug={slug} />;
    if (role === "organizer") return <OrganizerPages slug={slug} />;
    return null;
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">{current?.label || "Кабинет"}</h1>
      {renderContent()}
    </div>
  );
}

function DashboardWidgets({ role }: { role: string }) {
  const { requests, deals, notifications, payments } = usePrototypeStore();
  const user = useAuthStore((s) => s.user);
  const activeDeals = deals.filter((d) => d.status !== "completed" && d.customerId === user?.id || d.contractorId === user?.id);
  const unreadNotif = notifications.filter((n) => !n.read).length;
  const pendingPayments = payments.filter((p) => p.status === "pending").length;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <Card><CardTitle className="text-2xl">{requests.filter((r) => r.status === "published").length}</CardTitle><CardDescription>Активные заявки</CardDescription></Card>
      <Card><CardTitle className="text-2xl">{activeDeals.length}</CardTitle><CardDescription>Активные проекты</CardDescription></Card>
      <Card><CardTitle className="text-2xl">{unreadNotif}</CardTitle><CardDescription>Новые уведомления</CardDescription></Card>
      <Card><CardTitle className="text-2xl">{pendingPayments}</CardTitle><CardDescription>Неоплаченные счета</CardDescription></Card>
    </div>
  );
}

function CustomerPages({ slug }: { slug: string }) {
  const user = useAuthStore((s) => s.user);
  const { updateUser, showEdoPrompt, setShowEdoPrompt } = useAuthStore();
  const { requests, deals, responses, notifications, documents, payments } = usePrototypeStore();
  const cartItems = useCartStore((s) => s.items);
  const { showToast } = useToast();
  const router = useRouter();
  const [edoModal, setEdoModal] = useState(showEdoPrompt);

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
      <Card>
        <form className="space-y-4 max-w-lg" onSubmit={(e) => { e.preventDefault(); showToast("Профиль сохранён"); }}>
          <Input label="Название компании" defaultValue={user?.name} />
          <Input label="ИНН" defaultValue={user?.inn} readOnly />
          <Input label="ОГРН" defaultValue={user?.ogrn} readOnly />
          <Textarea label="Описание" defaultValue={user?.description} />
          <Input label="ОКВЭД" defaultValue={user?.mainOkved} readOnly />
          <Button type="submit">Сохранить</Button>
        </form>
      </Card>
    );
  }

  if (slug === "legal") {
    return (
      <Card>
        <div className="space-y-4 max-w-lg">
          <Input label="Юридический адрес" defaultValue={user?.address} />
          <Input label="Руководитель" defaultValue={user?.director} />
          <Input label="Расчётный счёт" defaultValue="40702810XXXXXXXXXXXX" />
          <Input label="БИК" defaultValue="044525225" />
          <Input label="Банк" defaultValue="ПАО «Вымышленный Банк»" />
          <Button onClick={() => showToast("Данные сохранены")}>Сохранить</Button>
        </div>
      </Card>
    );
  }

  if (slug === "edo") {
    return (
      <Card>
        {user?.edoStatus === "connected" ? (
          <div className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4" /> ЭДО подключено</div>
        ) : (
          <div className="space-y-4 max-w-lg">
            <div className="flex items-center gap-2 text-sm border border-dashed border-gray-400 p-3">
              <AlertCircle className="h-4 w-4" /> ЭДО не подключено. Документы можно скачать временно.
            </div>
            <Select label="Оператор ЭДО" options={[{ value: "sbis", label: "СБИС" }, { value: "kontur", label: "Контур" }, { value: "tensor", label: "Тензор" }]} />
            <Input label="Идентификатор участника" placeholder="2BM-..." />
            <Button onClick={() => { updateUser({ edoStatus: "connected" }); showToast("ЭДО подключено"); }}>Проверить и подключить</Button>
          </div>
        )}
      </Card>
    );
  }

  if (slug === "reminders") {
    return (
      <Card>
        <p className="text-sm text-gray-600 mb-4">Напоминания о входящих документах и сроках.</p>
        {documents.filter((d) => d.status === "sent").map((d) => (
          <div key={d.id} className="flex justify-between py-2 border-b text-sm">
            <span>{d.type} {d.number}</span>
            <Badge variant="dashed"><Clock className="h-3 w-3" /> Ожидает подписи</Badge>
          </div>
        ))}
        {documents.filter((d) => d.status === "sent").length === 0 && <EmptyState title="Нет напоминаний" />}
      </Card>
    );
  }

  if (slug === "closing-docs") {
    return (
      <Card>
        <p className="text-sm mb-4">Запросите закрывающие документы у исполнителей.</p>
        <Select label="Сделка" options={deals.map((d) => ({ value: d.id, label: d.title }))} />
        <Textarea label="Комментарий" className="mt-3" />
        <Button className="mt-3" onClick={() => showToast("Запрос отправлен")}>Запросить документы</Button>
      </Card>
    );
  }

  if (slug === "requests") {
    return <Link href="/requests"><Button>Перейти к заявкам</Button></Link>;
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
    const myResponses = responses.filter((r) => myRequests.some((req) => req.id === r.requestId));
    return (
      <div className="space-y-3">
        {myResponses.map((r) => (
          <Card key={r.id}>
            <div className="flex justify-between">
              <div>
                <CardTitle>{r.contractorName}</CardTitle>
                <CardDescription>{formatPrice(r.price)} · {r.deadline}</CardDescription>
              </div>
              <Link href={`/requests/${r.requestId}/responses`}><Button size="sm" variant="outline">Открыть</Button></Link>
            </div>
          </Card>
        ))}
        {myResponses.length === 0 && <EmptyState title="Нет откликов" actionLabel="Создать заявку" onAction={() => router.push("/requests/new")} />}
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
    return (
      <div className="space-y-3">
        {completed.map((d) => (
          <Card key={d.id}>
            <CardTitle>{d.title}</CardTitle>
            <CardDescription>{d.contractorName} · {formatPrice(d.totalPrice)} · Завершена</CardDescription>
          </Card>
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
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600">История проверок контрагентов</p>
        <Card><CardTitle>ООО «СтендПро»</CardTitle><CardDescription>Проверено 10.01.2026 · Риски не выявлены</CardDescription></Card>
        <Link href="/contractors/ctr-1/check"><Button variant="outline" size="sm">Новая проверка</Button></Link>
      </div>
    );
  }

  if (slug === "payments") return <Link href="/payments"><Button>Перейти к оплатам</Button></Link>;
  if (slug === "documents") return <Link href="/documents"><Button>Перейти к документам</Button></Link>;

  if (slug === "reviews") {
    return (
      <Card>
        <p className="text-sm mb-4">Оставьте отзыв о завершённой сделке:</p>
        <Select label="Сделка" options={deals.filter((d) => d.status === "completed").map((d) => ({ value: d.id, label: d.title }))} />
        <div className="flex gap-1 my-3">{[1,2,3,4,5].map((n) => <button key={n} className="border border-gray-300 p-2 hover:border-gray-900"><Star className="h-4 w-4" /></button>)}</div>
        <Textarea label="Отзыв" />
        <Button className="mt-3" onClick={() => showToast("Отзыв опубликован")}>Отправить</Button>
      </Card>
    );
  }

  if (slug === "settings") {
    return (
      <Card className="max-w-lg space-y-4">
        <Input label="Email уведомлений" defaultValue="demo@example.ru" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Email-уведомления</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Push-уведомления</label>
        <Button onClick={() => showToast("Настройки сохранены")}>Сохранить</Button>
      </Card>
    );
  }

  return <EmptyState title="Раздел не найден" />;
}

function ContractorPages({ slug }: { slug: string }) {
  const user = useAuthStore((s) => s.user);
  const { requests, deals, responses } = usePrototypeStore();
  const { showToast } = useToast();
  const router = useRouter();
  const [ganttView, setGanttView] = useState("list");

  if (slug === "" || slug === "dashboard") {
    return (
      <>
        <DashboardWidgets role="contractor" />
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardTitle>Новые заявки</CardTitle>
            {requests.filter((r) => r.status === "published").slice(0, 3).map((r) => (
              <Link key={r.id} href={`/requests/${r.id}`} className="block text-sm py-1 hover:underline">{r.title}</Link>
            ))}
          </Card>
          <Card>
            <CardTitle>Доступно к выплате</CardTitle>
            <p className="text-2xl font-bold mt-2">{formatPrice(185000)}</p>
            <p className="text-sm text-gray-600">Рейтинг: {user?.rating} ({user?.reviewCount} отзывов)</p>
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
      <Card className="max-w-lg space-y-4">
        <Input label="Название" defaultValue={user?.name} />
        <Textarea label="Описание" defaultValue={user?.description} />
        <Button onClick={() => showToast("Сохранено")}>Сохранить</Button>
      </Card>
    );
  }

  if (slug === "cities") {
    return (
      <Card className="max-w-lg">
        <p className="text-sm mb-3">Города оказания услуг:</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {user?.cities.map((c) => <Badge key={c}>{c}</Badge>)}
        </div>
        <Select label="Добавить город" options={CITIES.map((c) => ({ value: c, label: c }))} />
        <Button className="mt-3" size="sm" onClick={() => showToast("Город добавлен")}>Добавить</Button>
      </Card>
    );
  }

  if (slug === "production") {
    return (
      <Card className="max-w-lg space-y-4">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked={user?.hasProduction} /> Собственное производство</label>
        <Input label="Адрес производства" defaultValue="г. Москва, ул. Заводская, 15" />
        <Input label="Площадь, кв.м" defaultValue="1200" />
        <Textarea label="Оборудование" defaultValue="Фрезерный станок, лазерная резка" />
        <Button onClick={() => showToast("Сохранено")}>Сохранить</Button>
      </Card>
    );
  }

  if (slug === "services") {
    const myServices = SEED_SERVICES.filter((s) => s.contractorName === user?.name);
    return (
      <div>
        <Button size="sm" className="mb-4"><Plus className="h-4 w-4" /> Добавить услугу</Button>
        <div className="space-y-3">
          {myServices.map((s) => (
            <Card key={s.id}><CardTitle>{s.title}</CardTitle><CardDescription>{formatPrice(s.price)} · {s.city}</CardDescription></Card>
          ))}
        </div>
      </div>
    );
  }

  if (slug === "portfolio") {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        {["Стенд Мебель-2025", "IT Forum 2025", "ПромТех 2024"].map((p) => (
          <Card key={p}>
            <div className="h-24 border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 mb-2">Фото-заглушка</div>
            <CardTitle>{p}</CardTitle>
          </Card>
        ))}
        <Card className="border-dashed flex items-center justify-center min-h-[120px] cursor-pointer hover:border-gray-900">
          <Plus className="h-6 w-6 text-gray-400" />
        </Card>
      </div>
    );
  }

  if (slug === "available-requests") {
    const available = requests.filter((r) => r.status === "published");
    return (
      <div className="space-y-3">
        {available.map((r) => (
          <Card key={r.id}>
            <div className="flex justify-between flex-wrap gap-2">
              <div>
                <CardTitle>{r.title}</CardTitle>
                <CardDescription>{REQUEST_FORMAT_LABELS[r.format]} · {r.city} · {r.responseCount} откликов</CardDescription>
              </div>
              <div className="flex gap-2">
                <Link href={`/requests/${r.id}`}><Button size="sm" variant="outline">Открыть</Button></Link>
                <Link href={`/requests/${r.id}/respond`}><Button size="sm">Откликнуться</Button></Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (slug === "my-responses") {
    const myResponses = responses.filter((r) => r.contractorName === user?.name);
    return (
      <div className="space-y-3">
        {myResponses.map((r) => (
          <Card key={r.id}>
            <CardTitle>{formatPrice(r.price)}</CardTitle>
            <CardDescription>Статус: {r.status} · {r.deadline}</CardDescription>
          </Card>
        ))}
      </div>
    );
  }

  if (slug === "active-projects" || slug === "completed-projects") {
    const filtered = deals.filter((d) => d.contractorId === "ctr-1" && (slug === "completed-projects" ? d.status === "completed" : d.status !== "completed"));
    return (
      <div className="space-y-3">
        {filtered.map((d) => (
          <Link key={d.id} href={`/deals/${d.id}`}><Card className="hover:border-gray-900"><CardTitle>{d.title}</CardTitle><Badge>{DEAL_STATUS_LABELS[d.status]}</Badge></Card></Link>
        ))}
      </div>
    );
  }

  if (slug === "gantt") {
    const projectDeals = deals.filter((d) => d.contractorId === "ctr-1" && d.status !== "completed");
    return (
      <div>
        <Tabs tabs={[{ id: "list", label: "Список" }, { id: "calendar", label: "Календарь" }, { id: "gantt", label: "Гант" }]} activeTab={ganttView} onChange={setGanttView} />
        <div className="mt-4">
          {ganttView === "list" && projectDeals.map((d) => (
            <Card key={d.id} className="mb-3">
              <CardTitle>{d.title}</CardTitle>
              {d.stages.map((s) => (
                <div key={s.id} className="flex justify-between text-sm py-1 border-b border-gray-100">
                  <span>{s.title}</span>
                  <span>{formatShortDate(s.deadline)} · {s.status}</span>
                </div>
              ))}
            </Card>
          ))}
          {ganttView === "calendar" && (
            <div className="grid grid-cols-7 gap-1 mt-2">
              {Array.from({ length: 28 }, (_, i) => (
                <div key={i} className="border border-gray-200 p-2 text-xs min-h-[60px]">
                  {i + 1}
                  {i === 14 && <div className="bg-gray-900 text-white text-[10px] p-0.5 mt-1">Монтаж</div>}
                </div>
              ))}
            </div>
          )}
          {ganttView === "gantt" && (
            <div className="mt-4 space-y-4">
              {projectDeals.map((d) => (
                <div key={d.id}>
                  <p className="text-sm font-medium mb-1">{d.title}</p>
                  <div className="relative h-8 bg-gray-100 border border-gray-300">
                    {d.stages.map((s, i) => (
                      <div key={s.id} className="absolute h-full border border-gray-900 bg-gray-200 text-[10px] flex items-center px-1"
                        style={{ left: `${i * 30}%`, width: "25%" }}>{s.title}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (slug === "payouts") return <Link href="/payments"><Button>Перейти к выплатам</Button></Link>;
  if (slug === "documents") return <Link href="/documents"><Button>Документы</Button></Link>;

  if (slug === "reviews") {
    return (
      <Card>
        <p className="text-2xl font-bold">{user?.rating}</p>
        <p className="text-sm text-gray-600">{user?.reviewCount} отзывов</p>
        <div className="mt-4 border-t pt-4">
          <p className="text-sm font-medium">ООО «Вымышленная Мебель»</p>
          <p className="text-sm text-gray-600">Отличная работа, всё в срок</p>
        </div>
      </Card>
    );
  }

  if (slug === "settings") {
    return (
      <Card className="max-w-lg space-y-4">
        <Input label="Email" defaultValue="contractor@example.ru" />
        <Button onClick={() => showToast("Сохранено")}>Сохранить</Button>
      </Card>
    );
  }

  return <EmptyState title="Раздел не найден" />;
}

function VenuePages({ slug }: { slug: string }) {
  const user = useAuthStore((s) => s.user);
  const { bookings, floorCells, updateBooking, updateFloorCell } = usePrototypeStore();
  const { showToast } = useToast();
  const [activeHall, setActiveHall] = useState("hall-1");

  if (slug === "" || slug === "dashboard") {
    return (
      <>
        <DashboardWidgets role="venue" />
        <div className="grid md:grid-cols-3 gap-3">
          <Card><CardTitle>2</CardTitle><CardDescription>Площадки</CardDescription></Card>
          <Card><CardTitle>{bookings.filter((b) => b.status === "pending").length}</CardTitle><CardDescription>Ожидают подтверждения</CardDescription></Card>
          <Card><CardTitle>4</CardTitle><CardDescription>Зала</CardDescription></Card>
        </div>
      </>
    );
  }

  if (slug === "profile") {
    return (
      <Card className="max-w-lg space-y-4">
        <Input label="Название площадки" defaultValue={user?.name} />
        <Textarea label="Описание" defaultValue={user?.description} />
        <Button onClick={() => showToast("Сохранено")}>Сохранить</Button>
      </Card>
    );
  }

  if (slug === "halls") {
    return (
      <div className="space-y-4">
        <Button size="sm"><Plus className="h-4 w-4" /> Создать зал</Button>
        {[{ name: "Павильон 1", area: 5000, capacity: 200 }, { name: "Павильон 2", area: 3000, capacity: 120 }].map((h) => (
          <Card key={h.name}>
            <CardTitle>{h.name}</CardTitle>
            <CardDescription>{h.area} кв.м · до {h.capacity} мест</CardDescription>
            <div className="h-16 border border-dashed border-gray-300 mt-2 flex items-center justify-center text-xs text-gray-400">Фото-заглушка</div>
          </Card>
        ))}
      </div>
    );
  }

  if (slug === "spaces") {
    return (
      <Card>
        <p className="text-sm mb-4">Управление доступными площадями и периодами.</p>
        <Input label="Период доступности" defaultValue="01.03.2026 — 18.03.2026" />
        <label className="flex items-center gap-2 text-sm mt-3"><input type="checkbox" defaultChecked /> Открыто для бронирования</label>
        <Button className="mt-3" onClick={() => showToast("Сохранено")}>Сохранить</Button>
      </Card>
    );
  }

  if (slug === "floor-plan") {
    return (
      <div>
        <Select label="Зал" options={[{ value: "hall-1", label: "Павильон 1" }, { value: "hall-2", label: "Павильон 2" }]} />
        <div className="mt-4">
          <FloorPlanGrid
            cells={floorCells.filter((c) => c.hallId === activeHall)}
            onCellClick={(id, status) => {
              if (status === "free") updateFloorCell(id, "selected");
              else if (status === "selected") updateFloorCell(id, "free");
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">Свободно · Выбрано · Забронировано · Недоступно</p>
      </div>
    );
  }

  if (slug === "events") {
    return (
      <div className="space-y-3">
        {SEED_EVENTS.filter((e) => e.venueId === "venue-1").map((e) => (
          <Card key={e.id}><CardTitle>{e.title}</CardTitle><CardDescription>{formatShortDate(e.startDate)} — {formatShortDate(e.endDate)}</CardDescription></Card>
        ))}
      </div>
    );
  }

  if (slug === "venue-services") {
    return (
      <Card className="max-w-lg space-y-4">
        <Input label="Услуга" placeholder="Wi-Fi, парковка, клининг..." />
        <Input label="Цена" placeholder="от 5000 ₽" />
        <Button onClick={() => showToast("Услуга добавлена")}>Добавить</Button>
        <div className="border-t pt-3 space-y-2">
          {["Wi-Fi", "Парковка", "Клининг"].map((s) => <div key={s} className="text-sm flex justify-between"><span>{s}</span><Badge>Активна</Badge></div>)}
        </div>
      </Card>
    );
  }

  if (slug === "bookings") {
    return (
      <div className="space-y-3">
        {bookings.map((b) => (
          <Card key={b.id}>
            <div className="flex justify-between flex-wrap gap-2">
              <div>
                <CardTitle>Ячейка {b.cellId}</CardTitle>
                <CardDescription>{b.status === "pending" ? "Ожидает подтверждения" : "Подтверждено"}</CardDescription>
              </div>
              {b.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { updateBooking(b.id, { status: "confirmed" }); showToast("Подтверждено"); }}>Подтвердить</Button>
                  <Button size="sm" variant="outline" onClick={() => { updateBooking(b.id, { status: "rejected" }); showToast("Отклонено"); }}>Отклонить</Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (slug === "orders") {
    return <Link href="/deals/deal-1"><Button>Заказы площадки</Button></Link>;
  }

  if (slug === "payments") return <Link href="/payments"><Button>Оплаты и начисления</Button></Link>;
  if (slug === "documents") return <Link href="/documents"><Button>Документы</Button></Link>;
  if (slug === "notifications") return <Link href="/notifications"><Button>Уведомления</Button></Link>;

  if (slug === "settings") {
    return <Card className="max-w-lg"><Input label="Email" defaultValue="venue@example.ru" /><Button className="mt-3" onClick={() => showToast("Сохранено")}>Сохранить</Button></Card>;
  }

  return <EmptyState title="Раздел не найден" />;
}

function OrganizerPages({ slug }: { slug: string }) {
  const { participants, bookings } = usePrototypeStore();
  const { showToast } = useToast();
  const router = useRouter();
  const [eventForm, setEventForm] = useState({ title: "", city: "Москва", category: "exhibition" });

  if (slug === "" || slug === "dashboard") {
    return (
      <>
        <DashboardWidgets role="organizer" />
        <div className="flex gap-2 mt-4">
          <Link href="/account/organizer/create-event"><Button size="sm">Создать мероприятие</Button></Link>
          <Link href="/account/organizer/participants"><Button size="sm" variant="outline">Участники</Button></Link>
        </div>
      </>
    );
  }

  if (slug === "profile") {
    return (
      <Card className="max-w-lg space-y-4">
        <Input label="Название" defaultValue="ООО «МебельЭкспо Организатор»" />
        <Textarea label="Описание" />
        <Button onClick={() => showToast("Сохранено")}>Сохранить</Button>
      </Card>
    );
  }

  if (slug === "events") {
    return (
      <div className="space-y-3">
        {SEED_EVENTS.filter((e) => e.organizerId === "user-organizer").map((e) => (
          <Card key={e.id}>
            <div className="flex justify-between">
              <div><CardTitle>{e.title}</CardTitle><CardDescription>{e.city} · {formatShortDate(e.startDate)}</CardDescription></div>
              <Link href={`/account/organizer/edit-event?id=${e.id}`}><Button size="sm" variant="outline">Редактировать</Button></Link>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (slug === "create-event" || slug === "edit-event") {
    return (
      <Card className="max-w-2xl">
        <div className="space-y-4">
          <Input label="Название" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
          <Select label="Категория" options={[{ value: "exhibition", label: "Выставка" }, { value: "forum", label: "Форум" }, { value: "conference", label: "Конференция" }]} value={eventForm.category} onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })} />
          <Select label="Отрасль" options={[{ value: "furniture", label: "Мебель и интерьер" }, { value: "it", label: "IT" }]} />
          <Textarea label="Описание" />
          <Select label="Город" options={CITIES.map((c) => ({ value: c, label: c }))} value={eventForm.city} onChange={(e) => setEventForm({ ...eventForm, city: e.target.value })} />
          <Select label="Площадка" options={[{ value: "venue-1", label: "ЭкспоЦентр" }, { value: "venue-2", label: "ЭкспоФорум" }]} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Дата начала" type="date" />
            <Input label="Дата окончания" type="date" />
          </div>
          <Textarea label="Условия участия" />
          <FileUpload label="Прикрепить файлы" />
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => showToast("Черновик сохранён")}>Сохранить черновик</Button>
            <Button variant="outline" onClick={() => showToast("Предпросмотр")}>Предпросмотр</Button>
            <Button onClick={() => { showToast("Мероприятие отправлено на публикацию"); router.push("/account/organizer/events"); }}>Опубликовать</Button>
          </div>
        </div>
      </Card>
    );
  }

  if (slug === "venues") {
    return (
      <div className="space-y-3">
        {[{ name: "ЭкспоЦентр", city: "Москва" }, { name: "ЭкспоФорум", city: "Санкт-Петербург" }].map((v) => (
          <Card key={v.name}><CardTitle>{v.name}</CardTitle><CardDescription>{v.city}</CardDescription></Card>
        ))}
      </div>
    );
  }

  if (slug === "participants") {
    return (
      <div>
        <Input placeholder="Поиск участника..." className="mb-4 max-w-sm" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse hidden md:table">
            <thead><tr className="border-b border-gray-300">{["Компания", "Статус", "Площадь", "Оплата", "Документы", ""].map((h) => <th key={h} className="text-left py-2 px-2">{h}</th>)}</tr></thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id} className="border-b border-gray-200">
                  <td className="py-2 px-2">{p.name}</td>
                  <td className="py-2 px-2"><Badge variant="outline">{p.status}</Badge></td>
                  <td className="py-2 px-2">{p.assignedSpace || "—"}</td>
                  <td className="py-2 px-2">{p.paid ? "Оплачено" : "Не оплачено"}</td>
                  <td className="py-2 px-2">{p.documents.length} док.</td>
                  <td className="py-2 px-2"><Button size="sm" variant="ghost">Карточка</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="md:hidden space-y-3">
            {participants.map((p) => (
              <Card key={p.id}>
                <CardTitle>{p.name}</CardTitle>
                <CardDescription>{p.status} · {p.assignedSpace} · {p.paid ? "Оплачено" : "Не оплачено"}</CardDescription>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (slug === "services") {
    return (
      <div className="space-y-3">
        {SEED_SERVICES.slice(0, 6).map((s) => (
          <Card key={s.id}><CardTitle>{s.title}</CardTitle><CardDescription>{s.contractorName} · {formatPrice(s.price)}</CardDescription></Card>
        ))}
      </div>
    );
  }

  if (slug === "bookings") {
    return (
      <div className="space-y-3">
        {bookings.map((b) => (
          <Card key={b.id}><CardTitle>Бронирование {b.cellId}</CardTitle><CardDescription>Статус: {b.status}</CardDescription></Card>
        ))}
      </div>
    );
  }

  if (slug === "orders") return <Link href="/deals/deal-1"><Button>Заказы</Button></Link>;
  if (slug === "payments") return <Link href="/payments"><Button>Оплаты</Button></Link>;
  if (slug === "documents") return <Link href="/documents"><Button>Документы</Button></Link>;
  if (slug === "notifications") return <Link href="/notifications"><Button>Уведомления</Button></Link>;

  if (slug === "settings") {
    return <Card className="max-w-lg"><Input label="Email" defaultValue="organizer@example.ru" /><Button className="mt-3" onClick={() => showToast("Сохранено")}>Сохранить</Button></Card>;
  }

  return <EmptyState title="Раздел не найден" />;
}
