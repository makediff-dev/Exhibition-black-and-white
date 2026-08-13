import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-300 bg-gray-50 mt-auto">
      <div className="mx-auto max-w-site px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="font-bold text-sm border border-gray-900 inline-block px-2 py-1 mb-2">ЭКСПО</p>
            <p className="text-sm text-gray-600">Маркетплейс выставочной индустрии</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Разделы</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li><Link href="/events" className="hover:text-gray-900">Мероприятия</Link></li>
              <li><Link href="/contractors" className="hover:text-gray-900">Исполнители</Link></li>
              <li><Link href="/services" className="hover:text-gray-900">Услуги</Link></li>
              <li><Link href="/how-it-works" className="hover:text-gray-900">Как работает</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Правовая информация</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li><Link href="/how-it-works" className="hover:text-gray-900">Условия использования</Link></li>
              <li><Link href="/how-it-works" className="hover:text-gray-900">Политика конфиденциальности</Link></li>
              <li><Link href="/how-it-works" className="hover:text-gray-900">Контакты</Link></li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-6 border-t border-gray-200 pt-4">
          © 2026 Маркетплейс выставочной индустрии. UX-прототип.
        </p>
      </div>
    </footer>
  );
}
