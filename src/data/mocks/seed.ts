import type {
  Booking,
  CompanyProfile,
  Contractor,
  Deal,
  Document,
  Event,
  FloorCell,
  MessageThread,
  Notification,
  Participant,
  Payment,
  Request,
  Response,
  Service,
  VenueHall,
} from "@/data/types";

export const DEMO_USERS: Record<string, CompanyProfile> = {
  customer: {
    id: "user-customer",
    name: "ООО «Вымышленная Мебель»",
    inn: "7701234567",
    ogrn: "1027700132195",
    address: "г. Москва, ул. Примерная, д. 1",
    director: "Иванов И.И.",
    mainOkved: "31.09 — Производство прочей мебели",
    additionalOkved: ["46.47 — Торговля мебелью"],
    role: "customer",
    edoStatus: "not_connected",
    moderationStatus: "approved",
    verified: true,
    cities: ["Москва"],
    categories: [],
    hasProduction: true,
    rating: 0,
    reviewCount: 0,
    description: "Производитель выставочной мебели",
  },
  contractor: {
    id: "user-contractor",
    name: "ООО «СтендПро»",
    inn: "7702345678",
    ogrn: "1027700234567",
    address: "г. Москва, ул. Строительная, д. 5",
    director: "Петров П.П.",
    mainOkved: "43.32 — Монтаж инженерных систем",
    additionalOkved: ["74.10 — Дизайн"],
    role: "contractor",
    edoStatus: "connected",
    moderationStatus: "approved",
    verified: true,
    cities: ["Москва", "Санкт-Петербург"],
    categories: ["Комплексное строительство выставочных стендов", "Дизайн-проект выставочного стенда"],
    hasProduction: true,
    rating: 4.8,
    reviewCount: 42,
    description: "Комплексное строительство выставочных стендов",
  },
  venue: {
    id: "user-venue",
    name: "АО «ЭкспоЦентр Вымышленный»",
    inn: "7703456789",
    ogrn: "1027700345678",
    address: "г. Москва, Краснопресненская наб., 14",
    director: "Сидоров С.С.",
    mainOkved: "68.20 — Аренда и управление недвижимостью",
    additionalOkved: [],
    role: "venue",
    edoStatus: "connected",
    moderationStatus: "approved",
    verified: true,
    cities: ["Москва"],
    categories: [],
    hasProduction: false,
    rating: 4.5,
    reviewCount: 18,
    description: "Выставочный комплекс",
  },
  organizer: {
    id: "user-organizer",
    name: "ООО «МебельЭкспо Организатор»",
    inn: "7704567890",
    ogrn: "1027700456789",
    address: "г. Москва, ул. Организаторская, д. 10",
    director: "Козлов К.К.",
    mainOkved: "82.30 — Организация выставок",
    additionalOkved: [],
    role: "organizer",
    edoStatus: "connected",
    moderationStatus: "approved",
    verified: true,
    cities: ["Москва", "Казань"],
    categories: [],
    hasProduction: false,
    rating: 4.6,
    reviewCount: 12,
    description: "Организатор выставок мебели",
  },
};

