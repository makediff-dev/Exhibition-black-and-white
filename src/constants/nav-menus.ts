export interface NavItem {
  href: string;
  label: string;
  slug: string;
}

export const CUSTOMER_NAV: NavItem[] = [
  { slug: "", href: "/account/customer", label: "Дашборд" },
  { slug: "profile", href: "/account/customer/profile", label: "Профиль компании" },
  { slug: "legal", href: "/account/customer/legal", label: "Юридические и платёжные данные" },
  { slug: "edo", href: "/account/customer/edo", label: "ЭДО и документооборот" },
  { slug: "requests", href: "/account/customer/requests", label: "Мои заявки" },
  { slug: "cart", href: "/account/customer/cart", label: "Корзина / заказы из каталога" },
  { slug: "responses", href: "/account/customer/responses", label: "Отклики и предложения" },
  { slug: "active-projects", href: "/account/customer/active-projects", label: "Активные проекты" },
  { slug: "completed-projects", href: "/account/customer/completed-projects", label: "Завершённые проекты" },
  { slug: "repeat-order", href: "/account/customer/repeat-order", label: "Повторить заказ" },
  { slug: "checks", href: "/account/customer/checks", label: "Проверки исполнителей" },
  { slug: "payments", href: "/account/customer/payments", label: "Оплаты" },
  { slug: "documents", href: "/account/customer/documents", label: "Документы" },
  { slug: "reviews", href: "/account/customer/reviews", label: "Отзывы" },
  { slug: "settings", href: "/account/customer/settings", label: "Настройки" },
];

export const CONTRACTOR_NAV: NavItem[] = [
  { slug: "", href: "/account/contractor", label: "Дашборд" },
  { slug: "profile", href: "/account/contractor/profile", label: "Профиль компании" },
  { slug: "cities", href: "/account/contractor/cities", label: "Города оказания услуг" },
  { slug: "production", href: "/account/contractor/production", label: "Производственные мощности" },
  { slug: "services", href: "/account/contractor/services", label: "Услуги" },
  { slug: "portfolio", href: "/account/contractor/portfolio", label: "Портфолио" },
  { slug: "available-requests", href: "/account/contractor/available-requests", label: "Доступные заявки" },
  { slug: "my-responses", href: "/account/contractor/my-responses", label: "Мои отклики" },
  { slug: "active-projects", href: "/account/contractor/active-projects", label: "Активные проекты" },
  { slug: "gantt", href: "/account/contractor/gantt", label: "Календарно-сетевой график" },
  { slug: "completed-projects", href: "/account/contractor/completed-projects", label: "Завершённые проекты" },
  { slug: "payouts", href: "/account/contractor/payouts", label: "Выплаты" },
  { slug: "documents", href: "/account/contractor/documents", label: "Документы" },
  { slug: "reviews", href: "/account/contractor/reviews", label: "Отзывы и рейтинг" },
  { slug: "settings", href: "/account/contractor/settings", label: "Настройки" },
];

export const VENUE_NAV: NavItem[] = [
  { slug: "", href: "/account/venue", label: "Дашборд" },
  { slug: "profile", href: "/account/venue/profile", label: "Профиль площадки" },
  { slug: "halls", href: "/account/venue/halls", label: "Площадки и залы" },
  { slug: "spaces", href: "/account/venue/spaces", label: "Доступные площади" },
  { slug: "floor-plan", href: "/account/venue/floor-plan", label: "Схема размещения" },
  { slug: "events", href: "/account/venue/events", label: "Мероприятия" },
  { slug: "venue-services", href: "/account/venue/venue-services", label: "Услуги площадки" },
  { slug: "bookings", href: "/account/venue/bookings", label: "Бронирования" },
  { slug: "orders", href: "/account/venue/orders", label: "Заказы" },
  { slug: "payments", href: "/account/venue/payments", label: "Оплаты и начисления" },
  { slug: "documents", href: "/account/venue/documents", label: "Документы" },
  { slug: "settings", href: "/account/venue/settings", label: "Настройки" },
];

export const ORGANIZER_NAV: NavItem[] = [
  { slug: "", href: "/account/organizer", label: "Дашборд" },
  { slug: "profile", href: "/account/organizer/profile", label: "Профиль компании" },
  { slug: "events", href: "/account/organizer/events", label: "Мероприятия" },
  { slug: "create-event", href: "/account/organizer/create-event", label: "Создание мероприятия" },
  { slug: "edit-event", href: "/account/organizer/edit-event", label: "Редактирование мероприятия" },
  { slug: "venues", href: "/account/organizer/venues", label: "Площадки проведения" },
  { slug: "participants", href: "/account/organizer/participants", label: "Участники / экспоненты" },
  { slug: "services", href: "/account/organizer/services", label: "Доступные услуги" },
  { slug: "bookings", href: "/account/organizer/bookings", label: "Бронирования" },
  { slug: "orders", href: "/account/organizer/orders", label: "Заказы" },
  { slug: "payments", href: "/account/organizer/payments", label: "Оплаты" },
  { slug: "documents", href: "/account/organizer/documents", label: "Документы" },
  { slug: "settings", href: "/account/organizer/settings", label: "Настройки" },
];

export function getNavForRole(role: string): NavItem[] {
  switch (role) {
    case "customer":
      return CUSTOMER_NAV;
    case "contractor":
      return CONTRACTOR_NAV;
    case "venue":
      return VENUE_NAV;
    case "organizer":
      return ORGANIZER_NAV;
    default:
      return [];
  }
}
