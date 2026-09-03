import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { REQUEST_FORMAT_LABELS } from "@/constants/statuses";

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-site w-full px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Как работает сервис</h1>
        <div className="space-y-6 text-sm text-gray-700">
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">1. Регистрация</h2>
            <p>Зарегистрируйте компанию, выберите роль (заказчик, исполнитель, площадка, организатор). Введите ИНН — данные заполнятся автоматически. Пройдите модерацию.</p>
          </section>
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">2. Форматы работы</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>{REQUEST_FORMAT_LABELS.safe_deal}</strong> — резервирование оплаты до приёмки.</li>
              <li><strong>{REQUEST_FORMAT_LABELS.open_request}</strong> — публичная заявка для всех исполнителей.</li>
              <li><strong>{REQUEST_FORMAT_LABELS.closed_request}</strong> — заявка для выбранных исполнителей.</li>
              <li><strong>{REQUEST_FORMAT_LABELS.urgent}</strong> — быстрый заказ с короткой формой.</li>
            </ul>
          </section>
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">3. Безопасная сделка</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Заказчик согласовывает условия</li>
              <li>Вносит оплату — средства резервируются</li>
              <li>Исполнитель выполняет этап</li>
              <li>Заказчик принимает или оставляет замечания</li>
              <li>После приёмки — выплата исполнителю за вычетом комиссии</li>
            </ol>
          </section>
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">4. Документы и ЭДО</h2>
            <p>Договоры, счета и акты генерируются автоматически. Подключите ЭДО для электронного подписания или скачайте документы временно.</p>
          </section>
        </div>
        <Link href="/register" className="inline-block mt-6 border border-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-100">
          Начать работу
        </Link>
      </main>
      <Footer />
    </div>
  );
}