export const SEED_EVENTS: Event[] = [
  { id: "evt-1", title: "Мебель-2026", city: "Москва", venue: "ЭкспоЦентр", venueId: "venue-1", startDate: "2026-03-15", endDate: "2026-03-18", category: "exhibition", industry: "Мебель и интерьер", description: "Крупнейшая выставка мебели и интерьера", participationTerms: "Регистрация до 01.03.2026", bookingAvailable: true, okvedTags: ["31.09", "мебель"], organizerId: "user-organizer", relatedServiceIds: ["svc-1", "svc-2"] },
  { id: "evt-2", title: "ПромТех 2026", city: "Санкт-Петербург", venue: "ЭкспоФорум", venueId: "venue-2", startDate: "2026-04-10", endDate: "2026-04-13", category: "exhibition", industry: "Промышленность", description: "Промышленные технологии и оборудование", participationTerms: "Стандартный пакет участника", bookingAvailable: true, okvedTags: ["28.", "промышленность"], organizerId: "user-organizer", relatedServiceIds: ["svc-3"] },
  { id: "evt-3", title: "IT Forum Russia", city: "Москва", venue: "Крокус Экспо", venueId: "venue-1", startDate: "2026-05-20", endDate: "2026-05-22", category: "forum", industry: "IT и технологии", description: "Форум информационных технологий", participationTerms: "Онлайн и офлайн участие", bookingAvailable: false, okvedTags: ["62.", "IT"], organizerId: "user-organizer", relatedServiceIds: ["svc-4"] },
  { id: "evt-4", title: "ПродЭкспо 2026", city: "Казань", venue: "Казань Экспо", venueId: "venue-2", startDate: "2026-06-05", endDate: "2026-06-08", category: "exhibition", industry: "Продукты питания", description: "Выставка продуктов питания", participationTerms: "Минимальная площадь 9 кв.м", bookingAvailable: true, okvedTags: ["10.", "питание"], organizerId: "user-organizer", relatedServiceIds: ["svc-5"] },
  { id: "evt-5", title: "Мода и Стиль", city: "Москва", venue: "ЭкспоЦентр", venueId: "venue-1", startDate: "2026-07-12", endDate: "2026-07-15", category: "exhibition", industry: "Мода и текстиль", description: "Международная выставка моды", participationTerms: "Предоплата 30%", bookingAvailable: true, okvedTags: ["14.", "текстиль"], organizerId: "user-organizer", relatedServiceIds: ["svc-6"] },
  { id: "evt-6", title: "СтройИнновации", city: "Екатеринбург", venue: "УралЭкспо", venueId: "venue-2", startDate: "2026-08-20", endDate: "2026-08-23", category: "conference", industry: "Строительство", description: "Конференция строительных инноваций", participationTerms: "Регистрация обязательна", bookingAvailable: true, okvedTags: ["41.", "строительство"], organizerId: "user-organizer", relatedServiceIds: ["svc-7"] },
  { id: "evt-7", title: "МедЭкспо", city: "Новосибирск", venue: "СибЭкспо", venueId: "venue-1", startDate: "2026-09-10", endDate: "2026-09-12", category: "exhibition", industry: "Медицина", description: "Медицинское оборудование и технологии", participationTerms: "Сертификация обязательна", bookingAvailable: true, okvedTags: ["21.", "медицина"], organizerId: "user-organizer", relatedServiceIds: ["svc-8"] },
  { id: "evt-8", title: "АвтоСалон Юг", city: "Краснодар", venue: "ЮгЭкспо", venueId: "venue-2", startDate: "2026-10-05", endDate: "2026-10-08", category: "exhibition", industry: "Автомобили", description: "Автомобильная выставка", participationTerms: "Стандартный договор", bookingAvailable: true, okvedTags: ["29.", "авто"], organizerId: "user-organizer", relatedServiceIds: ["svc-9"] },
];

