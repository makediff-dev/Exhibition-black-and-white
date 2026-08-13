export interface HomeOrderCard {
  id: string;
  requestId: string;
  title: string;
  description: string;
  budget: string;
  deadlineLabel: string;
}

export const URGENT_HOME_ORDERS: HomeOrderCard[] = [
  {
    id: "urg-1",
    requestId: "req-3",
    title: "Срочный монтаж стенда",
    description: "Монтаж выставочного стенда за 2 дня. Работа возможна в ночное время на площадке.",
    budget: "80 000 ₽",
    deadlineLabel: "до 20 янв. 2026",
  },
  {
    id: "urg-2",
    requestId: "req-1",
    title: "Стенд 36 кв.м на Мебель-2026",
    description: "Комплексное строительство стенда с зоной переговоров и витринами к открытию выставки.",
    budget: "400 000 – 600 000 ₽",
    deadlineLabel: "до 15 февр. 2026",
  },
  {
    id: "urg-3",
    requestId: "req-2",
    title: "Дизайн-проект для IT Forum",
    description: "Разработка дизайн-проекта стенда IT-компании в минималистичном технологичном стиле.",
    budget: "от 100 000 ₽",
    deadlineLabel: "до 1 апр. 2026",
  },
  {
    id: "urg-4",
    requestId: "req-4",
    title: "Кейтеринг на ПродЭкспо",
    description: "Организация фуршета для 100 человек с вегетарианским меню на время выставки.",
    budget: "по запросу",
    deadlineLabel: "до 30 мая 2026",
  },
  {
    id: "urg-5",
    requestId: "req-1",
    title: "Монтаж освещения стенда",
    description: "Срочная установка светового оборудования и подключение на стенде 24 кв.м.",
    budget: "45 000 ₽",
    deadlineLabel: "до 18 янв. 2026",
  },
];

export interface HomeOrderCategory {
  title: string;
  orders: HomeOrderCard[];
}

export const HOME_ORDER_CATEGORIES: HomeOrderCategory[] = [
  {
    title: "Комплексное строительство выставочных стендов",
    orders: [
      {
        id: "cat-1-1",
        requestId: "req-1",
        title: "Стенд 36 кв.м на Мебель-2026",
        description: "Полный цикл: проектирование, производство и монтаж стенда под ключ.",
        budget: "400 000 – 600 000 ₽",
        deadlineLabel: "до 15 февр. 2026",
      },
      {
        id: "cat-1-2",
        requestId: "req-1",
        title: "Стенд 48 кв.м, двухуровневый",
        description: "Двухэтажная конструкция с переговорной зоной и демонстрационной площадкой.",
        budget: "от 750 000 ₽",
        deadlineLabel: "до 1 марта 2026",
      },
      {
        id: "cat-1-3",
        requestId: "req-1",
        title: "Модульный стенд 18 кв.м",
        description: "Бюджетное решение для участия в региональной выставке, монтаж за 1 день.",
        budget: "от 180 000 ₽",
        deadlineLabel: "до 10 марта 2026",
      },
      {
        id: "cat-1-4",
        requestId: "req-1",
        title: "Островной стенд 24 кв.м",
        description: "Открытая планировка с четырьмя фасадами и зоной демонстрации продукции.",
        budget: "от 320 000 ₽",
        deadlineLabel: "до 18 марта 2026",
      },
      {
        id: "cat-1-5",
        requestId: "req-1",
        title: "Стенд с переговорной 30 кв.м",
        description: "Закрытая переговорная комната, ресепшен и витрины для образцов продукции.",
        budget: "от 410 000 ₽",
        deadlineLabel: "до 25 марта 2026",
      },
    ],
  },
  {
    title: "Дизайн-проект выставочного стенда",
    orders: [
      {
        id: "cat-2-1",
        requestId: "req-2",
        title: "Дизайн-проект для IT Forum",
        description: "3D-визуализация и рабочая документация для технологичного стенда.",
        budget: "от 100 000 ₽",
        deadlineLabel: "до 1 апр. 2026",
      },
      {
        id: "cat-2-2",
        requestId: "req-2",
        title: "Концепция стенда «Мода и Стиль»",
        description: "Авторская концепция с акцентом на премиальную подачу бренда на выставке.",
        budget: "85 000 ₽",
        deadlineLabel: "до 20 апр. 2026",
      },
      {
        id: "cat-2-3",
        requestId: "req-2",
        title: "Адаптация макета под площадку",
        description: "Доработка готового макета под план зала и технические ограничения площадки.",
        budget: "40 000 ₽",
        deadlineLabel: "до 5 мая 2026",
      },
      {
        id: "cat-2-4",
        requestId: "req-2",
        title: "3D-визуализация для тендера",
        description: "Фотореалистичные рендеры и презентация для согласования с руководством заказчика.",
        budget: "60 000 ₽",
        deadlineLabel: "до 15 мая 2026",
      },
      {
        id: "cat-2-5",
        requestId: "req-2",
        title: "Рабочая документация стенда",
        description: "Комплект чертежей и спецификаций для передачи в производство и монтаж.",
        budget: "75 000 ₽",
        deadlineLabel: "до 22 мая 2026",
      },
    ],
  },
  {
    title: "Монтаж и логистика",
    orders: [
      {
        id: "cat-3-1",
        requestId: "req-3",
        title: "Срочный монтаж стенда",
        description: "Монтаж за 48 часов, включая ночные смены и координацию с площадкой.",
        budget: "80 000 ₽",
        deadlineLabel: "до 20 янв. 2026",
      },
      {
        id: "cat-3-2",
        requestId: "req-3",
        title: "Доставка конструкций в Казань",
        description: "Грузоперевозка выставочных конструкций и сопутствующего оборудования.",
        budget: "28 000 ₽",
        deadlineLabel: "до 25 февр. 2026",
      },
      {
        id: "cat-3-3",
        requestId: "req-3",
        title: "Монтаж мультимедиа на стенде",
        description: "Установка LED-экранов, интерактивных панелей и настройка контента.",
        budget: "55 000 ₽",
        deadlineLabel: "до 12 марта 2026",
      },
      {
        id: "cat-3-4",
        requestId: "req-3",
        title: "Демонтаж после выставки",
        description: "Быстрый демонтаж конструкций и вывоз материалов с площадки в течение суток.",
        budget: "35 000 ₽",
        deadlineLabel: "до 22 янв. 2026",
      },
      {
        id: "cat-3-5",
        requestId: "req-3",
        title: "Логистика оборудования в Москву",
        description: "Доставка стендового оборудования, мебели и декора на площадку и обратно.",
        budget: "42 000 ₽",
        deadlineLabel: "до 8 марта 2026",
      },
    ],
  },
];

export const CONTRACTOR_REGISTRATION_INTENT_KEY = "registration-intent-contractor";
