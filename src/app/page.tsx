import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { SEED_EVENTS } from "@/data/mocks/seed";
import { SERVICE_CATEGORIES } from "@/constants/categories";
import { REQUEST_FORMAT_LABELS } from "@/constants/statuses";
import { formatShortDate } from "@/lib/utils/formatters";
import { Search, Users, Package, Calendar, FileText } from "lucide-react";

export default function HomePage() {
  const upcomingEvents = SEED_EVENTS.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      {/* Hero */}
      <section className="border-b border-gray-300 bg-gray-50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Маркетплейс выставочной индустрии
          </h1>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
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
            {SERVICE_CATEGORIES.slice(0, 8).map((cat) => (
              <Link key={cat} href={`/services?category=${encodeURIComponent(cat)}`}>
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
          <Link href="/how-it-works" className="inline-block mt-4 text-sm underline">Подробнее →</Link>
        </div>
      </section>

      {/* Work formats */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-lg font-bold mb-4">Форматы работы</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardTitle>{REQUEST_FORMAT_LABELS.safe_deal}</CardTitle>
              <CardDescription>Заказчик выбирает услугу или исполнителя, согласует этапы и резервирует оплату до приёмки результата.</CardDescription>
              <Link href="/services" className="text-sm underline mt-2 inline-block">Выбрать услугу →</Link>
            </Card>
            <Card>
              <CardTitle>{REQUEST_FORMAT_LABELS.open_request}</CardTitle>
              <CardDescription>Заявка публикуется для всех подходящих исполнителей.</CardDescription>
              <Link href="/requests/new?format=open_request" className="text-sm underline mt-2 inline-block">Создать заявку →</Link>
            </Card>
            <Card>
              <CardTitle>{REQUEST_FORMAT_LABELS.closed_request}</CardTitle>
              <CardDescription>Заказчик сам выбирает потенциальных исполнителей, которым будет доступна заявка.</CardDescription>
              <Link href="/contractors" className="text-sm underline mt-2 inline-block">Выбрать исполнителей →</Link>
            </Card>
            <Card>
              <CardTitle>{REQUEST_FORMAT_LABELS.urgent}</CardTitle>
              <CardDescription>Короткая форма, быстрый выбор услуги или мгновенная отправка задания подходящим исполнителям.</CardDescription>
              <Link href="/requests/new?format=urgent" className="text-sm underline mt-2 inline-block">Срочный заказ →</Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer / Contractor blocks */}
      <section className="py-8 border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-2 gap-6">
          <Card>
            <CardTitle>Для заказчиков</CardTitle>
            <CardDescription>Размещайте заявки, сравнивайте предложения, управляйте сделками и документами в одном месте.</CardDescription>
            <Link href="/register"><Button className="mt-3" size="sm">Зарегистрироваться</Button></Link>
          </Card>
          <Card>
            <CardTitle>Для исполнителей</CardTitle>
            <CardDescription>Находите заказы, отправляйте отклики, управляйте проектами и получайте выплаты.</CardDescription>
            <Link href="/register"><Button className="mt-3" size="sm" variant="outline">Стать исполнителем</Button></Link>
          </Card>
        </div>
      </section>

      {/* Upcoming events */}
      <section className="py-8 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Ближайшие выставки и мероприятия</h2>
            <Link href="/events" className="text-sm underline">Все мероприятия →</Link>
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
              { q: "Как зарегистрироваться?", a: "Выберите роль, введите ИНН компании и пройдите модерацию." },
              { q: "Что такое безопасная сделка?", a: "Оплата резервируется до приёмки результата заказчиком." },
              { q: "Нужно ли подключать ЭДО?", a: "Рекомендуется для подписания документов, но можно пропустить на старте." },
            ].map(({ q, a }) => (
              <details key={q} className="border border-gray-300 p-3">
                <summary className="text-sm font-medium cursor-pointer">{q}</summary>
                <p className="text-sm text-gray-600 mt-2">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