export const SEED_CONTRACTORS: Contractor[] = [
  { id: "ctr-1", companyId: "comp-1", name: "ООО «СтендПро»", city: "Москва", description: "Комплексное строительство стендов под ключ", categories: ["Комплексное строительство выставочных стендов", "Монтаж"], geography: "Вся Россия", hasProduction: true, rating: 4.8, reviewCount: 42, verified: true, portfolio: [{ id: "p1", title: "Стенд Мебель-2025", year: "2025" }], reviews: [{ id: "r1", author: "ООО «Вымышленная Мебель»", rating: 5, text: "Отличная работа, всё в срок. Стенд собрали за 3 дня, монтажники аккуратные, площадку сдали чистой. Обязательно обратимся снова.", date: "2025-11-01" }, { id: "r2", author: "ООО «ТехноВижн»", rating: 5, text: "Делали стенд 48 кв.м на IT Forum. Дизайн согласовали быстро, производство без задержек. Отдельное спасибо за помощь с логистикой.", date: "2025-09-30" }, { id: "r3", author: "ООО «Альфа»", rating: 4, text: "В целом довольны результатом. Небольшая задержка на этапе производства, но исполнитель предупредил заранее и компенсировал доработками.", date: "2025-06-14" }, { id: "r4", author: "ООО «ПродМаркет»", rating: 5, text: "Профессиональная команда, сделали всё по ТЗ. Конструкции качественные, брендирование ровное. Рекомендуем.", date: "2025-03-22" }] },
  { id: "ctr-2", companyId: "comp-2", name: "ООО «ДизайнСтенд»", city: "Москва", description: "Дизайн-проекты выставочных стендов", categories: ["Дизайн-проект выставочного стенда", "Проектирование"], geography: "Москва, СПб", hasProduction: false, rating: 4.6, reviewCount: 28, verified: true, portfolio: [{ id: "p2", title: "Концепт IT Forum", year: "2025" }], reviews: [] },
  { id: "ctr-3", companyId: "comp-3", name: "ООО «МедиаРент»", city: "Санкт-Петербург", description: "Аренда мультимедиа оборудования", categories: ["Аренда мультимедиа"], geography: "СПб, Москва", hasProduction: true, rating: 4.4, reviewCount: 15, verified: true, portfolio: [], reviews: [] },
  { id: "ctr-4", companyId: "comp-4", name: "ООО «МебельЭкспо»", city: "Москва", description: "Аренда выставочной мебели", categories: ["Аренда мебели"], geography: "Москва", hasProduction: true, rating: 4.7, reviewCount: 35, verified: true, portfolio: [], reviews: [] },
  { id: "ctr-5", companyId: "comp-5", name: "ООО «ЛогистикПро»", city: "Казань", description: "Логистика выставочного оборудования", categories: ["Логистика"], geography: "Вся Россия", hasProduction: false, rating: 4.3, reviewCount: 12, verified: false, portfolio: [], reviews: [] },
  { id: "ctr-6", companyId: "comp-6", name: "ООО «ФлораДекор»", city: "Москва", description: "Флористическое оформление стендов", categories: ["Флористика"], geography: "Москва, СПб", hasProduction: false, rating: 4.9, reviewCount: 22, verified: true, portfolio: [], reviews: [] },
  { id: "ctr-7", companyId: "comp-7", name: "ООО «КлинЭкспо»", city: "Екатеринбург", description: "Клининг выставочных площадок", categories: ["Клининг"], geography: "Урал", hasProduction: false, rating: 4.2, reviewCount: 8, verified: true, portfolio: [], reviews: [] },
  { id: "ctr-8", companyId: "comp-8", name: "ООО «КейтерПро»", city: "Москва", description: "Кейтеринг на мероприятиях", categories: ["Кейтеринг", "Доставка воды"], geography: "Москва", hasProduction: true, rating: 4.5, reviewCount: 19, verified: true, portfolio: [], reviews: [] },
];

