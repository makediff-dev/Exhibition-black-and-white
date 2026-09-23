import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { HOME_HOW_IT_WORKS_STEPS } from "@/constants/home-content";
import { REQUEST_FORMAT_LABELS } from "@/constants/statuses";

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-site w-full px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Как работает сервис</h1>
        <div className="space-y-6 text-sm text-gray-700">
          {HOME_HOW_IT_WORKS_STEPS.map((step, index) => (
            <section key={step.title}>
              <h2 className="font-semibold text-gray-900 mb-2">
                {index + 1}. {step.title}
              </h2>
              <p>{step.text}</p>
            </section>
          ))}
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">Форматы работы</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>{REQUEST_FORMAT_LABELS.safe_deal}</strong> — оплата резервируется до
                приёмки этапа.
              </li>
              <li>
                <strong>{REQUEST_FORMAT_LABELS.open_request}</strong> — публичная заявка для
                подходящих исполнителей.
              </li>
              <li>
                <strong>{REQUEST_FORMAT_LABELS.closed_request}</strong> — заявка только выбранным
                исполнителям.
              </li>
              <li>
                <strong>{REQUEST_FORMAT_LABELS.urgent}</strong> — короткий заказ с быстрым
                подбором.
              </li>
            </ul>
          </section>
        </div>
        <Link
          href="/register"
          className="inline-block mt-6 border border-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-100"
        >
          Начать работу
        </Link>
      </main>
      <Footer />
    </div>
  );
}
