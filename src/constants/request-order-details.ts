export interface RequestOrderLine {
  id: string;
  requestId: string;
  title: string;
  supplierName: string;
  href?: string;
}

export interface RequestOrderRecommendation {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  href: string;
}

export const GENERAL_REQUEST_RECOMMENDATIONS: RequestOrderRecommendation[] = [
  {
    id: "gr-1",
    title: "Поддерживающий клининг в дни проведения мероприятия",
    description: "Ежедневная уборка стенда и зоны переговоров в дни проведения мероприятия",
    actionLabel: "Заказать у организатора",
    href: "/services?category=Клининг",
  },
  {
    id: "gr-2",
    title: "Фото/видео съёмка стенда в период проведения",
    description: "Профессиональная съёмка для отчёта и материалов после выставки",
    actionLabel: "Найти исполнителя",
    href: "/contractors?category=Разработка контента",
  },
];

export const REQUEST_ORDER_LINES: RequestOrderLine[] = [
  {
    id: "rol-1",
    requestId: "req-1",
    title: "Услуга комплексной застройки стенда",
    supplierName: "ООО «СтендПро»",
    href: "/services/svc-2",
  },
  {
    id: "rol-2",
    requestId: "req-1",
    title: "Аренда площади",
    supplierName: "«Вымышленный организатор»",
    href: "/events/evt-1/booking",
  },
  {
    id: "rol-3",
    requestId: "req-1",
    title: "Транспортные пропуска",
    supplierName: "«Крокус Экспо»",
    href: "/events/evt-1",
  },
  {
    id: "rol-4",
    requestId: "req-2",
    title: "Дизайн-проект стенда",
    supplierName: "ООО «ДизайнСтенд»",
    href: "/services/svc-1",
  },
  {
    id: "rol-5",
    requestId: "req-3",
    title: "Срочный монтаж конструкций",
    supplierName: "ООО «СтендПро»",
    href: "/services/svc-12",
  },
];

export function getRequestOrderLines(requestId: string) {
  return REQUEST_ORDER_LINES.filter((line) => line.requestId === requestId);
}