export const SEED_SERVICES: Service[] = [
  { id: "svc-1", title: "Дизайн-проект стенда 36 кв.м", city: "Москва", contractorId: "ctr-2", contractorName: "ООО «ДизайнСтенд»", category: "Дизайн-проект выставочного стенда", price: 85000, priceFormat: "фиксированная", description: "Полный дизайн-проект с 3D-визуализацией", terms: "2 раунда правок включены", deadline: "10 рабочих дней", rating: 4.6, reviewCount: 12, variants: [{ id: "v1", name: "Базовый", price: 85000 }, { id: "v2", name: "Премиум", price: 120000 }] },
  { id: "svc-2", title: "Строительство стенда под ключ", city: "Москва", contractorId: "ctr-1", contractorName: "ООО «СтендПро»", category: "Комплексное строительство выставочных стендов", price: 450000, priceFormat: "от", description: "Полный цикл от монтажа до демонтажа", terms: "Предоплата 50%", deadline: "15 рабочих дней", rating: 4.8, reviewCount: 25 },
  { id: "svc-3", title: "Аренда LED-экрана 3x2м", city: "Санкт-Петербург", contractorId: "ctr-3", contractorName: "ООО «МедиаРент»", category: "Аренда мультимедиа", price: 25000, priceFormat: "за день", description: "LED-экран с монтажом", terms: "Минимум 3 дня", deadline: "1 день", rating: 4.4, reviewCount: 8 },
  { id: "svc-4", title: "Аренда мебели для стенда", city: "Москва", contractorId: "ctr-4", contractorName: "ООО «МебельЭкспо»", category: "Аренда мебели", price: 15000, priceFormat: "за комплект", description: "Стол, стулья, витрины", terms: "Доставка включена", deadline: "2 дня", rating: 4.7, reviewCount: 18 },
  { id: "svc-5", title: "Кейтеринг на 50 человек", city: "Москва", contractorId: "ctr-8", contractorName: "ООО «КейтерПро»", category: "Кейтеринг", price: 75000, priceFormat: "фиксированная", description: "Фуршет на 50 персон", terms: "Меню согласуется за 5 дней", deadline: "3 дня", rating: 4.5, reviewCount: 10 },
  { id: "svc-6", title: "Клининг площади 36 кв.м", city: "Москва", contractorId: "ctr-7", contractorName: "ООО «КлинЭкспо»", category: "Клининг", price: 8000, priceFormat: "фиксированная", description: "Уборка до и после выставки", terms: "2 визита", deadline: "1 день", rating: 4.2, reviewCount: 5 },
  { id: "svc-7", title: "Доставка воды 19л x 10", city: "Москва", contractorId: "ctr-8", contractorName: "ООО «КейтерПро»", category: "Доставка воды", price: 3500, priceFormat: "фиксированная", description: "Бутилированная вода", terms: "Доставка в день заказа", deadline: "1 день", rating: 4.3, reviewCount: 7 },
  { id: "svc-8", title: "Флористическое оформление", city: "Москва", contractorId: "ctr-6", contractorName: "ООО «ФлораДекор»", category: "Флористика", price: 45000, priceFormat: "от", description: "Живые цветы для стенда", terms: "Замена при увядании", deadline: "5 дней", rating: 4.9, reviewCount: 14 },
  { id: "svc-9", title: "Хостес (2 человека, 8 часов)", city: "Москва", contractorId: "ctr-8", contractorName: "ООО «КейтерПро»", category: "Хостес и персонал", price: 12000, priceFormat: "фиксированная", description: "Промо-персонал для стенда", terms: "Униформа включена", deadline: "2 дня", rating: 4.4, reviewCount: 6 },
  { id: "svc-10", title: "Разработка контента для экранов", city: "Москва", contractorId: "ctr-2", contractorName: "ООО «ДизайнСтенд»", category: "Разработка контента", price: 35000, priceFormat: "фиксированная", description: "Видео и графика для LED", terms: "2 итерации", deadline: "7 дней", rating: 4.5, reviewCount: 9 },
  { id: "svc-11", title: "Логистика оборудования", city: "Казань", contractorId: "ctr-5", contractorName: "ООО «ЛогистикПро»", category: "Логистика", price: 28000, priceFormat: "от", description: "Доставка и монтаж", terms: "Страхование груза", deadline: "5 дней", rating: 4.3, reviewCount: 4 },
  { id: "svc-12", title: "Монтаж конструкций", city: "Москва", contractorId: "ctr-1", contractorName: "ООО «СтендПро»", category: "Монтаж", price: 65000, priceFormat: "фиксированная", description: "Монтаж выставочных конструкций", terms: "Бригада 4 человека", deadline: "3 дня", rating: 4.7, reviewCount: 16 },
];

