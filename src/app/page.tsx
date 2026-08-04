import Link from "next/link";
import type { ReactNode } from "react";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { SEED_EVENTS } from "@/data/mocks/seed";
import { POPULAR_SERVICE_CATEGORIES, CITIES, EVENT_INDUSTRIES } from "@/constants/categories";
import { REQUEST_FORMAT_LABELS } from "@/constants/statuses";
import { formatShortDate } from "@/lib/utils/formatters";
import { Search, Users, Package, Calendar, FileText, ChevronDown } from "lucide-react";

interface FaqAccordionProps {
  title: string;
  children: ReactNode;
}

function FaqAccordion({ title, children }: FaqAccordionProps) {
  return (
    <details className="group border border-gray-300 bg-white">
      <summary className="flex items-center justify-between gap-3 p-3 text-sm font-medium cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-500 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-3 pb-3 text-sm text-gray-600">{children}</div>
    </details>
  );
}

export default function HomePage() {
  const upcomingEvents = SEED_EVENTS.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      {/* Hero */}
      <section className="border-b border-gray-300 bg-gray-50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Маркетплейс выставочной индустрии и не только
          </h1>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Все мероприятия России, выставки, исполнители и сопутствующие услуги на одном сайте.
            Найдите исполнителей, услуги и мероприятия для участия в выставках
          </p>
          <form action="/events" className="flex max-w-md mx-auto gap-2">
            <input
              name="q"
              placeholder="Поиск мероприятий, услуг, исполнителей..."
              className="flex-1 border border-gray-300 px-4 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
            <Button type="submit"><Search className="h-4 w-4" /></Button>
          </form>
        </div>
      </section>

      {/* Quick actions */}
      <section className="py-8 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/contractors", label: "Найти исполнителя", icon: Users },
            { href: "/services", label: "Найти услугу", icon: Package },
            { href: "/events", label: "Найти выставку", icon: Calendar },
            { href: "/requests/new", label: "Разместить заявку", icon: FileText },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Card className="text-center hover:border-gray-900 h-full">
                <Icon className="h-6 w-6 mx-auto mb-2 text-gray-700" />
                <p className="text-sm font-medium">{label}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-lg font-bold mb-4">Популярные категории услуг</h2>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SERVICE_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={cat === "Больше услуг" ? "/services" : `/services?category=${encodeURIComponent(cat)}`}
              >
                <span className="inline-block border border-gray-300 px-3 py-1.5 text-xs hover:border-gray-900">
                  {cat}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-8 bg-gray-50 border-y border-gray-200">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-lg font-bold mb-4">Как работает сервис</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {["Регистрация компании", "Поиск или заявка", "Согласование условий", "Безопасная сделка"].map((step, i) => (
              <div key={step} className="border border-gray-300 bg-white p-4">
                <span className="text-xs font-bold border border-gray-900 px-2 py-0.5">{i + 1}</span>
                <p className="text-sm font-medium mt-2">{step}</p>
              </div>
            ))}
          </div>
          <Link href="/how-it-works" className="inline-block mt-4 text-sm underline">Подробнее</Link>
        </div>
      </section>

      {/* Work formats */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-lg font-bold mb-4">Форматы работы</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardTitle>{REQUEST_FORMAT_LABELS.safe_deal}</CardTitle>
              <CardDescription>
                Заказчик выбирает услугу или исполнителя, согласует этапы и резервирует оплату на сервисе до приёмки результата.
              </CardDescription>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Link href="/services">
                  <Button size="sm" variant="outline">Выбрать услугу</Button>
                </Link>
                <Link href="/how-it-works" className="text-sm text-gray-900 hover:text-gray-600">
                  Узнать подробнее
                </Link>
              </div>
            </Card>
            <Card>
              <CardTitle>{REQUEST_FORMAT_LABELS.open_request}</CardTitle>
              <CardDescription>
                Заявка публикуется для всех подходящих исполнителей. Сервис принимает заявки от первых 10 откликнувшихся.
              </CardDescription>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Link href="/requests/new?format=open_request">
                  <Button size="sm" variant="outline">Создать заявку</Button>
                </Link>
                <Link href="/how-it-works" className="text-sm text-gray-900 hover:text-gray-600">
                  Узнать подробнее
                </Link>
              </div>
            </Card>
            <Card>
              <CardTitle>{REQUEST_FORMAT_LABELS.closed_request}</CardTitle>
              <CardDescription>
                Заказчик сам выбирает потенциальных исполнителей, которым будет доступна заявка, но не более 5 исполнителей.
              </CardDescription>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Link href="/contractors">
                  <Button size="sm" variant="outline">Выбрать исполнителей</Button>
                </Link>
                <Link href="/how-it-works" className="text-sm text-gray-900 hover:text-gray-600">
                  Узнать подробнее
                </Link>
              </div>
            </Card>
            <Card>
              <CardTitle>{REQUEST_FORMAT_LABELS.urgent}</CardTitle>
              <CardDescription>
                Короткая форма, быстрый выбор услуги или мгновенная отправка задания подходящим исполнителям, не более 10 исполнителей.
                Сервис принимает заявки от первых 5 откликнувшихся. Возможна оплата картой физического лица.
              </CardDescription>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Link href="/requests/new?format=urgent">
                  <Button size="sm" variant="outline">Срочный заказ</Button>
                </Link>
                <Link href="/how-it-works" className="text-sm text-gray-900 hover:text-gray-600">
                  Узнать подробнее
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer / Contractor blocks */}
      <section className="py-8 border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-2 gap-6">
          <Card>
            <CardTitle>Для заказчиков</CardTitle>
            <CardDescription>
              Размещайте заявки, сравнивайте предложения, управляйте сделками и документами в одном месте — в едином пространстве.
              Сервис не берет комиссию и абонентскую плату с заказчиков по большинству услуг.
            </CardDescription>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link href="/register">
                <Button size="sm" variant="outline">Зарегистрироваться</Button>
              </Link>
              <Link href="/how-it-works" className="text-sm text-gray-900 hover:text-gray-600">
                Узнать подробнее
              </Link>
            </div>
          </Card>
          <Card>
            <CardTitle>Для исполнителей</CardTitle>
            <CardDescription>
              Находите заказы, отправляйте отклики, управляйте проектами и получайте выплаты.
              Сервис берет минимальную комиссию только если вы договорились с заказчиком и он оплатил ваши услуги.
            </CardDescription>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link href="/register">
                <Button size="sm" variant="outline">Стать исполнителем</Button>
              </Link>
              <Link href="/how-it-works" className="text-sm text-gray-900 hover:text-gray-600">
                Узнать подробнее
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Upcoming events */}
      <section className="py-8 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <h2 className="text-lg font-bold">Ближайшие выставки и мероприятия</h2>
            <Link href="/events" className="text-sm underline">Все мероприятия</Link>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative min-w-[180px]">
              <select
                defaultValue=""
                className="w-full appearance-none border border-gray-300 bg-white pl-3 pr-8 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
                aria-label="Выбрать диапазон"
              >
                <option value="">Выбрать диапазон</option>
                <option value="week">Ближайшая неделя</option>
                <option value="month">Ближайший месяц</option>
                <option value="quarter">Ближайшие 3 месяца</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>
            <div className="relative min-w-[220px]">
              <select
                defaultValue="moscow"
                className="w-full appearance-none border border-gray-300 bg-white pl-3 pr-8 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
                aria-label="Город"
              >
                <option value="moscow">Мероприятия в Москве</option>
                {CITIES.filter((city) => city !== "Москва").map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>
            <div className="relative min-w-[160px]">
              <select
                defaultValue=""
                className="w-full appearance-none border border-gray-300 bg-white pl-3 pr-8 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
                aria-label="Отрасль"
              >
                <option value="">По отраслям</option>
                {EVENT_INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingEvents.map((evt) => (
              <Link key={evt.id} href={`/events/${evt.id}`}>
                <Card className="h-full hover:border-gray-900">
                  <CardTitle>{evt.title}</CardTitle>
                  <CardDescription>
                    {evt.city} · {formatShortDate(evt.startDate)} — {formatShortDate(evt.endDate)}
                  </CardDescription>
                  <span className="text-xs border border-gray-300 px-1 mt-2 inline-block">{evt.category}</span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-8 border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-lg font-bold mb-4">FAQ</h2>
          <div className="space-y-3 max-w-2xl">
            {[
              {
                title: "Почему стоит зарегистрироваться сейчас?",
                content: "Ранний доступ к заявкам, исполнителям и мероприятиям, а также возможность первыми воспользоваться безопасной сделкой на сервисе.",
              },
              {
                title: "Как зарегистрироваться?",
                content: "Выберите роль, введите ИНН компании и пройдите модерацию.",
              },
              {
                title: "Что такое безопасная сделка?",
                content: "Оплата резервируется на сервисе до приёмки результата заказчиком.",
              },
              {
                title: "Нужно ли подключать ЭДО?",
                content: "Рекомендуется для подписания документов, но можно пропустить на старте.",
              },
              {
                title: "Как работает система рейтингов?",
                content: "Рейтинг формируется после завершённых сделок на основе оценок заказчиков и исполнителей.",
              },
              {
                title: "Преимущества для заказчиков",
                content: "Размещение заявок, сравнение предложений, безопасная сделка и управление документами в одном месте.",
              },
              {
                title: "Преимущества сервиса для исполнителей",
                content: "Доступ к заявкам, отклики, управление проектами и выплаты с минимальной комиссией после оплаты услуг.",
              },
              {
                title: "Преимущества для организаторов мероприятий",
                content: "Публикация мероприятий, работа с участниками и управление бронированиями площадок.",
              },
              {
                title: "Преимущества для площадок проведения",
                content: "Размещение площадки, бронирование стендов и работа с организаторами мероприятий.",
              },
              {
                title: "Узнать больше",
                content: (
                  <Link href="/how-it-works" className="text-gray-900 hover:text-gray-600">
                    Подробнее о сервисе, форматах работы и возможностях для всех ролей
                  </Link>
                ),
              },
            ].map(({ title, content }) => (
              <FaqAccordion key={title} title={title}>
                {content}
              </FaqAccordion>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
