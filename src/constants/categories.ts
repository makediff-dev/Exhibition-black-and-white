export const SERVICE_CATEGORIES = [
  "Комплексное строительство выставочных стендов",
  "Дизайн-проект выставочного стенда",
  "Проектирование",
  "Аренда мультимедиа",
  "Аренда мебели",
  "Логистика",
  "Флористика",
  "Клининг",
  "Заказ вывески",
  "Корпоративные музеи",
  "Дизайн офиса",
  "Уличные конструкции",
  "Световые инсталляции",
  "Кейтеринг",
  "Доставка воды",
  "Хостес и персонал",
  "Разработка контента",
  "Монтаж",
  "Другие сопутствующие услуги",
];

export const POPULAR_SERVICE_CATEGORIES = [
  ...SERVICE_CATEGORIES.slice(0, 14),
  "Больше услуг",
];

export const EVENT_INDUSTRIES = [
  "Мебель и интерьер",
  "Промышленность",
  "IT и технологии",
  "Продукты питания",
  "Мода и текстиль",
  "Строительство",
  "Медицина",
  "Автомобили",
];

export const CITIES = [
  "Москва",
  "Санкт-Петербург",
  "Казань",
  "Екатеринбург",
  "Новосибирск",
  "Краснодар",
  "Нижний Новгород",
  "Ростов-на-Дону",
];

export const FEDERAL_DISTRICTS: Record<string, string[]> = {
  "Центральный": ["Москва"],
  "Северо-Западный": ["Санкт-Петербург"],
  "Приволжский": ["Казань", "Нижний Новгород"],
  "Уральский": ["Екатеринбург"],
  "Сибирский": ["Новосибирск"],
  "Южный": ["Краснодар", "Ростов-на-Дону"],
};

export const FEDERAL_DISTRICT_OPTIONS = Object.keys(FEDERAL_DISTRICTS);

export function getDistrictByCity(city: string) {
  return FEDERAL_DISTRICT_OPTIONS.find((district) => FEDERAL_DISTRICTS[district].includes(city)) ?? "";
}

export function getCitiesByDistrict(district: string) {
  if (!district) return CITIES;
  return FEDERAL_DISTRICTS[district] ?? [];
}

export const TEST_INN = "7701234567";

export const TEST_COMPANY_DATA = {
  name: "ООО «Вымышленная Мебель»",
  ogrn: "1027700132195",
  address: "г. Москва, ул. Примерная, д. 1, офис 100",
  director: "Иванов Иван Иванович",
  mainOkved: "31.09 — Производство прочей мебели",
  additionalOkved: [
    "46.47 — Торговля мебелью",
    "43.32 — Монтаж инженерных систем",
  ],
};