export const SEED_REQUESTS: Request[] = [
  { id: "req-1", title: "Стенд 36 кв.м на Мебель-2026", format: "open_request", category: "Комплексное строительство выставочных стендов", city: "Москва", cities: ["Москва"], status: "published", budget: { type: "range", min: 400000, max: 600000 }, deadline: "2026-02-15", description: "Нужен стенд для выставки мебели", requirements: "Зона переговоров, витрины", expectedResult: "Готовый стенд к открытию", eventId: "evt-1", invitedContractorIds: [], responseCount: 3, publishedAt: "2026-01-10", customerId: "user-customer", torSections: [{ id: "t1", title: "Общие требования", content: "Площадь 36 кв.м", required: true }], files: ["tz-draft.pdf"], history: [{ date: "2026-01-10", action: "Опубликована" }] },
  { id: "req-2", title: "Дизайн-проект для IT Forum", format: "closed_request", category: "Дизайн-проект выставочного стенда", city: "Москва", cities: ["Москва"], status: "published", budget: { type: "fixed", min: 100000 }, deadline: "2026-04-01", description: "Дизайн стенда IT-компании", requirements: "Минимализм, технологичность", expectedResult: "3D-визуализация", eventId: "evt-3", invitedContractorIds: ["ctr-1", "ctr-2"], responseCount: 2, publishedAt: "2026-01-05", customerId: "user-customer", torSections: [], files: [], history: [{ date: "2026-01-05", action: "Опубликована" }] },
  { id: "req-3", title: "Срочный монтаж стенда", format: "urgent", category: "Монтаж", city: "Москва", cities: ["Москва"], status: "in_progress", budget: { type: "fixed", min: 80000 }, deadline: "2026-01-20", description: "Срочный монтаж за 2 дня", requirements: "Работа в ночное время", expectedResult: "Смонтированный стенд", invitedContractorIds: [], responseCount: 1, publishedAt: "2026-01-15", customerId: "user-customer", torSections: [], files: [], history: [] },
  { id: "req-4", title: "Кейтеринг на ПродЭкспо", format: "safe_deal", category: "Кейтеринг", city: "Казань", cities: ["Казань"], status: "published", budget: { type: "hidden" }, deadline: "2026-05-30", description: "Кейтеринг для 100 человек", requirements: "Вегетарианское меню", expectedResult: "Организованный фуршет", eventId: "evt-4", invitedContractorIds: [], responseCount: 1, publishedAt: "2026-01-08", customerId: "user-customer", torSections: [], files: [], history: [] },
  { id: "req-5", title: "Черновик: LED-экран", format: "open_request", category: "Аренда мультимедиа", city: "Санкт-Петербург", cities: ["Санкт-Петербург"], status: "draft", budget: { type: "request_quote" }, deadline: "2026-03-01", description: "Аренда экрана", requirements: "", expectedResult: "", invitedContractorIds: [], responseCount: 0, customerId: "user-customer", torSections: [], files: [], history: [] },
  { id: "req-6", title: "Флористика для Мода и Стиль", format: "open_request", category: "Флористика", city: "Москва", cities: ["Москва"], status: "completed", budget: { type: "fixed", min: 50000 }, deadline: "2026-06-30", description: "Оформление стенда цветами", requirements: "Пастельные тона", expectedResult: "Оформленный стенд", eventId: "evt-5", invitedContractorIds: [], responseCount: 2, publishedAt: "2025-12-01", customerId: "user-customer", torSections: [], files: [], history: [{ date: "2025-12-15", action: "Завершена" }] },
];

export const SEED_RESPONSES: Response[] = [
  { id: "res-1", requestId: "req-1", contractorId: "ctr-1", contractorName: "ООО «СтендПро»", price: 520000, deadline: "14 дней", terms: "Предоплата 50%", comment: "Готовы выполнить в срок", approach: "Стандартная конструкция с брендированием", status: "pending", rating: 4.8, validUntil: "2026-02-01", estimate: [{ id: "es1", title: "Конструкция", items: [{ id: "i1", name: "Стенды", quantity: 1, unit: "компл.", price: 300000, hidden: false }] }], files: ["estimate.pdf"] },
  { id: "res-2", requestId: "req-1", contractorId: "ctr-2", contractorName: "ООО «ДизайнСтенд»", price: 480000, deadline: "16 дней", terms: "Поэтапная оплата", comment: "Уникальный дизайн", approach: "Авторский проект", status: "pending", rating: 4.6, validUntil: "2026-02-01", estimate: [{ id: "es2", title: "Дизайн", items: [{ id: "i2", name: "Проект", quantity: 1, unit: "шт.", price: 85000, hidden: false }] }], files: [] },
  { id: "res-3", requestId: "req-2", contractorId: "ctr-2", contractorName: "ООО «ДизайнСтенд»", price: 95000, deadline: "10 дней", terms: "Фиксированная цена", comment: "", approach: "Минималистичный стиль", status: "pending", rating: 4.6, validUntil: "2026-03-15", estimate: [], files: [] },
  { id: "res-4", requestId: "req-3", contractorId: "ctr-1", contractorName: "ООО «СтендПро»", price: 85000, deadline: "2 дня", terms: "100% предоплата", comment: "Можем начать сегодня", approach: "Ночной монтаж", status: "accepted", rating: 4.8, validUntil: "2026-01-18", estimate: [], files: [] },
  { id: "res-5", requestId: "req-4", contractorId: "ctr-8", contractorName: "ООО «КейтерПро»", price: 120000, deadline: "1 день", terms: "По факту", comment: "Меню на выбор", approach: "Фуршет + напитки", status: "pending", rating: 4.5, validUntil: "2026-05-01", estimate: [], files: [] },
];

export const SEED_DEALS: Deal[] = [
  { id: "deal-1", number: "СД-2026-001", title: "Стенд 36 кв.м на Мебель-2026", format: "open_request", customerId: "user-customer", customerName: "ООО «Вымышленная Мебель»", contractorId: "ctr-1", contractorName: "ООО «СтендПро»", totalPrice: 520000, status: "in_progress", requestId: "req-1", commission: 26000, documents: ["doc-1", "doc-2"], stages: [{ id: "st1", title: "Дизайн-проект", description: "Разработка дизайна", price: 85000, deadline: "2026-01-25", status: "accepted", files: ["design.pdf"], comments: [] }, { id: "st2", title: "Производство", description: "Изготовление конструкций", price: 250000, deadline: "2026-02-10", status: "in_progress", files: [], comments: [] }, { id: "st3", title: "Монтаж", description: "Монтаж на площадке", price: 185000, deadline: "2026-02-14", status: "pending", files: [], comments: [] }], history: [{ date: "2026-01-12", action: "Сделка создана", actor: "Система" }, { date: "2026-01-13", action: "Оплата внесена", actor: "Заказчик" }] },
  { id: "deal-2", number: "СД-2026-002", title: "Срочный монтаж стенда", format: "urgent", customerId: "user-customer", customerName: "ООО «Вымышленная Мебель»", contractorId: "ctr-1", contractorName: "ООО «СтендПро»", totalPrice: 85000, status: "stage_review", requestId: "req-3", commission: 4250, documents: ["doc-3"], stages: [{ id: "st4", title: "Монтаж", description: "Срочный монтаж", price: 85000, deadline: "2026-01-18", status: "review", result: "Монтаж завершён", files: ["photo-report.pdf"], comments: [] }], history: [{ date: "2026-01-16", action: "Результат передан", actor: "Исполнитель" }] },
  { id: "deal-3", number: "СД-2026-003", title: "Аренда мебели", format: "safe_deal", customerId: "user-customer", customerName: "ООО «Вымышленная Мебель»", contractorId: "ctr-4", contractorName: "ООО «МебельЭкспо»", totalPrice: 15000, status: "negotiation", commission: 750, documents: [], stages: [{ id: "st5", title: "Доставка и установка", description: "Комплект мебели", price: 15000, deadline: "2026-02-01", status: "pending", files: [], comments: [] }], history: [] },
  { id: "deal-4", number: "СД-2025-098", title: "Флористика Мода и Стиль", format: "open_request", customerId: "user-customer", customerName: "ООО «Вымышленная Мебель»", contractorId: "ctr-6", contractorName: "ООО «ФлораДекор»", totalPrice: 48000, status: "completed", requestId: "req-6", commission: 2400, documents: ["doc-4"], stages: [{ id: "st6", title: "Оформление", description: "Флористика", price: 48000, deadline: "2025-07-10", status: "accepted", files: [], comments: [] }], history: [{ date: "2025-07-12", action: "Сделка завершена", actor: "Система" }] },
  { id: "deal-5", number: "СД-2025-097", title: "LED-экран ПромТех", format: "safe_deal", customerId: "user-customer", customerName: "ООО «Вымышленная Мебель»", contractorId: "ctr-3", contractorName: "ООО «МедиаРент»", totalPrice: 75000, status: "completed", commission: 3750, documents: ["doc-5"], stages: [{ id: "st7", title: "Аренда", description: "3 дня аренды", price: 75000, deadline: "2025-04-12", status: "accepted", files: [], comments: [] }], history: [{ date: "2025-04-15", action: "Сделка завершена", actor: "Система" }] },
  { id: "deal-6", number: "СД-2025-095", title: "Стенд 48 кв.м на IT Forum 2025", format: "safe_deal", customerId: "user-customer", customerName: "ООО «ТехноВижн»", contractorId: "ctr-1", contractorName: "ООО «СтендПро»", totalPrice: 610000, status: "completed", commission: 30500, documents: ["doc-7", "doc-8"], stages: [{ id: "st8", title: "Дизайн-проект", description: "3D-визуализация и чертежи", price: 90000, deadline: "2025-09-05", status: "accepted", files: ["design-final.pdf"], comments: [] }, { id: "st9", title: "Производство", description: "Изготовление конструкций", price: 340000, deadline: "2025-09-20", status: "accepted", files: [], comments: [] }, { id: "st10", title: "Монтаж и сдача", description: "Монтаж на площадке", price: 180000, deadline: "2025-09-28", status: "accepted", result: "Стенд сдан заказчику, подписан акт", files: ["photo-report-final.pdf"], comments: [] }], history: [{ date: "2025-08-25", action: "Сделка создана", actor: "Система" }, { date: "2025-08-26", action: "Оплата зарезервирована", actor: "Заказчик" }, { date: "2025-09-29", action: "Работы приняты", actor: "Заказчик" }, { date: "2025-09-30", action: "Сделка завершена, отзыв 5.0", actor: "Система" }] },
];

export const SEED_DOCUMENTS: Document[] = [
  { id: "doc-1", type: "Договор", number: "ДГ-001/2026", dealId: "deal-1", date: "2026-01-12", parties: "Заказчик — Исполнитель", status: "signed", direction: "incoming" },
  { id: "doc-2", type: "Счёт", number: "СЧ-001/2026", dealId: "deal-1", date: "2026-01-13", parties: "Заказчик", status: "signed", direction: "outgoing" },
  { id: "doc-3", type: "Акт", number: "АК-002/2026", dealId: "deal-2", date: "2026-01-16", parties: "Заказчик — Исполнитель", status: "sent", direction: "incoming" },
  { id: "doc-4", type: "УПД", number: "УПД-098/2025", dealId: "deal-4", date: "2025-07-12", parties: "Заказчик — Исполнитель", status: "archived", direction: "outgoing" },
  { id: "doc-5", type: "Договор", number: "ДГ-097/2025", dealId: "deal-5", date: "2025-04-01", parties: "Заказчик — Исполнитель", status: "archived", direction: "incoming" },
  { id: "doc-6", type: "Счёт", number: "СЧ-003/2026", dealId: "deal-3", date: "2026-01-20", parties: "Заказчик", status: "draft", direction: "outgoing" },
  { id: "doc-7", type: "Договор", number: "ДГ-095/2025", dealId: "deal-6", date: "2025-08-26", parties: "Заказчик — Исполнитель", status: "archived", direction: "incoming" },
  { id: "doc-8", type: "УПД", number: "УПД-095/2025", dealId: "deal-6", date: "2025-09-30", parties: "Заказчик — Исполнитель", status: "archived", direction: "outgoing" },
];

export const SEED_PAYMENTS: Payment[] = [
  { id: "pay-1", dealId: "deal-1", type: "Резерв", amount: 520000, status: "reserved", date: "2026-01-13", description: "Безопасная сделка" },
  { id: "pay-2", dealId: "deal-1", type: "Выплата", amount: 85000, status: "paid", date: "2026-01-20", description: "Этап: Дизайн-проект" },
  { id: "pay-3", dealId: "deal-2", type: "Резерв", amount: 85000, status: "reserved", date: "2026-01-15", description: "Срочный заказ" },
  { id: "pay-4", dealId: "deal-3", type: "Счёт к оплате", amount: 15000, status: "pending", date: "2026-01-20", description: "Ожидает оплаты" },
  { id: "pay-5", dealId: "deal-4", type: "Выплата", amount: 45600, status: "paid", date: "2025-07-12", description: "Завершённая сделка" },
  { id: "pay-6", dealId: "deal-6", type: "Выплата", amount: 579500, status: "paid", date: "2025-09-30", description: "Завершённая сделка: Стенд IT Forum 2025" },
];

export const SEED_NOTIFICATIONS: Notification[] = [
  { id: "notif-1", title: "Новый отклик", message: "ООО «СтендПро» откликнулся на заявку", priority: "action_required", read: false, date: "2026-01-11", link: "/requests/req-1/responses", category: "responses" },
  { id: "notif-2", title: "Этап принят", message: "Дизайн-проект по сделке СД-2026-001 принят", priority: "info", read: false, date: "2026-01-21", link: "/deals/deal-1", category: "deals" },
  { id: "notif-3", title: "Срок приближается", message: "Дедлайн монтажа через 3 дня", priority: "deadline", read: true, date: "2026-01-17", link: "/deals/deal-1", category: "deals" },
  { id: "notif-4", title: "Документ на подпись", message: "Акт по сделке СД-2026-002", priority: "action_required", read: false, date: "2026-01-16", link: "/documents", category: "documents" },
  { id: "notif-5", title: "Подключите ЭДО", message: "Для подписания документов подключите ЭДО", priority: "info", read: true, date: "2026-01-10", link: "/account/customer/edo", category: "system" },
];

export const SEED_MESSAGES: MessageThread[] = [
  { id: "msg-1", title: "Сделка СД-2026-001", relatedType: "deal", relatedId: "deal-1", relatedLink: "/deals/deal-1", lastMessage: "Когда будет готов дизайн?", lastDate: "2026-01-18", unread: 1, messages: [{ id: "m1", sender: "ООО «Вымышленная Мебель»", text: "Когда будет готов дизайн?", date: "2026-01-18", files: [] }, { id: "m2", sender: "ООО «СтендПро»", text: "К пятнице отправим финальную версию", date: "2026-01-18", files: ["preview.pdf"] }] },
  { id: "msg-2", title: "Заявка: Стенд 36 кв.м", relatedType: "request", relatedId: "req-1", relatedLink: "/requests/req-1", lastMessage: "Уточните размеры зоны переговоров", lastDate: "2026-01-11", unread: 0, messages: [{ id: "m3", sender: "ООО «ДизайнСтенд»", text: "Уточните размеры зоны переговоров", date: "2026-01-11", files: [] }] },
  { id: "msg-3", title: "Поддержка", relatedType: "support", relatedId: "support", relatedLink: "/messages/msg-3", lastMessage: "Добро пожаловать на платформу!", lastDate: "2026-01-01", unread: 0, messages: [{ id: "m4", sender: "Поддержка", text: "Добро пожаловать на платформу!", date: "2026-01-01", files: [] }] },
];

export const SEED_HALLS: VenueHall[] = [
  { id: "hall-1", venueId: "venue-1", name: "Павильон 1", area: 5000, capacity: 200, available: true },
  { id: "hall-2", venueId: "venue-1", name: "Павильон 2", area: 3000, capacity: 120, available: true },
  { id: "hall-3", venueId: "venue-2", name: "Зал А", area: 2000, capacity: 80, available: true },
  { id: "hall-4", venueId: "venue-2", name: "Зал Б", area: 1500, capacity: 60, available: false },
];

export const SEED_FLOOR_CELLS: FloorCell[] = Array.from({ length: 24 }, (_, i) => ({
  id: `cell-${i + 1}`,
  label: `${String.fromCharCode(65 + Math.floor(i / 6))}${(i % 6) + 1}`,
  status: (i % 5 === 0 ? "booked" : i % 7 === 0 ? "unavailable" : "free") as FloorCell["status"],
  hallId: "hall-1",
}));

export const SEED_BOOKINGS: Booking[] = [
  { id: "book-1", eventId: "evt-1", venueId: "venue-1", cellId: "cell-1", customerId: "user-customer", status: "confirmed", date: "2026-01-05" },
  { id: "book-2", eventId: "evt-1", venueId: "venue-1", cellId: "cell-6", customerId: "user-customer", status: "pending", date: "2026-01-18" },
];

export const SEED_PARTICIPANTS: Participant[] = [
  { id: "part-1", eventId: "evt-1", name: "ООО «Вымышленная Мебель»", status: "Подтверждён", assignedSpace: "A1", paid: true, documents: ["contract.pdf"] },
  { id: "part-2", eventId: "evt-1", name: "ООО «СтендПро»", status: "На модерации", assignedSpace: "B3", paid: false, documents: [] },
  { id: "part-3", eventId: "evt-1", name: "ООО «ДизайнСтенд»", status: "Подтверждён", assignedSpace: "C2", paid: true, documents: ["contract.pdf", "invoice.pdf"] },
];

export function getSeedData() {
  return {
    events: SEED_EVENTS,
    contractors: SEED_CONTRACTORS,
    services: SEED_SERVICES,
    requests: SEED_REQUESTS,
    responses: SEED_RESPONSES,
    deals: SEED_DEALS,
    documents: SEED_DOCUMENTS,
    payments: SEED_PAYMENTS,
    notifications: SEED_NOTIFICATIONS,
    messages: SEED_MESSAGES,
    halls: SEED_HALLS,
    floorCells: SEED_FLOOR_CELLS,
    bookings: SEED_BOOKINGS,
    participants: SEED_PARTICIPANTS,
  };
}
